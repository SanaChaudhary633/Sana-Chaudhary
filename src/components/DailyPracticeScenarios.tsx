import React, { useState, useEffect } from 'react';
import { PRACTICE_SCENARIOS } from '../data/scenarios';
import { PracticeScenario, DailyChallenge } from '../types';
import { speakTextNative } from '../utils/audio';
import { 
  Sparkles, 
  Coffee, 
  Briefcase, 
  Plane, 
  MessageCircle, 
  Volume2, 
  ChevronRight, 
  Calendar
} from 'lucide-react';

interface DailyPracticeScenariosProps {
  onSelectScenario: (scenario: PracticeScenario) => void;
  onSaveWord: (word: string, meaning: string, ipa: string, example: string) => void;
}

export const DailyPracticeScenarios: React.FC<DailyPracticeScenariosProps> = ({
  onSelectScenario,
  onSaveWord
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-challenge');
      const data = await res.json();
      setDailyChallenge(data);
    } catch (err) {
      console.error("Failed to fetch daily challenge:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return Briefcase;
      case 'travel': return Plane;
      case 'daily': return Coffee;
      case 'social': return MessageCircle;
      default: return Sparkles;
    }
  };

  const categories = [
    { id: 'all', name: 'All Scenarios', urdu: 'تمام مواقف' },
    { id: 'daily', name: 'Daily Life', urdu: 'روزمرہ زندگی' },
    { id: 'work', name: 'Work & Career', urdu: 'دفتر اور ملازمت' },
    { id: 'travel', name: 'Travel & Airport', urdu: 'سفر اور ایئرپورٹ' },
    { id: 'social', name: 'Social & Opinions', urdu: 'سماجی اور بحث' },
  ];

  const filteredScenarios = selectedCategory === 'all'
    ? PRACTICE_SCENARIOS
    : PRACTICE_SCENARIOS.filter(s => s.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Daily Challenge Card */}
      <div className="bg-gradient-to-r from-cyan-950 via-[#0a0d14] to-blue-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Today's Daily Challenge (آج کا چیلنج)
            </span>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
            50 Fluency XP
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading today's fresh English challenge & word of the day...
          </div>
        ) : dailyChallenge ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Goal & Scenario */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100">{dailyChallenge.topic}</h2>
                <p className="font-urdu text-base text-cyan-300 font-bold mt-0.5">{dailyChallenge.urduTopic}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#05070a] p-3.5 rounded-2xl border border-slate-800">
                {dailyChallenge.scenario}
              </p>

              {/* Target Words */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-mono text-[11px] font-semibold uppercase">Use today:</span>
                {dailyChallenge.targetWords?.map((w, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Word of the Day Highlight */}
            {dailyChallenge.wordOfDay && (
              <div className="bg-[#05070a] rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-2 shadow-inner">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Word of the Day</span>
                    <button
                      onClick={() => speakTextNative(dailyChallenge.wordOfDay.word)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">{dailyChallenge.wordOfDay.word}</h3>
                  <p className="text-[11px] text-cyan-400 font-mono">{dailyChallenge.wordOfDay.phonetic}</p>
                  <p className="font-urdu text-sm font-bold text-cyan-400 mt-1">{dailyChallenge.wordOfDay.urduMeaning}</p>
                  <p className="text-xs text-slate-400 italic mt-2">"{dailyChallenge.wordOfDay.exampleSentence}"</p>
                </div>

                <button
                  onClick={() => onSaveWord(
                    dailyChallenge.wordOfDay.word, 
                    dailyChallenge.wordOfDay.urduMeaning, 
                    dailyChallenge.wordOfDay.phonetic, 
                    dailyChallenge.wordOfDay.exampleSentence
                  )}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-300 border border-slate-800 cursor-pointer"
                >
                  Save Word to Phrasebook
                </button>
              </div>
            )}

          </div>
        ) : null}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-[#0a0d14] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{cat.name}</span>
            <span className={`text-[10px] font-urdu ${selectedCategory === cat.id ? 'text-slate-950' : 'text-slate-500'}`}>
              {cat.urdu}
            </span>
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((scen) => {
          const CategoryIcon = getCategoryIcon(scen.category);

          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen)}
              className="bg-[#0a0d14] hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border font-mono ${
                    scen.difficulty === 'Beginner'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      : scen.difficulty === 'Intermediate'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {scen.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {scen.title}
                  </h3>
                  <p className="font-urdu text-sm font-semibold text-cyan-400 mt-0.5">
                    {scen.urduTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {scen.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Start Practice Scenario</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
