import React from 'react';
import { 
  MessageSquare, 
  Languages, 
  Mic, 
  BookOpen, 
  Sparkles, 
  Award, 
  Flame,
  Volume2,
  SlidersHorizontal
} from 'lucide-react';
import { VoiceConfig } from '../utils/audio';

interface NavbarProps {
  activeTab: 'chat' | 'translate' | 'pronounce' | 'scenarios' | 'vocabulary' | 'progress';
  setActiveTab: (tab: 'chat' | 'translate' | 'pronounce' | 'scenarios' | 'vocabulary' | 'progress') => void;
  streakCount: number;
  userLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  setUserLevel: (level: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  voiceConfig: VoiceConfig;
  onOpenVoiceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakCount,
  userLevel,
  setUserLevel,
  voiceConfig,
  onOpenVoiceModal,
}) => {
  const navItems = [
    { id: 'chat', label: 'AI Partner', urduLabel: 'ہم کلام AI', icon: MessageSquare },
    { id: 'translate', label: 'Instant Translator', urduLabel: 'فوری مترجم', icon: Languages },
    { id: 'pronounce', label: 'Pronunciation', urduLabel: 'تلفظ کی مشق', icon: Mic },
    { id: 'scenarios', label: 'Scenarios', urduLabel: 'مواقف اور مکالمے', icon: Sparkles },
    { id: 'vocabulary', label: 'Phrasebook', urduLabel: 'ذخیرہ الفاظ', icon: BookOpen },
    { id: 'progress', label: 'Stats', urduLabel: 'پیش رفت', icon: Award },
  ] as const;

  const isMale = voiceConfig.gender === 'male';

  return (
    <header className="sticky top-0 z-40 bg-[#0a0d14]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl font-bold text-slate-950 font-sans">ب</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  BolEnglish
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AI اردو
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                English Conversation Partner & Instant Urdu Translator
              </p>
            </div>
          </div>

          {/* User Level Selector, Voice Selector & Daily Streak */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Voice Gender Selector Quick Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isMale
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
              }`}
              title="Change Voice (Male / Female)"
            >
              <div className={`w-2 h-2 rounded-full ${isMale ? 'bg-blue-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">
                {isMale ? 'Male Voice (Zain)' : 'Female Voice (Zara)'}
              </span>
              <span className="sm:hidden font-mono font-bold">
                {isMale ? '♂ Male' : '♀ Female'}
              </span>
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium" title="Daily Practice Streak">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">{streakCount} Day Streak</span>
              <span className="sm:hidden font-mono font-bold">{streakCount}d</span>
            </div>

            {/* Level Selector */}
            <div className="relative group hidden md:block">
              <select
                value={userLevel}
                onChange={(e) => setUserLevel(e.target.value as any)}
                className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Beginner">Beginner (مبتدی)</option>
                <option value="Intermediate">Intermediate (درمیانی)</option>
                <option value="Advanced">Advanced (ماہر)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] hidden lg:inline-block ${isActive ? 'text-slate-950/80 font-urdu' : 'text-slate-500 font-urdu'}`}>
                  {item.urduLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
