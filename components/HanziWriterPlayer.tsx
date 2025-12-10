import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { HanziWriterInstance, QuizMode } from '../types';
import { getCharacterInfo, CharacterMetadata, getStrokeNames } from '../services/dictionaryService';

interface HanziWriterPlayerProps {
  character: string;
  size?: number;
  isPlaying?: boolean;
  quizMode: QuizMode;
  gridType: 'mi' | 'tian'; 
  strokeAudioEnabled: boolean;
  onAnimationComplete?: () => void;
}

const HanziWriterPlayer: React.FC<HanziWriterPlayerProps> = ({ 
  character, 
  size = 300, 
  isPlaying,
  quizMode,
  gridType,
  strokeAudioEnabled,
  onAnimationComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const strokeNamesRef = useRef<string[]>([]);
  const audioEnabledRef = useRef(strokeAudioEnabled);
  const [metadata, setMetadata] = useState<CharacterMetadata | null>(null);

  // Keep ref in sync for callbacks
  useEffect(() => {
    audioEnabledRef.current = strokeAudioEnabled;
  }, [strokeAudioEnabled]);

  const speakStroke = (strokeNum: number) => {
      if (!audioEnabledRef.current) return;
      const names = strokeNamesRef.current;
      if (names && names[strokeNum]) {
          // Cancel previous stroke sound immediately
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(names[strokeNum]);
          u.lang = 'zh-CN';
          u.rate = 1.5; // Fast enough for sync
          window.speechSynthesis.speak(u);
      }
  };

  // Initialize Writer and Metadata
  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';
    setMetadata(null);
    strokeNamesRef.current = [];

    if (!character) {
        writerRef.current = null;
        return;
    }

    try {
        // Load stroke names immediately
        strokeNamesRef.current = getStrokeNames(character);

        const writer = HanziWriter.create(containerRef.current, character, {
            width: size,
            height: size,
            padding: 10,
            strokeColor: '#1a1a1a', 
            radicalColor: '#c0392b', 
            showOutline: true,
            outlineColor: '#d6d3d1',
            strokeAnimationSpeed: 0.7, // Slowed slightly for audio sync
            delayBetweenStrokes: 400, // Pause for audio to finish
            delayBetweenLoops: 2000,
            highlightColor: '#c0392b',
            showHintAfterMisses: 3,
            drawingWidth: 20, // Reduced to 20 as requested
        });

        writerRef.current = writer as unknown as HanziWriterInstance;
        
        getCharacterInfo(character).then(data => {
            setMetadata(data);
        });

        // Initialize Audio
        window.speechSynthesis.getVoices();

    } catch (e) {
        console.error("Failed to load HanziWriter", e);
    }

  }, [character, size]);

  // Handle Play/Stop/Quiz
  useEffect(() => {
    if (!writerRef.current) return;
    
    // Stop any existing animation/quiz
    writerRef.current.cancelQuiz();
    // We can't easily cancel animateCharacter, but calling showCharacter resets state
    writerRef.current.showCharacter();

    if (quizMode !== 'none') {
        // --- PRACTICE MODE ---
        const quizOptions = {
            showOutline: true,
            showHintAfterMisses: 0, // Immediate hint
            highlightOnComplete: true,
            drawingWidth: 20,
            onCorrectStroke: (data: { strokeNum: number }) => {
                speakStroke(data.strokeNum);
            }
        };
        writerRef.current.quiz(quizOptions);

    } else if (isPlaying) {
        // --- DEMO MODE (With Audio Sync) ---
        // We use a loop function to restart animation after it completes
        const loop = () => {
            writerRef.current?.animateCharacter({
                onStrokeStart: (data: { strokeNum: number }) => {
                    speakStroke(data.strokeNum);
                },
                onComplete: () => {
                    setTimeout(loop, 2000); // Wait 2s then loop
                }
            });
        };
        loop();

    } else {
        // --- IDLE MODE ---
        writerRef.current.showCharacter();
    }
  }, [isPlaying, quizMode, character]); // Re-run when these change

  const speakCharacter = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!character) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(character);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-1 animate-in fade-in duration-500 w-full">
        
        {/* Pinyin */}
        <div className={`flex items-center gap-2 min-h-[32px] transition-opacity duration-300 ${character ? 'opacity-100' : 'opacity-0'}`}>
            <button 
                onClick={speakCharacter}
                disabled={!character}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all active:scale-90 disabled:opacity-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                </svg>
            </button>
            <div className="flex gap-2">
                {metadata && metadata.pinyin.length > 0 ? (
                    metadata.pinyin.map((py, i) => (
                        <span key={i} className="text-xl font-serif font-bold text-accent">
                            {py}
                        </span>
                    ))
                ) : (
                    <span className="text-xl font-serif font-bold text-transparent select-none">-</span>
                )}
            </div>
        </div>

        {/* Character Card */}
        <div className="relative flex flex-col items-center justify-center p-1.5 bg-paper rounded-3xl shadow-xl border border-stone-200 ring-4 ring-white transition-all duration-500">
            {/* Grid SVG Background */}
            <div className="absolute inset-3 pointer-events-none z-0">
                <svg width="100%" height="100%" className="opacity-30">
                    <rect width="100%" height="100%" fill="none" stroke="#c0392b" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    {gridType === 'mi' && (
                        <>
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                        </>
                    )}
                </svg>
            </div>
            
            {character && quizMode !== 'none' && (
              <div className="absolute top-2 right-2 z-20 bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full border border-accent/20 animate-pulse">
                练习
              </div>
            )}

            <div ref={containerRef} className="z-10 relative drop-shadow-lg" style={{ width: size, height: size }} />
        </div>
        
        {/* Metadata Section */}
        <div className={`w-full max-w-md flex flex-col gap-1 px-2 mt-1 transition-opacity duration-300 ${character ? 'opacity-100' : 'opacity-0'}`}>
            <div className="grid grid-cols-4 divide-x divide-stone-200 bg-white rounded-xl shadow-sm border border-stone-100 py-1.5">
                 <div className="flex flex-col items-center px-1">
                    <span className="text-[10px] text-stone-400">偏旁</span>
                    <span className="font-serif text-lg text-accent font-bold leading-tight">{metadata ? metadata.radical : '-'}</span>
                 </div>
                 <div className="flex flex-col items-center px-1">
                    <span className="text-[10px] text-stone-400">总笔画</span>
                    <span className="font-serif text-base text-ink-900 font-bold leading-tight">{metadata ? metadata.totalStrokes : '-'}</span>
                 </div>
                 <div className="flex flex-col items-center px-1">
                    <span className="text-[10px] text-stone-400">部首笔画</span>
                    <span className="font-serif text-base text-ink-900 font-bold leading-tight">{metadata ? metadata.radicalStrokes : '-'}</span>
                 </div>
                 <div className="flex flex-col items-center px-1">
                    <span className="text-[10px] text-stone-400">剩余笔画</span>
                    <span className="font-serif text-base text-ink-900 font-bold leading-tight">{metadata ? metadata.remainingStrokes : '-'}</span>
                 </div>
            </div>

            {metadata && metadata.definition && (
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-stone-100 flex items-start gap-2">
                    <span className="text-xs text-stone-400 font-bold mt-0.5 shrink-0">释义</span>
                    <span className="text-sm text-stone-600 font-serif leading-snug line-clamp-2">
                        {metadata.definition}
                    </span>
                </div>
            )}

            {metadata && metadata.words.length > 0 && (
                <div className="flex flex-col gap-1">
                     <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                     {metadata.words.map((w, i) => (
                         <div key={i} className="flex flex-col items-center bg-stone-50 px-2 py-1 rounded-lg border border-stone-200/50 shrink-0 min-w-[50px]">
                             <span className="text-[10px] text-stone-500 font-sans mb-0.5">{w.pinyin}</span>
                             <span className="text-sm text-ink-800 font-serif font-bold">{w.text}</span>
                         </div>
                     ))}
                     </div>
                </div>
            )}
            {!metadata && <div className="h-20"></div>}
        </div>
    </div>
  );
};

export default HanziWriterPlayer;