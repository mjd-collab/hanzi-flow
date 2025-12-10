import React, { useState, useEffect } from 'react';
import { cleanHanziString } from '../services/dictionaryService';
import { QuizMode } from '../types';

interface ControlPanelProps {
  characterList: string[];
  selectedIndex: number;
  quizMode: QuizMode;
  gridType: 'mi' | 'tian';
  strokeAudioEnabled: boolean;
  onSelect: (index: number) => void;
  onAddCharacters: (chars: string) => void;
  onClear: () => void;
  onPlay: () => void;
  onSetQuizMode: (mode: QuizMode) => void;
  onToggleGrid: () => void;
  onToggleAudio: () => void;
}

const ITEMS_PER_PAGE = 28; 

const ControlPanel: React.FC<ControlPanelProps> = ({
  characterList,
  selectedIndex,
  quizMode,
  gridType,
  strokeAudioEnabled,
  onSelect,
  onAddCharacters,
  onClear,
  onPlay,
  onSetQuizMode,
  onToggleGrid,
  onToggleAudio,
}) => {
  const [inputText, setInputText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const totalPages = Math.max(1, Math.ceil(characterList.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    if (characterList.length > 0) {
        const lastPage = Math.ceil(characterList.length / ITEMS_PER_PAGE) - 1;
        setCurrentPage(lastPage);
    } else {
        setCurrentPage(0);
    }
  }, [characterList.length]);

  const handleTextSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!inputText.trim()) return;
    
    const cleaned = cleanHanziString(inputText);
    if (cleaned) {
      onAddCharacters(cleaned);
      setInputText('');
    }
  };

  const startListening = () => {
    // @ts-ignore
    if (!('webkitSpeechRecognition' in window)) {
        alert("您的浏览器不支持语音输入");
        return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const cleaned = cleanHanziString(transcript);
        if (cleaned) {
            onAddCharacters(cleaned);
        }
    };
    recognition.start();
  };

  const paginatedChars = characterList.slice(
      currentPage * ITEMS_PER_PAGE, 
      (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-4 gap-3 max-w-2xl mx-auto landscape:max-w-none landscape:mx-0 w-full overflow-hidden">
      
      {/* 1. Input Bar */}
      <div className="flex-none flex gap-2 items-center bg-white p-1.5 rounded-2xl shadow-sm border border-stone-200 ring-2 ring-stone-50">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入汉字..."
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-base sm:text-lg px-2 font-serif text-ink-900 h-9"
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
        />
        
        {/* Voice Input Button */}
        <button 
            onClick={startListening}
            className={`p-1.5 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-ink-900 bg-stone-50 hover:bg-stone-100'}`}
        >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
            </svg>
        </button>

        {inputText && (
            <button 
            onClick={() => setInputText('')}
            className="p-1.5 rounded-full text-stone-300 hover:text-red-500 bg-stone-50 hover:bg-red-50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
            </button>
        )}
        <div className="w-px h-5 bg-stone-200 mx-1"></div>
        <button 
          onClick={() => handleTextSubmit()}
          disabled={!inputText}
          className="h-9 px-3 rounded-xl bg-ink-900 text-white shadow-md active:scale-95 disabled:opacity-30 transition-all font-bold text-sm"
        >
          确定
        </button>
      </div>

      {/* 2. Action Toolbar */}
      <div className="flex-none grid grid-cols-5 gap-1.5 sm:gap-2">
         {/* Clear */}
         <button onClick={onClear} className="col-span-1 h-11 flex flex-col items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-100 active:scale-95 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mb-0.5">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
         </button>

         {/* Grid Type */}
         <button onClick={onToggleGrid} className="col-span-1 h-11 flex flex-col items-center justify-center bg-white text-ink-900 rounded-xl border border-stone-200 active:scale-95 transition-all">
             <span className="text-xs font-bold">{gridType === 'mi' ? '米字' : '田字'}</span>
         </button>

         {/* Sound Toggle */}
         <button onClick={onToggleAudio} className={`col-span-1 h-11 flex flex-col items-center justify-center rounded-xl border border-stone-200 active:scale-95 transition-all ${strokeAudioEnabled ? 'bg-ink-100 text-accent' : 'bg-white text-stone-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                {strokeAudioEnabled ? (
                    <path d="M10 2a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.385 6.425a.75.75 0 00-1.026.177A6.476 6.476 0 003.5 10c0 1.343.41 2.6.113 3.655a.75.75 0 001.204.887A4.977 4.977 0 0116.5 10c0-1.033-.317-1.998-.865-2.808a.75.75 0 00-1.204.887c.386.57.616 1.25.616 1.983a3.5 3.5 0 01-7 0c0-1.272.67-2.395 1.688-3.05a.75.75 0 00.177-1.026z" />
                ) : (
                   <path fillRule="evenodd" d="M9.546.5a.75.75 0 01.99.713v17.574a.75.75 0 01-1.317.49L3.926 14.5H2.75a2.25 2.25 0 01-2.25-2.25v-4.5a2.25 2.25 0 012.25-2.25h1.176L9.22 1.247a.75.75 0 01.326-.747zM3.86 8.78A.75.75 0 002.75 9.75v.5a.75.75 0 001.11.71l5.39-2.695V6.085L3.86 8.78z" clipRule="evenodd" />
                )}
            </svg>
         </button>

         {/* Play */}
         <button onClick={onPlay} className={`col-span-1 h-11 flex flex-col items-center justify-center rounded-xl border active:scale-95 transition-all ${quizMode === 'none' && selectedIndex >= 0 ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-900 border-stone-200'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.9a.75.75 0 011.12-.55l4.5 3a.75.75 0 010 1.25l-4.5 3a.75.75 0 01-1.12-.55V7.1z" clipRule="evenodd" />
            </svg>
         </button>

         {/* Practice */}
         <button onClick={() => onSetQuizMode('hint')} className={`col-span-1 h-11 flex flex-col items-center justify-center rounded-xl border active:scale-95 transition-all ${quizMode === 'hint' ? 'bg-accent text-white border-accent' : 'bg-white text-accent border-accent/30'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
         </button>
      </div>

      {/* 3. Character List Grid */}
      <div className="flex-1 min-h-0 bg-white/50 rounded-2xl border border-stone-100 p-2 relative flex flex-col">
         <div className="flex-1 overflow-y-auto no-scrollbar">
            {characterList.length > 0 ? (
                <div className="grid grid-cols-7 gap-1 auto-rows-min justify-items-center content-start">
                    {paginatedChars.map((char, idx) => {
                        const globalIndex = currentPage * ITEMS_PER_PAGE + idx;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                            <button
                                key={`${char}-${globalIndex}`}
                                onClick={() => onSelect(globalIndex)}
                                className={`
                                    w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-lg sm:text-xl font-serif transition-all duration-200
                                    ${isSelected 
                                    ? 'bg-ink-900 text-paper shadow-lg scale-105 ring-2 ring-accent ring-offset-1 z-10' 
                                    : 'bg-white text-ink-800 shadow-sm border border-stone-100 hover:border-accent/30'}
                                `}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                    <span className="text-sm font-serif">小黑板是空的</span>
                </div>
            )}
         </div>

         {/* Pagination */}
         {characterList.length > 0 && totalPages > 1 && (
            <div className="flex-none pt-2 mt-auto border-t border-stone-100 flex items-center justify-between px-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-xs font-bold bg-white border border-stone-200 rounded-lg text-ink-900 disabled:opacity-40 disabled:border-stone-100 active:bg-stone-50"
                >
                    上一页
                </button>
                <span className="text-xs font-mono font-bold text-stone-500">
                    {currentPage + 1} / {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 text-xs font-bold bg-white border border-stone-200 rounded-lg text-ink-900 disabled:opacity-40 disabled:border-stone-100 active:bg-stone-50"
                >
                    下一页
                </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default ControlPanel;