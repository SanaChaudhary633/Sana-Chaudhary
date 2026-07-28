import React, { useState, useEffect, useRef } from 'react';
import { Message, PracticeScenario } from '../types';
import { PRACTICE_SCENARIOS } from '../data/scenarios';
import { SpeechRecognizer, speakTextNative, stopSpeakingNative, playGeminiTtsAudio, VoiceConfig, AVAILABLE_VOICES } from '../utils/audio';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Lightbulb, 
  BookMarked,
  Info,
  Zap,
  Globe,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';

interface ChatPartnerProps {
  userLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  onSaveWord: (word: string, meaning: string, ipa: string, example: string) => void;
  savedWords: string[];
  voiceConfig: VoiceConfig;
  onOpenVoiceModal: () => void;
}

export const ChatPartner: React.FC<ChatPartnerProps> = ({
  userLevel,
  onSaveWord,
  savedWords,
  voiceConfig,
  onOpenVoiceModal,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario>(PRACTICE_SCENARIOS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMale = voiceConfig.gender === 'male';
  const tutorName = isMale ? 'Zain' : 'Zara';
  const tutorUrduName = isMale ? 'زین' : 'زارا';

  const activeVoiceInfo = AVAILABLE_VOICES.find(
    (v) => v.gender === voiceConfig.gender && v.geminiVoice === voiceConfig.voiceName
  ) || AVAILABLE_VOICES[0];

  // Initialize Speech Recognizer & initial message
  useEffect(() => {
    recognizerRef.current = new SpeechRecognizer();

    const initialMsg: Message = {
      id: 'welcome_1',
      sender: 'assistant',
      text: selectedScenario.initialPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urduTranslation: isMale
        ? 'ہیلو! میں زین ہوں، آپ کا انگلش مشق کرنے والا ساتھی۔ آج آپ کا دن کیسا گزرا؟'
        : 'ہیلو! میں زارا ہوں، آپ کی انگلش مشق کرنے والی ساتھی۔ آج آپ کا دن کیسا گزرا؟',
      romanUrdu: isMale
        ? 'Hello! Main Zain hoon, aap ka English mashq karne wala sathi.'
        : 'Hello! Main Zara hoon, aap ki English mashq karne wali sathi.',
      showTranslation: true,
      suggestedReplies: [
        { english: "My day was great, thanks for asking! How are you?", urdu: "میرا دن بہت اچھا گزرا، پوچھنے کا شکریہ!" },
        { english: "I was very busy with work today.", urdu: "میں آج کام میں بہت مصروف تھا۔" },
        { english: "I am excited to practice my English with you!", urdu: "میں آپ کے ساتھ انگلش بولنے کے لیے پرجوش ہوں!" }
      ],
      vocabularyHighlights: [
        { word: "Practice", ipa: "/ˈpræk.tɪs/", urduMeaning: "مشق کرنا", example: "Daily practice builds confidence." }
      ]
    };

    setMessages([initialMsg]);
  }, [voiceConfig.gender]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Handle Scenario Change
  const handleScenarioSelect = (scenario: PracticeScenario) => {
    setSelectedScenario(scenario);
    setShowScenarioMenu(false);
    stopSpeakingNative();

    const startMsg: Message = {
      id: `scen_${Date.now()}`,
      sender: 'assistant',
      text: scenario.initialPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showTranslation: true,
      suggestedReplies: [
        { english: "Let's begin! I am ready.", urdu: "آئیے شروع کرتے ہیں! میں تیار ہوں۔" },
        { english: "Could you repeat that more slowly?", urdu: "کیا آپ اسے تھوڑا آہستہ دہرا سکتے ہیں؟" }
      ]
    };
    setMessages([startMsg]);

    if (autoSpeak) {
      handleSpeak(scenario.initialPrompt, startMsg.id);
    }
  };

  // Toggle Voice Recording
  const toggleRecording = () => {
    if (isRecording) {
      recognizerRef.current?.stop();
      setIsRecording(false);
      if (interimTranscript.trim()) {
        sendMessage(interimTranscript.trim());
        setInterimTranscript('');
      }
    } else {
      setInterimTranscript('');
      setIsRecording(true);
      recognizerRef.current?.start(
        (text, isFinal) => {
          setInterimTranscript(text);
          if (isFinal) {
            setInputText(text);
          }
        },
        (err) => {
          console.error("Speech error:", err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  // Speak AI Message Audio with selected voice config
  const handleSpeak = async (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      stopSpeakingNative();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);

    // Try native synthesis with requested gender & voice configuration
    const success = speakTextNative(text, 'en', voiceConfig, () => {
      setSpeakingMessageId(null);
    });

    if (!success) {
      // Fallback to backend Gemini TTS API with selected prebuilt voice
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: voiceConfig.voiceName,
            gender: voiceConfig.gender,
          })
        });
        const data = await response.json();
        if (data.audioBase64) {
          await playGeminiTtsAudio(data.audioBase64, data.mimeType);
        }
      } catch (err) {
        console.error("TTS play failed:", err);
      } finally {
        setSpeakingMessageId(null);
      }
    }
  };

  // Send Message to AI Partner
  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setInterimTranscript('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          scenario: selectedScenario.title,
          userLevel,
          tutorGender: voiceConfig.gender,
        })
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "That's wonderful! Tell me more about that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urduTranslation: data.urduTranslation,
        romanUrdu: data.romanUrdu,
        feedback: data.feedback,
        suggestedReplies: data.suggestedReplies,
        vocabularyHighlights: data.vocabularyHighlights,
        showTranslation: true,
        showDetails: true
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto speak response
      if (autoSpeak) {
        handleSpeak(assistantMsg.text, assistantMsg.id);
      }

    } catch (error) {
      console.error("Chat API call failed:", error);
      const fallbackMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I heard you clearly! Let's keep practicing. Could you elaborate on that?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urduTranslation: "میں نے آپ کی بات سنی! آئیے مشق جاری رکھیں۔",
        showTranslation: true
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Translation Display
  const toggleTranslation = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, showTranslation: !m.showTranslation } : m));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-[#0a0d14] rounded-3xl border border-slate-800 shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden">
      
      {/* Top Header Bar: Conversation Partner Info & Voice Gender Switcher */}
      <div className="bg-[#0a0d14]/95 border-b border-slate-800/80 p-3.5 sm:p-4 flex items-center justify-between">
        
        {/* Mentor Profile with Avatar & Voice Badge */}
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={onOpenVoiceModal}>
            <div className={`w-11 h-11 rounded-2xl p-0.5 shadow-lg transition-transform hover:scale-105 ${
              isMale
                ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-blue-500/20'
                : 'bg-gradient-to-tr from-cyan-400 to-teal-400 shadow-cyan-500/20'
            }`}>
              <div className="w-full h-full rounded-[14px] bg-[#05070a] flex items-center justify-center font-bold text-lg text-cyan-400">
                {isMale ? 'Z' : 'Z'}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 border-2 border-[#0a0d14] rounded-full flex items-center justify-center text-[8px] font-bold text-slate-950">
              {isMale ? '♂' : '♀'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
                {tutorName} ({tutorUrduName})
              </h2>

              {/* Voice Gender Switcher Badge */}
              <button
                onClick={onOpenVoiceModal}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isMale
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
              >
                <span>{isMale ? 'Male Voice' : 'Female Voice'}</span>
                <SlidersHorizontal className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span>English Mentor & Fluent Urdu Assistant</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/90 font-mono text-[10px]">{activeVoiceInfo.name} ({activeVoiceInfo.geminiVoice})</span>
            </p>
          </div>
        </div>

        {/* Header Controls: Audio Toggle & Scenario Picker */}
        <div className="flex items-center gap-2">
          {/* Mute / Auto-speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              autoSpeak 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{autoSpeak ? "Audio On" : "Mute"}</span>
          </button>

          {/* Scenario Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-medium max-w-[120px] sm:max-w-none truncate">{selectedScenario.title}</span>
            </button>

            {/* Scenario Dropdown Menu */}
            {showScenarioMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0a0d14] border border-cyan-500/30 rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-800 flex justify-between items-center">
                  <span>Select Practice Scenario</span>
                  <span className="font-urdu text-cyan-400">مواقف انتخاب کریں</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 mt-1">
                  {PRACTICE_SCENARIOS.map(scen => (
                    <button
                      key={scen.id}
                      onClick={() => handleScenarioSelect(scen)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-all cursor-pointer ${
                        selectedScenario.id === scen.id 
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' 
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{scen.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{scen.difficulty}</span>
                      </div>
                      <span className="font-urdu text-[11px] text-cyan-400/90 text-right">{scen.urduTitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#05070a]/60">
        
        {/* Scenario Hint Card */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="text-slate-200 font-medium">{selectedScenario.description}</p>
            <p className="text-cyan-400 font-urdu">{selectedScenario.urduDescription}</p>
          </div>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1 font-mono">
                <span>{isUser ? 'You (آپ)' : `${tutorName} (${tutorUrduName})`}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-xl transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-cyan-600/10'
                    : 'bg-[#0a0d14] border border-slate-800 text-slate-100 rounded-bl-none shadow-2xl'
                }`}
              >
                {/* Message Header & Audio Button */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                        isSpeaking
                          ? 'bg-cyan-500 text-slate-950 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title={`Listen with ${activeVoiceInfo.name}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Urdu Translation Section */}
                {!isUser && msg.urduTranslation && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Urdu Translation
                      </span>
                      <button
                        onClick={() => toggleTranslation(msg.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {msg.showTranslation ? 'Hide Urdu' : 'Show Urdu'}
                      </button>
                    </div>

                    {msg.showTranslation && (
                      <div className="bg-[#05070a] rounded-2xl p-3 border border-slate-800/80 space-y-1">
                        <p className="font-urdu text-sm text-cyan-300 font-semibold leading-relaxed">
                          {msg.urduTranslation}
                        </p>
                        {msg.romanUrdu && (
                          <p className="text-[11px] text-slate-400 italic">
                            "{msg.romanUrdu}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Grammar & Fluency Feedback Box */}
                {!isUser && msg.feedback && (msg.feedback.grammarCorrection || msg.feedback.pronunciationTip || msg.feedback.betterPhrasing) && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Lightbulb className="w-4 h-4" />
                      <span>Fluency & Grammar Coach</span>
                    </div>

                    {msg.feedback.grammarCorrection && (
                      <p className="text-xs text-slate-300">
                        <span className="text-amber-300 font-medium">Correction: </span>
                        {msg.feedback.grammarCorrection}
                      </p>
                    )}

                    {msg.feedback.betterPhrasing && (
                      <p className="text-xs text-slate-300">
                        <span className="text-cyan-400 font-medium">Native Phrasing: </span>
                        "{msg.feedback.betterPhrasing}"
                      </p>
                    )}

                    {msg.feedback.pronunciationTip && (
                      <p className="text-xs text-slate-300">
                        <span className="text-teal-300 font-medium">Pronunciation Tip: </span>
                        {msg.feedback.pronunciationTip}
                      </p>
                    )}
                  </div>
                )}

                {/* Key Vocabulary Highlights */}
                {!isUser && msg.vocabularyHighlights && msg.vocabularyHighlights.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                      Key Vocabulary (اہم الفاظ):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.vocabularyHighlights.map((vocab, i) => {
                        const isSaved = savedWords.includes(vocab.word.toLowerCase());
                        return (
                          <div
                            key={i}
                            className="bg-[#05070a] border border-slate-800 rounded-xl p-2 text-xs flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-semibold text-cyan-300">{vocab.word}</span>
                              <span className="text-[10px] text-slate-400 ml-1 font-mono">{vocab.ipa}</span>
                              <span className="font-urdu text-[11px] text-cyan-400 block">{vocab.urduMeaning}</span>
                            </div>
                            <button
                              onClick={() => onSaveWord(vocab.word, vocab.urduMeaning, vocab.ipa, vocab.example)}
                              className={`p-1 rounded hover:bg-slate-800 cursor-pointer ${
                                isSaved ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={isSaved ? "Saved to Phrasebook" : "Save Word"}
                            >
                              <BookMarked className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Reply Chips */}
              {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 pl-2 max-w-[85%]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" /> Click to Practice Speaking:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(reply.english)}
                        className="text-left bg-[#0a0d14] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl px-3.5 py-2 text-xs transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="text-slate-200 group-hover:text-cyan-300 font-medium">
                          {reply.english}
                        </div>
                        <div className="font-urdu text-[11px] text-cyan-400/80">
                          {reply.urdu}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Speech Transcript Preview */}
        {interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl p-3 bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs italic animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <span className="font-semibold not-italic text-cyan-400 block mb-1">Listening to your voice...</span>
              "{interimTranscript}"
            </div>
          </div>
        )}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400 bg-[#0a0d14] border border-slate-800 p-3.5 rounded-2xl w-fit shadow-xl">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{tutorName} is thinking & crafting feedback...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input & Voice Mic Trigger */}
      <div className="p-3.5 sm:p-4 bg-[#0a0d14] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2.5"
        >
          {/* Recording Microphone Trigger */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(34,211,238,0.3)]'
            }`}
            title={isRecording ? "Stop Recording" : `Speak to ${tutorName} (Voice Input)`}
          >
            {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-slate-950" />}
          </button>

          {/* Text Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "Listening to your speech..." : `Type or speak in English to ${tutorName}... (یا اردو میں لکھیں)`}
              className="w-full bg-[#05070a] text-slate-100 placeholder-slate-500 text-sm rounded-2xl pl-4 pr-10 py-3.5 border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 transition-all cursor-pointer border border-slate-800"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
