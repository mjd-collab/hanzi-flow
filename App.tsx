import React, { useState, useEffect } from 'react';
import HanziWriterPlayer from './components/HanziWriterPlayer';
import ControlPanel from './components/ControlPanel';
import { QuizMode } from './types';

const App: React.FC = () => {
  const [characterList, setCharacterList] = useState<string[]>(['沐', '沐', '小', '黑', '板']);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerSize, setPlayerSize] = useState<number>(300);
  
  // Grid switching
  const [gridType, setGridType] = useState<'mi' | 'tian'>(() => {
    return (localStorage.getItem('gridType') as 'mi' | 'tian') || 'mi';
  });

  // Quiz Mode
  const [quizMode, setQuizMode] = useState<QuizMode>(() => {
      const stored = localStorage.getItem('quizMode') as string;
      if (stored === 'hint' || stored === 'none') {
        return stored as QuizMode;
      }
      return 'none';
  });

  // Audio Toggle
  const [strokeAudioEnabled, setStrokeAudioEnabled] = useState<boolean>(() => {
      return localStorage.getItem('strokeAudioEnabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gridType', gridType);
  }, [gridType]);

  useEffect(() => {
    localStorage.setItem('quizMode', quizMode);
  }, [quizMode]);

  useEffect(() => {
    localStorage.setItem('strokeAudioEnabled', String(strokeAudioEnabled));
  }, [strokeAudioEnabled]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      
      if (width < 640 && !isLandscape) { 
        setPlayerSize(width * 0.48); 
      } else if (isLandscape) {
        setPlayerSize(Math.min(300, height * 0.40));
      } else { 
        setPlayerSize(Math.min(350, height * 0.30)); 
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleAddCharacters = (chars: string) => {
    const newChars = chars.split('');
    setCharacterList(prev => [...prev, ...newChars]);
    setSelectedIndex(characterList.length); 
  };

  const handlePlay = () => {
      setQuizMode('none');
      setIsPlaying(true);
  };
  
  const handleSetQuizMode = (mode: QuizMode) => {
      setQuizMode(prev => mode === prev ? 'none' : mode);
      setIsPlaying(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
      if (quizMode === 'none') {
          handlePlay();
      }
  };

  const currentCharacter = characterList.length > 0 ? characterList[selectedIndex] : '';

  return (
    <div 
        className="h-full w-full fixed inset-0 flex flex-col landscape:flex-row overflow-hidden bg-paper text-ink-900"
        onClick={handleContainerClick}
        style={{
            backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}
    >
      {/* Left Section - Player */}
      <section className="flex-none landscape:flex-1 landscape:h-full flex flex-col items-center justify-center relative z-10 transition-all duration-300 py-2">
          
          <header className="flex-none pb-2 px-6 flex flex-col items-center z-20 landscape:items-start landscape:w-full landscape:pl-10">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-[0.2em] text-ink-900 flex items-center gap-2 whitespace-nowrap">
                <span className="w-6 h-[2px] bg-accent rounded-full"></span>
                沐沐小黑板
                <span className="w-6 h-[2px] bg-accent rounded-full"></span>
            </h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
              <div className="animate-in zoom-in-95 duration-700 ease-out">
                  <HanziWriterPlayer 
                    key={`${currentCharacter}-${selectedIndex}-${gridType}`}
                    character={currentCharacter}
                    size={playerSize}
                    gridType={gridType}
                    isPlaying={isPlaying}
                    quizMode={quizMode}
                    strokeAudioEnabled={strokeAudioEnabled}
                    onAnimationComplete={() => setIsPlaying(false)}
                  />
              </div>
          </div>
      </section>

      {/* Right Section - Control Panel */}
      <section className="flex-none w-full landscape:w-[420px] landscape:h-full landscape:border-l landscape:border-stone-200/50 bg-white/60 backdrop-blur-sm z-20 pb-safe shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] flex flex-col">
        <ControlPanel 
            characterList={characterList}
            selectedIndex={selectedIndex}
            quizMode={quizMode}
            gridType={gridType}
            strokeAudioEnabled={strokeAudioEnabled}
            onSelect={(idx) => {
                setSelectedIndex(idx);
                if (quizMode === 'none') {
                    setIsPlaying(true);
                }
            }}
            onAddCharacters={handleAddCharacters}
            onClear={() => {
                setCharacterList([]);
                setSelectedIndex(0);
            }}
            onPlay={handlePlay}
            onSetQuizMode={handleSetQuizMode}
            onToggleGrid={() => setGridType(prev => prev === 'mi' ? 'tian' : 'mi')}
            onToggleAudio={() => setStrokeAudioEnabled(prev => !prev)}
        />
      </section>
    </div>
  );
};

export default App;
