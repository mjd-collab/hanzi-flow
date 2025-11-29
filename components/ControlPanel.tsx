import React, { useState, useEffect } from 'react';
import { cleanHanziString } from '../services/dictionaryService';

interface ControlPanelProps {
  characterList: string[];
  selectedIndex: number;
  isQuizMode: boolean;
  onSelect: (index: number) => void;
  onAddCharacters: (chars: string) => void;
  onClear: () => void;
  onPlay: () => void;
  onToggleQuiz: () => void;
}

const ITEMS_PER_PAGE = 28; // 7x4

const ControlPanel: React.FC<ControlPanelProps> = ({
  characterList,
  selectedIndex,
  isQuizMode,
  onSelect,
  onAddCharacters,
  onClear,
  onPlay,
  onToggleQuiz,
}) => {
  const [inputText, setInputText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(characterList.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    if (characterList.length > 0) {
        const lastPage = Math.ceil(characterList.length / ITEMS_PER_PAGE) - 1;
        setCurrentPage(lastPage);
    }
  }, [characterList.length]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const cleaned = cleanHanziString(inputText);
    if (cleaned) {
      onAddCharacters(cleaned);
      setInputText('');
    }
  };

  const paginatedChars = characterList.slice(
      currentPage * ITEMS_PER_PAGE, 
      (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 pb-4">
      
      {/* Input Bar */}
      <div className="flex gap-2 items-center bg-white p-2 rounded-2xl shadow-sm border border-stone-100 ring-1 ring-stone-900/5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="请输入汉字..."
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-base px-2 font-serif placeholder:font-sans placeholder:text-stone-400 text-ink-900"
        />
        
        <button 
          onClick={() => setInputText('')}
          className="p-1.5 rounded-full text-stone-300 hover:text-red-500 hover:bg-stone-50 transition-colors"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
        </button>

        <div className="w-px h-6 bg-stone-200 mx-1"></div>

        <button 
          onClick={handleTextSubmit}
          disabled={!inputText}
          className="p-2 rounded-xl bg-ink-900 text-white shadow-md active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {/* Grid Area */}
      {characterList.length > 0 && (
        <div className="flex flex-col gap-1 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tools */}
            <div className="flex items-center justify-between px-2 text-stone-400">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClear}
                        className="text-xs font-bold hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        清空
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-1 text-ink-800 disabled:text-stone-200"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                     </button>
                     <span className="text-xs font-mono font-bold">
                        {currentPage + 1} / {totalPages}
                     </span>
                     <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-1 text-ink-800 disabled:text-stone-200"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                     </button>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={onToggleQuiz} 
                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${isQuizMode ? 'text-accent' : 'text-stone-400 hover:text-ink-900'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                        练习
                    </button>
                    <button 
                        onClick={onPlay} 
                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${!isQuizMode ? 'text-accent' : 'text-stone-400 hover:text-ink-900'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        播放
                    </button>
                </div>
            </div>
            
            {/* Grid */}
            <div className="bg-white/40 p-2 rounded-xl border border-stone-100 min-h-[180px]">
                <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                    {paginatedChars.map((char, idx) => {
                        const globalIndex = currentPage * ITEMS_PER_PAGE + idx;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                            <button
                                key={`${char}-${globalIndex}`}
                                onClick={() => onSelect(globalIndex)}
                                className={`
                                    w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-lg font-serif transition-all duration-200
                                    ${isSelected 
                                    ? 'bg-ink-900 text-paper shadow-lg scale-110 -translate-y-1' 
                                    : 'bg-white text-ink-800 shadow-sm border border-stone-100 hover:border-accent/30'}
                                `}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;