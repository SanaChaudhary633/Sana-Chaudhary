import React from 'react';
import { 
  Award, 
  Flame, 
  TrendingUp, 
  Clock, 
  BookMarked, 
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface FluencyProgressProps {
  streakCount: number;
  savedWordsCount: number;
  userLevel: string;
}

export const FluencyProgress: React.FC<FluencyProgressProps> = ({
  streakCount,
  savedWordsCount,
  userLevel
}) => {
  const badges = [
    { title: "Bilingual Bridge", desc: "Practiced English with instant Urdu assistance", icon: Globe, unlocked: true },
    { title: "Daily Chatter", desc: "Maintained a 3-day speaking streak", icon: Flame, unlocked: streakCount >= 3 },
    { title: "Vocabulary Builder", desc: "Saved 5+ key expressions to phrasebook", icon: BookMarked, unlocked: savedWordsCount >= 5 },
    { title: "Pronunciation Champ", desc: "Analyzed 3 tongue twisters with AI coach", icon: ShieldCheck, unlocked: true },
    { title: "Scenario Explorer", desc: "Completed 2 full conversation scenarios", icon: Sparkles, unlocked: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Overview Stats Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-[#0a0d14] to-blue-950/60 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">Your English Fluency Dashboard</h1>
            <p className="text-xs text-slate-400">Track your daily speaking practice, vocabulary growth, and accuracy.</p>
          </div>
          <span className="text-xs px-3.5 py-1.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold font-mono w-fit">
            Level: {userLevel} (سطح)
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#05070a] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-inner">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Daily Streak</span>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-black text-amber-400">{streakCount} Days</span>
            </div>
            <span className="text-[10px] text-slate-500 font-urdu block">مسلسل مشق کے دن</span>
          </div>

          <div className="bg-[#05070a] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-inner">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Estimated Fluency</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span className="text-2xl font-black text-cyan-400">76%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-urdu block">زبان کی روانی کا تناسب</span>
          </div>

          <div className="bg-[#05070a] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-inner">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Saved Phrases</span>
            <div className="flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-teal-400" />
              <span className="text-2xl font-black text-teal-400">{savedWordsCount} Words</span>
            </div>
            <span className="text-[10px] text-slate-500 font-urdu block">محفوظ الفاظ</span>
          </div>

          <div className="bg-[#05070a] p-4 rounded-2xl border border-slate-800 space-y-1 shadow-inner">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Practice Time</span>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-black text-blue-400">42 Mins</span>
            </div>
            <span className="text-[10px] text-slate-500 font-urdu block">گفتگو کا وقت</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Fluency Achievements & Badges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  badge.unlocked 
                    ? 'bg-[#05070a] border-cyan-500/30' 
                    : 'bg-[#05070a]/40 border-slate-800/60 opacity-50'
                }`}
              >
                <div className={`p-2.5 rounded-2xl ${badge.unlocked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{badge.title}</h3>
                  <p className="text-xs text-slate-400">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
