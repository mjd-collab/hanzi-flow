import React, { useState, useEffect } from 'react';
import HanziWriterPlayer from './components/HanziWriterPlayer';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const [characterList, setCharacterList] = useState<string[]>(['汉', '字', '顺', '序']);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [playerSize, setPlayerSize] = useState<number>(300);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      
      // Responsive sizing logic
      if (width < 640) { 
        // Mobile: 60% of width for a compact look (halved area)
        setPlayerSize(minDimension * 0.6);
      } else { 
        setPlayerSize(Math.min(500, height * 0.40)); 
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleAddCharacters = (chars: string) => {
    const newChars = chars.split('');
    setCharacterList(prev => [...prev, ...newChars]);
    setSelectedIndex(characterList.length); // Select first new char
  };

  const handlePlay = () => {
      setIsQuizMode(false);
      setIsPlaying(true);
  };
  
  const handleToggleQuiz = () => {
      setIsQuizMode(prev => !prev);
      if (!isQuizMode) {
          setIsPlaying(false);
      }
  };

  // Global background click to play
  const handleContainerClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
      if (!isQuizMode) {
          handlePlay();
      }
  };

  return (
    <div 
        className="h-full w-full flex flex-col items-center overflow-hidden bg-paper text-ink-900"
        onClick={handleContainerClick}
        style={{
            backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}
    >
      {/* Zen Header */}
      <header className="w-full pt-8 pb-2 px-6 flex flex-col items-center z-20">
        <h1 className="text-2xl font-bold font-serif tracking-[0.2em] text-ink-900 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-accent rounded-full"></span>
            汉字笔顺
            <span className="w-8 h-[2px] bg-accent rounded-full"></span>
        </h1>
        <p className="text-[10px] text-stone-400 font-sans tracking-widest mt-1 uppercase">Hanzi Flow</p>
      </header>

      {/* Main Player Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
        {characterList.length > 0 ? (
          <div className="animate-in zoom-in-95 duration-700 ease-out">
              <HanziWriterPlayer 
                key={`${characterList[selectedIndex]}-${selectedIndex}`}
                character={characterList[selectedIndex]}
                size={playerSize}
                isPlaying={isPlaying}
                isQuizMode={isQuizMode}
                onAnimationComplete={() => setIsPlaying(false)}
              />
          </div>
        ) : (
          <div className="text-stone-300 flex flex-col items-center animate-pulse">
             <div className="w-24 h-24 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center mb-2">
                 <span className="text-3xl font-serif">空</span>
             </div>
             <span className="font-serif text-sm">请添加汉字</span>
          </div>
        )}
      </main>

      {/* Control Panel Area */}
      <footer className="w-full z-20 pb-safe">
        <ControlPanel 
            characterList={characterList}
            selectedIndex={selectedIndex}
            isQuizMode={isQuizMode}
            onSelect={(idx) => {
                setSelectedIndex(idx);
                setIsPlaying(true);
                setIsQuizMode(false); // Reset to view mode on change
            }}
            onAddCharacters={handleAddCharacters}
            onClear={() => {
                setCharacterList([]);
                setSelectedIndex(0);
            }}
            onPlay={handlePlay}
            onToggleQuiz={handleToggleQuiz}
        />
      </footer>
    </div>
  );
};

export default App;