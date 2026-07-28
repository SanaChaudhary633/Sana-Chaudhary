import React, { useState, useRef } from 'react';
import { MINIMAL_PAIRS, TONGUE_TWISTERS, PHONETIC_CHARTS } from '../data/pronunciationData';
import { PronunciationAnalysisResult } from '../types';
import { SpeechRecognizer, speakTextNative } from '../utils/audio';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BarChart3,
  Flame
} from 'lucide-react';

export const PronunciationTrainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'minimal_pairs' | 'tongue_twisters' | 'phonetics'>('minimal_pairs');
  const [targetPhrase, setTargetPhrase] = useState('Thirty-three thirsty thieves thought of thrilling things.');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  const handleStartRecording = (phraseToRecord?: string) => {
    if (phraseToRecord) {
      setTargetPhrase(phraseToRecord);
    }
    setSpokenTranscript('');
    setAnalysisResult(null);
    setIsRecording(true);

    recognizerRef.current = new SpeechRecognizer();
    recognizerRef.current.start(
      (text, isFinal) => {
        setSpokenTranscript(text);
        if (isFinal) {
          setIsRecording(false);
          analyzeSpeech(targetPhrase || phraseToRecord || '', text);
        }
      },
      (err) => {
        console.error("Recording error:", err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
  };

  const handleStopRecording = () => {
    recognizerRef.current?.stop();
    setIsRecording(false);
    if (spokenTranscript.trim()) {
      analyzeSpeech(targetPhrase, spokenTranscript);
    }
  };

  const analyzeSpeech = async (target: string, spoken: string) => {
    if (!spoken.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetText: target, spokenText: spoken })
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleListen = (text: string) => {
    speakTextNative(text, 'en');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-[#0a0d14] to-blue-950/60 border border-cyan-500/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Pronunciation & Fluency Trainer
            </h1>
            <p className="text-xs text-slate-400">
              Master difficult English sounds with AI phonetics analysis and Urdu oral guidance.
            </p>
          </div>
        </div>

        {/* Practice Mode Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('minimal_pairs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'minimal_pairs'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Minimal Pairs (مشابہ آوازیں)
          </button>
          <button
            onClick={() => setActiveTab('tongue_twisters')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tongue_twisters'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tongue Twisters (روانی کی مشق)
          </button>
          <button
            onClick={() => setActiveTab('phonetics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'phonetics'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Phonetic Sounds Chart (صوتیاتی چارٹ)
          </button>
        </div>
      </div>

      {/* Live Recording & Speech Therapist Test Area */}
      <div className="bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Speech Therapist Analysis
          </span>
          <span className="font-urdu text-xs text-slate-400">برائے مہربانی صاف آواز میں بولیں</span>
        </div>

        {/* Target Phrase Box */}
        <div className="bg-[#05070a] rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono font-medium">Target Sentence</span>
            <p className="text-base sm:text-lg font-bold text-slate-100">{targetPhrase}</p>
          </div>
          <button
            onClick={() => handleListen(targetPhrase)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors cursor-pointer shrink-0"
            title="Listen native speaker audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Control & Transcript */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={isRecording ? handleStopRecording : () => handleStartRecording()}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Record My Voice</span>
              </>
            )}
          </button>

          <div className="flex-1 w-full bg-[#05070a] rounded-2xl p-3.5 border border-slate-800 text-xs">
            <span className="text-slate-500 block text-[10px] font-mono uppercase font-medium">Spoken Transcript:</span>
            <span className="text-slate-200 font-mono">
              {spokenTranscript || (isRecording ? "Listening..." : "Click Record My Voice and speak clearly...")}
            </span>
          </div>
        </div>

        {/* Analysis Results Display */}
        {isAnalyzing && (
          <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>AI Speech Therapist analyzing your accent, stress, and vowels...</span>
          </div>
        )}

        {analysisResult && (
          <div className="p-4 rounded-2xl bg-[#05070a] border border-slate-800 space-y-4">
            
            {/* Score Badge & Rating */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center font-extrabold text-cyan-400 text-lg shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  {analysisResult.score}%
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{analysisResult.fluencyRating} Pronunciation</h4>
                  <p className="text-xs text-slate-400">{analysisResult.praiseEn}</p>
                </div>
              </div>
              <p className="font-urdu text-sm text-cyan-400">{analysisResult.praiseUr}</p>
            </div>

            {/* Mispronounced Words & Urdu Tips */}
            {analysisResult.mispronouncedWords && analysisResult.mispronouncedWords.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Word Corrections & Tongue Placement Tips:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysisResult.mispronouncedWords.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-[#0a0d14] rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400 text-sm">{item.word}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{item.expectedIpa}</span>
                      </div>
                      <p className="text-xs text-slate-300">{item.perceivedIssue}</p>
                      <p className="font-urdu text-xs text-cyan-400 font-semibold leading-relaxed">{item.urduTip}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Perfect! All words were pronounced clearly with natural pitch and rhythm.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Content Views */}

      {/* 1. Minimal Pairs View */}
      {activeTab === 'minimal_pairs' && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>Minimal Pairs Practice Cards (مشابہ آوازوں میں فرق)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MINIMAL_PAIRS.map((pair) => (
              <div
                key={pair.id}
                className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-lg text-cyan-300">{pair.targetWordOrPhrase}</span>
                  <button
                    onClick={() => handleListen(pair.targetWordOrPhrase)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors cursor-pointer border border-slate-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#05070a] p-3 rounded-2xl border border-slate-800">
                    <span className="font-semibold text-slate-200 block">{pair.diffWord1}</span>
                  </div>
                  <div className="bg-[#05070a] p-3 rounded-2xl border border-slate-800">
                    <span className="font-semibold text-slate-200 block">{pair.diffWord2}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#05070a] border border-slate-800 space-y-1">
                  <p className="font-urdu text-xs text-cyan-400 font-semibold">{pair.urduMeaning}</p>
                  <p className="text-xs text-slate-400">{pair.tips}</p>
                </div>

                <button
                  onClick={() => handleStartRecording(pair.targetWordOrPhrase)}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Practice Speaking This Pair</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Tongue Twisters View */}
      {activeTab === 'tongue_twisters' && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Fluency Tongue Twisters (زبان کی روانی کے لیے)</span>
          </h2>

          <div className="space-y-3">
            {TONGUE_TWISTERS.map((tt) => (
              <div
                key={tt.id}
                className="bg-[#0a0d14] rounded-3xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1 max-w-2xl">
                  <p className="font-bold text-base text-slate-100">{tt.targetWordOrPhrase}</p>
                  <p className="text-xs font-mono text-cyan-400">{tt.phoneticIpa}</p>
                  <p className="font-urdu text-xs text-cyan-400 leading-relaxed">{tt.urduMeaning}</p>
                  <p className="text-xs text-slate-400 italic">Tip: {tt.tips}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleListen(tt.targetWordOrPhrase)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors cursor-pointer border border-slate-800"
                    title="Listen slow audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleStartRecording(tt.targetWordOrPhrase)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Phonetic Sounds Chart View */}
      {activeTab === 'phonetics' && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Interactive Phonetic Sound Guide (اردو صوتیات)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PHONETIC_CHARTS.map((sound, i) => (
              <div key={i} className="bg-[#0a0d14] p-4 rounded-3xl border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-cyan-400 font-mono">{sound.symbol}</span>
                  <button
                    onClick={() => handleListen(sound.exampleWord)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer border border-slate-800"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">Examples: {sound.exampleWord}</span>
                  <span className="font-urdu text-sm font-bold text-slate-100 block mt-1">{sound.urduEquivalent}</span>
                </div>

                <p className="font-urdu text-xs text-cyan-400/90 leading-relaxed bg-[#05070a] p-3 rounded-2xl border border-slate-800">
                  {sound.urduDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
