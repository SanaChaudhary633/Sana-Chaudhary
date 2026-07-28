import React, { useState } from 'react';
import { VocabularyWord } from '../types';
import { speakTextNative } from '../utils/audio';
import { 
  BookOpen, 
  Volume2, 
  Trash2, 
  CheckCircle2, 
  RotateCw, 
  Search, 
  BookMarked,
  Layers
} from 'lucide-react';

interface PhrasebookVocabularyProps {
  vocabularyList: VocabularyWord[];
  onRemoveWord: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const PhrasebookVocabulary: React.FC<PhrasebookVocabularyProps> = ({
  vocabularyList,
  onRemoveWord,
  onToggleMastered
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'flashcards'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredWords = vocabularyList.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.urduMeaning.includes(searchTerm)
  );

  const currentCard = filteredWords[currentFlashcardIdx];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentFlashcardIdx < filteredWords.length - 1) {
      setCurrentFlashcardIdx(prev => prev + 1);
    } else {
      setCurrentFlashcardIdx(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-[#0a0d14] to-blue-950/60 border border-cyan-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Personal Phrasebook & Saved Vocabulary
            </h1>
            <p className="text-xs text-slate-400">
              {vocabularyList.length} saved words and expressions with Urdu meanings and IPA audio.
            </p>
          </div>
        </div>

        <div className="flex gap-2 bg-[#05070a] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Word List</span>
          </button>
          <button
            onClick={() => {
              setViewMode('flashcards');
              setCurrentFlashcardIdx(0);
              setIsFlipped(false);
            }}
            disabled={filteredWords.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'flashcards' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcard Quiz</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      {viewMode === 'list' && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved English words or Urdu meanings... (تلاش کریں)"
            className="w-full bg-[#0a0d14] text-slate-100 placeholder-slate-500 text-sm rounded-2xl pl-11 pr-4 py-3.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* 1. Flashcard Mode */}
      {viewMode === 'flashcards' && currentCard ? (
        <div className="max-w-xl mx-auto space-y-4 py-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-2">
            <span>Card {currentFlashcardIdx + 1} of {filteredWords.length}</span>
            <span>Click card to flip answer</span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] rounded-3xl p-8 border cursor-pointer transition-all duration-300 flex flex-col justify-between items-center text-center shadow-2xl ${
              isFlipped 
                ? 'bg-[#0a0d14] border-cyan-500/50 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.15)]' 
                : 'bg-gradient-to-b from-[#0a0d14] to-[#05070a] border-slate-800 text-slate-100'
            }`}
          >
            <div className="w-full flex justify-between items-center text-xs text-slate-500">
              <span className="uppercase font-mono font-semibold tracking-wider">
                {isFlipped ? "Urdu Translation" : "English Word"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakTextNative(currentCard.word);
                }}
                className="p-2 rounded-xl bg-slate-900 text-cyan-400 hover:bg-slate-800 cursor-pointer border border-slate-800"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {!isFlipped ? (
              <div className="space-y-2 my-auto">
                <h2 className="text-3xl font-extrabold text-slate-100">{currentCard.word}</h2>
                <p className="text-sm font-mono text-cyan-400">{currentCard.phonetic}</p>
                <p className="text-xs text-slate-400 italic">Click card to reveal Urdu meaning & example</p>
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                <h2 className="text-3xl font-bold font-urdu text-cyan-300">{currentCard.urduMeaning}</h2>
                <p className="text-xs text-slate-400 italic">Example: "{currentCard.exampleSentence}"</p>
              </div>
            )}

            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tap to Flip</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                onToggleMastered(currentCard.id);
                handleNextCard();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Know This Word!</span>
            </button>
            <button
              onClick={handleNextCard}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs transition-all cursor-pointer"
            >
              Next Word
            </button>
          </div>
        </div>
      ) : viewMode === 'flashcards' ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No saved words match your search. Save words from chat or dictionary first!
        </div>
      ) : null}

      {/* 2. Word List Mode */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredWords.length === 0 ? (
            <div className="bg-[#0a0d14] rounded-3xl p-8 border border-slate-800 text-center space-y-2">
              <BookMarked className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-300 text-sm font-semibold">Your phrasebook is empty.</p>
              <p className="text-xs text-slate-500">
                While practicing with AI tutors or translating phrases, click the bookmark icon to save words here!
              </p>
            </div>
          ) : (
            filteredWords.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0d14] rounded-3xl p-4 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-100">{item.word}</h3>
                    <span className="text-xs font-mono text-cyan-400">{item.phonetic}</span>
                    {item.mastered && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
                        Mastered
                      </span>
                    )}
                  </div>
                  <p className="font-urdu text-base font-bold text-cyan-400">{item.urduMeaning}</p>
                  <p className="text-xs text-slate-400 italic">"{item.exampleSentence}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => speakTextNative(item.word)}
                    className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                    title="Listen audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleMastered(item.id)}
                    className={`p-2.5 rounded-2xl transition-colors cursor-pointer border border-slate-800 ${
                      item.mastered ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                    }`}
                    title={item.mastered ? "Mark Unmastered" : "Mark Mastered"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveWord(item.id)}
                    className="p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                    title="Delete Word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
