/**
 * Speech Recognition and Audio utilities for BolEnglish AI
 */

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface VoiceConfig {
  gender: 'female' | 'male';
  voiceName: string; // Gemini prebuilt voice name (Kore, Aoede, Leda, Puck, Fenrir, Charon)
  rate?: number;
  pitch?: number;
}

export const AVAILABLE_VOICES: Array<{
  id: string;
  name: string;
  urduName: string;
  gender: 'female' | 'male';
  geminiVoice: string;
  description: string;
}> = [
  {
    id: 'zoya_kore',
    name: 'Zara / Zoya',
    urduName: 'زارا (خاتون)',
    gender: 'female',
    geminiVoice: 'Kore',
    description: 'Warm, natural female voice — gentle & encouraging',
  },
  {
    id: 'sana_aoede',
    name: 'Sana',
    urduName: 'ثنا (خاتون)',
    gender: 'female',
    geminiVoice: 'Aoede',
    description: 'Expressive, clear female voice — ideal for pronunciation',
  },
  {
    id: 'ayla_leda',
    name: 'Ayla',
    urduName: 'آئلہ (خاتون)',
    gender: 'female',
    geminiVoice: 'Leda',
    description: 'Soothing, relaxed female tone for beginners',
  },
  {
    id: 'zain_puck',
    name: 'Zain / Tariq',
    urduName: 'زین (مرد)',
    gender: 'male',
    geminiVoice: 'Puck',
    description: 'Energetic, natural male voice — friendly & clear',
  },
  {
    id: 'hamza_fenrir',
    name: 'Hamza',
    urduName: 'حمزہ (مرد)',
    gender: 'male',
    geminiVoice: 'Fenrir',
    description: 'Deep, resonant male voice — professional tone',
  },
  {
    id: 'ali_charon',
    name: 'Ali',
    urduName: 'علی (مرد)',
    gender: 'male',
    geminiVoice: 'Charon',
    description: 'Clear, authoritative male speaker',
  },
];

export class SpeechRecognizer {
  private recognition: any = null;
  public isListening: boolean = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (this.onResultCallback && currentText) {
          this.onResultCallback(currentText, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public setLanguage(langCode: 'en-US' | 'ur-PK') {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      console.warn('Recognition already started or error:', err);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

/**
 * Native Speech Synthesis (Web Speech API) respecting Male / Female gender selection
 */
export function speakTextNative(
  text: string,
  lang: 'en' | 'ur' = 'en',
  voiceConfig?: VoiceConfig,
  onEnd?: () => void
): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel(); // Stop ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
  utterance.rate = voiceConfig?.rate || 0.92;
  utterance.pitch = voiceConfig?.pitch || 1.0;

  const gender = voiceConfig?.gender || 'female';
  const voices = window.speechSynthesis.getVoices();

  let preferredVoice: SpeechSynthesisVoice | undefined;

  if (lang === 'en') {
    if (gender === 'male') {
      const maleKeywords = ['male', 'alex', 'david', 'george', 'fred', 'daniel', 'oliver', 'google uk english male', 'google us english male'];
      preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
    } else {
      const femaleKeywords = ['female', 'samantha', 'victoria', 'zira', 'karen', 'fiona', 'moira', 'siri', 'google us english', 'google uk english female'];
      preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
    }
  }

  if (!preferredVoice) {
    preferredVoice = voices.find(v => v.lang.startsWith(lang === 'ur' ? 'ur' : 'en'));
  }

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeakingNative() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play Base64 Audio from Gemini TTS API
 */
export async function playGeminiTtsAudio(base64Data: string, mimeType: string = 'audio/pcm'): Promise<void> {
  try {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (mimeType.includes('pcm')) {
      // 24kHz 16-bit mono PCM playback via AudioContext
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);

      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);
    } else {
      // Direct WAV/MP3 blob
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    }
  } catch (err) {
    console.error('Error playing Gemini TTS audio:', err);
  }
}
