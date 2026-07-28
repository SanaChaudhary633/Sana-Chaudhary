import React, { useState } from 'react';
import { TranslationResult } from '../types';
import { speakTextNative } from '../utils/audio';
import { 
  ArrowLeftRight, 
  Volume2, 
  Copy, 
  Check, 
  BookMarked, 
  Sparkles, 
  Languages, 
  BookOpen,
  HelpCircle,
  Zap
} from 'lucide-react';

interface TranslatorDictionaryProps {
  onSaveWord: (word: string, meaning: string, ipa: string, example: string) => void;
  savedWords: string[];
}

export const TranslatorDictionary: React.FC<TranslatorDictionaryProps> = ({
  onSaveWord,
}) => {
  const [sourceText, setSourceText] = useState('');
  const [direction, setDirection] = useState<'en-to-ur' | 'ur-to-en'>('en-to-ur');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const quickPhrases = [
    { en: "Could you please speak a bit slower?", ur: "کیا آپ برائے مہربانی تھوڑا آہستہ بول سکتے ہیں؟" },
    { en: "How do you say this in English?", ur: "اسے انگلش میں کیسے کہتے ہیں؟" },
    { en: "What does this word mean?", ur: "اس لفظ کا کیا مطلب ہے؟" },
    { en: "Could you repeat that once more?", ur: "کیا آپ اسے ایک بار پھر دہرا سکتے ہیں؟" },
    { en: "I am learning English, please bear with me.", ur: "میں انگلش سیکھ رہا ہوں، برائے مہربانی تعاون کریں۔" }
  ];

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText.trim();
    if (!text) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string, lang: 'en' | 'ur') => {
    speakTextNative(text, lang);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'en-to-ur' ? 'ur-to-en' : 'en-to-ur');
    setSourceText('');
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-[#0a0d14] to-blue-950/60 border border-cyan-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Instant English ↔ Urdu Translator & Dictionary
            </h1>
            <p className="text-xs text-slate-400">
              Translate phrases, analyze grammar structures, IPA phonetics, and idioms.
            </p>
          </div>
        </div>
      </div>

      {/* Translation Box Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Source Text Input Card */}
        <div className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              {direction === 'en-to-ur' ? 'English Input' : 'Urdu Input (اردو)'}
            </span>
            <button
              onClick={toggleDirection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-all cursor-pointer border border-slate-800"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swap Direction</span>
            </button>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={direction === 'en-to-ur' ? "Type complex English sentence or phrase..." : "یہاں اردو جملہ لکھیں..."}
            className={`w-full bg-[#05070a] text-slate-100 placeholder-slate-500 text-base rounded-2xl p-4 border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none min-h-[160px] ${
              direction === 'ur-to-en' ? 'font-urdu text-lg' : ''
            }`}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {sourceText && (
                <button
                  onClick={() => handleSpeak(sourceText, direction === 'en-to-ur' ? 'en' : 'ur')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800"
                  title="Listen input"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleTranslate()}
              disabled={!sourceText.trim() || isLoading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Translating..." : "Translate & Analyze"}</span>
            </button>
          </div>
        </div>

        {/* Translation Output Card */}
        <div className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              {direction === 'en-to-ur' ? 'Urdu Translation (اردو)' : 'English Translation'}
            </span>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(result.translatedText)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer border border-slate-800"
                >
                  {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleSpeak(result.translatedText, direction === 'en-to-ur' ? 'ur' : 'en')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer border border-slate-800"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#05070a] rounded-2xl p-4 border border-slate-800 min-h-[160px] flex flex-col justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs py-8">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing grammar and generating Urdu script...</span>
              </div>
            ) : result ? (
              <div className="space-y-3">
                <p className={`text-xl font-bold text-cyan-300 leading-relaxed ${
                  direction === 'en-to-ur' ? 'font-urdu text-2xl text-right' : ''
                }`}>
                  {result.translatedText}
                </p>

                {result.romanUrdu && (
                  <p className="text-xs text-slate-400 italic bg-[#0a0d14] p-2.5 rounded-xl border border-slate-800">
                    Roman Urdu: "{result.romanUrdu}"
                  </p>
                )}

                {result.phoneticIpa && (
                  <p className="text-xs text-cyan-400 font-mono">
                    Phonetic IPA: {result.phoneticIpa}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-8">
                Enter text on the left and click Translate to see full breakdown.
              </div>
            )}
          </div>

          {result && (
            <div className="pt-2">
              <button
                onClick={() => onSaveWord(result.sourceText, result.translatedText, result.phoneticIpa || '', result.sourceText)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookMarked className="w-4 h-4 text-cyan-400" />
                <span>Save to My Phrasebook</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deep Grammar & Vocabulary Breakdown Card */}
      {result && result.grammaticalBreakdown && result.grammaticalBreakdown.length > 0 && (
        <div className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Grammar & Word Structure Analysis</span>
            <span className="font-urdu text-xs text-cyan-400 font-normal">گرامر کی وضاحت</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.grammaticalBreakdown.map((item, idx) => (
              <div key={idx} className="bg-[#05070a] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300 text-sm">{item.part}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{item.explanationEn}</p>
                <p className="font-urdu text-xs text-cyan-400/90 leading-relaxed">{item.explanationUr}</p>
              </div>
            ))}
          </div>

          {result.culturalContext && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-slate-300 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-400 block">Usage & Cultural Nuance:</span>
                {result.culturalContext}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Phrasebook Suggestions */}
      <div className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 space-y-3 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 font-bold">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Essential Expressions for Daily Practice</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceText(phrase.en);
                setDirection('en-to-ur');
                handleTranslate(phrase.en);
              }}
              className="p-3.5 rounded-2xl bg-[#05070a] hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                {phrase.en}
              </div>
              <div className="font-urdu text-[11px] text-cyan-400/80 mt-1">
                {phrase.ur}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
