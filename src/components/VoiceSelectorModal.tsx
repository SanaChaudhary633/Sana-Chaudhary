import React, { useState } from 'react';
import { VoiceConfig, AVAILABLE_VOICES, speakTextNative, stopSpeakingNative, playGeminiTtsAudio } from '../utils/audio';
import { Volume2, Check, X, Sparkles, Mic, UserCheck } from 'lucide-react';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceConfig: VoiceConfig;
  onUpdateVoiceConfig: (config: VoiceConfig) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  voiceConfig,
  onUpdateVoiceConfig,
}) => {
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenderToggle = (gender: 'female' | 'male') => {
    const defaultVoiceForGender = AVAILABLE_VOICES.find((v) => v.gender === gender);
    if (defaultVoiceForGender) {
      onUpdateVoiceConfig({
        ...voiceConfig,
        gender,
        voiceName: defaultVoiceForGender.geminiVoice,
      });
    }
  };

  const handleSelectVoice = (voice: (typeof AVAILABLE_VOICES)[0]) => {
    onUpdateVoiceConfig({
      ...voiceConfig,
      gender: voice.gender,
      voiceName: voice.geminiVoice,
    });
  };

  const handleTestVoice = async (voice: (typeof AVAILABLE_VOICES)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeakingNative();

    if (testingVoiceId === voice.id) {
      setTestingVoiceId(null);
      return;
    }

    setTestingVoiceId(voice.id);
    const sampleText = `Hello! I am ${voice.name}. Let's practice English together today!`;

    const currentConfig: VoiceConfig = {
      gender: voice.gender,
      voiceName: voice.geminiVoice,
      rate: voiceConfig.rate || 0.95,
      pitch: voiceConfig.pitch || 1.0,
    };

    // First try browser native voice
    const nativeSuccess = speakTextNative(sampleText, 'en', currentConfig, () => {
      setTestingVoiceId(null);
    });

    if (!nativeSuccess) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sampleText, voiceName: voice.geminiVoice, gender: voice.gender }),
        });
        const data = await res.json();
        if (data.audioBase64) {
          await playGeminiTtsAudio(data.audioBase64, data.mimeType);
        }
      } catch (err) {
        console.error('TTS test error:', err);
      } finally {
        setTestingVoiceId(null);
      }
    }
  };

  const activeVoiceObj = AVAILABLE_VOICES.find(
    (v) => v.gender === voiceConfig.gender && v.geminiVoice === voiceConfig.voiceName
  ) || AVAILABLE_VOICES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0a0d14] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Voice & Gender Settings
                <span className="font-urdu text-xs text-cyan-400 font-normal">(آواز کا انتخاب)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose between Male and Female AI English tutors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gender Selection Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
            Tutor Gender Preference
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <button
              onClick={() => handleGenderToggle('female')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                voiceConfig.gender === 'female'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base">♀</span>
              <div className="text-left">
                <div className="leading-none">Female Tutor</div>
                <div className="text-[10px] opacity-80 font-urdu font-normal">خاتون کی آواز (Zara)</div>
              </div>
            </button>

            <button
              onClick={() => handleGenderToggle('male')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                voiceConfig.gender === 'male'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base">♂</span>
              <div className="text-left">
                <div className="leading-none">Male Tutor</div>
                <div className="text-[10px] opacity-80 font-urdu font-normal">مرد کی آواز (Zain)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">
            Select Voice Persona
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {AVAILABLE_VOICES.filter((v) => v.gender === voiceConfig.gender).map((voice) => {
              const isSelected =
                voice.gender === voiceConfig.gender && voice.geminiVoice === voiceConfig.voiceName;
              const isTesting = testingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => handleSelectVoice(voice)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-slate-100 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{voice.name}</span>
                      <span className="font-urdu text-xs text-cyan-400">{voice.urduName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{voice.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleTestVoice(voice, e)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isTesting
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title="Test speech sample"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Speed Controls */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="font-semibold">Speech Speed (آواز کی رفتار):</span>
            <span className="font-mono text-cyan-400">{voiceConfig.rate || 0.95}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={voiceConfig.rate || 0.95}
            onChange={(e) =>
              onUpdateVoiceConfig({ ...voiceConfig, rate: parseFloat(e.target.value) })
            }
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.75x (Slower)</span>
            <span>1.0x (Standard)</span>
            <span>1.25x (Faster)</span>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Active Persona: <strong className="text-slate-200">{activeVoiceObj.name}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Apply & Practice
          </button>
        </div>

      </div>
    </div>
  );
};
