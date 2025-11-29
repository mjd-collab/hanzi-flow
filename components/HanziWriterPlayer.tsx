import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { HanziWriterInstance } from '../types';
import { getCharacterInfo, CharacterMetadata } from '../services/dictionaryService';

interface HanziWriterPlayerProps {
  character: string;
  size?: number;
  isPlaying?: boolean;
  isQuizMode?: boolean;
  onAnimationComplete?: () => void;
}

const HanziWriterPlayer: React.FC<HanziWriterPlayerProps> = ({ 
  character, 
  size = 300, 
  isPlaying,
  isQuizMode,
  onAnimationComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<CharacterMetadata | null>(null);

  // Initialize Writer and Metadata
  useEffect(() => {
    if (!containerRef.current || !character) return;

    setIsLoading(true);
    setMetadata(null);
    containerRef.current.innerHTML = '';

    try {
        const writer = HanziWriter.create(containerRef.current, character, {
            width: size,
            height: size,
            padding: 15,
            strokeColor: '#1a1a1a', // ink-900
            radicalColor: '#c0392b', // accent
            showOutline: true,
            outlineColor: '#e5e7eb',
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 200,
            delayBetweenLoops: 2000,
            highlightColor: '#c0392b',
            showHintAfterMisses: 3,
        });

        writerRef.current = writer as unknown as HanziWriterInstance;
        setIsLoading(false);
        
        // Initial state set
        if (isQuizMode) {
            writerRef.current.quiz({});
        } else if (isPlaying) {
             writerRef.current.loopCharacterAnimation();
        }
        
        // Fetch Metadata using local dictionary
        getCharacterInfo(character).then(data => {
            setMetadata(data);
        });

    } catch (e) {
        console.error("Failed to load HanziWriter", e);
        setIsLoading(false);
    }

  }, [character, size]);

  // Handle Play/Stop/Quiz State Changes
  useEffect(() => {
    if (writerRef.current) {
        // Always cancel existing actions first
        writerRef.current.cancelQuiz();

        if (isQuizMode) {
            writerRef.current.quiz({});
        } else {
            if (isPlaying) {
                writerRef.current.loopCharacterAnimation();
            } else {
                writerRef.current.showCharacter();
            }
        }
    }
  }, [isPlaying, isQuizMode]);

  const speakCharacter = () => {
      if (!character) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(character);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-2">
        {/* Character Card */}
        <div className="relative flex flex-col items-center justify-center p-2 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 ring-1 ring-stone-900/5 transition-all duration-500">
            {/* Mi Zi Ge SVG */}
            <div className="absolute inset-3 pointer-events-none z-0">
                <svg width="100%" height="100%" className="opacity-30">
                    <rect width="100%" height="100%" fill="none" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="#c0392b" strokeWidth="1" strokeDasharray="6 4" />
                </svg>
            </div>
            
            {/* Quiz Mode Indicator */}
            {isQuizMode && (
              <div className="absolute top-4 right-4 z-20 bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-md border border-accent/20 animate-pulse">
                练习模式
              </div>
            )}

            <div ref={containerRef} className="z-10 relative drop-shadow-2xl" />
        </div>
        
        {/* Metadata Section */}
        <div className="w-full max-w-sm flex flex-col items-center gap-2 px-4 mt-2">
            {/* Metadata Bar */}
            <div className="flex items-center justify-center gap-4 text-stone-600 font-serif text-sm w-full">
                <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full border border-stone-200/30 shadow-sm">
                    <span className="text-stone-400 text-xs uppercase scale-90">偏旁</span>
                    <span className="font-bold text-ink-900">{metadata ? metadata.radical : '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1 rounded-full border border-stone-200/30 shadow-sm">
                    <span className="text-stone-400 text-xs uppercase scale-90">笔画</span>
                    <span className="font-bold text-ink-900">{metadata ? metadata.strokes : '-'}</span>
                </div>
            </div>

            {/* Pinyin, Pronunciation & Definition - Merged Line */}
            <div className="flex flex-row flex-wrap items-center justify-center gap-2 text-center w-full px-2 py-2 bg-white/30 rounded-xl border border-white/40 shadow-sm min-h-[44px]">
                <button 
                    onClick={speakCharacter}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-white bg-accent shadow-md active:scale-95 transition-all mr-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10.05 3.691c.902-.953 2.502-.266 2.502 1.074v10.47c0 1.34-1.6 2.027-2.502 1.074l-4.225-4.463H3.272A2.25 2.25 0 0 1 1.05 9.615v-.73c0-1.18.91-2.164 2.09-2.201l2.685-.084 4.225-4.909Zm3.784 1.765a.75.75 0 0 1 1.06 0 4.5 4.5 0 0 1 0 9.088.75.75 0 1 1-1.06-1.06 3 3 0 0 0 0-6.968.75.75 0 0 1 0-1.06Z" />
                    </svg>
                </button>

                {metadata && metadata.pinyin.length > 0 && (
                     metadata.pinyin.map((py, i) => (
                        <span key={i} className="text-lg font-serif font-bold text-accent">
                            {py}
                        </span>
                    ))
                )}
                
                {metadata && metadata.definition && (
                    <>
                        <span className="text-stone-300 mx-1">|</span>
                        <span className="text-stone-600 text-sm font-serif truncate max-w-[150px]">
                            {metadata.definition}
                        </span>
                    </>
                )}
            </div>

            {/* Words */}
            {metadata && metadata.words.length > 0 && (
                <div className="flex justify-center flex-wrap gap-2 text-sm text-stone-500 font-serif">
                     {metadata.words.map((w, i) => (
                         <span key={i} className="bg-stone-100/80 px-2 py-0.5 rounded text-ink-800 border border-stone-200/50">
                             {w}
                         </span>
                     ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default HanziWriterPlayer;