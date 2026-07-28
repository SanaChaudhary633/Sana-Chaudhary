import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatPartner } from './components/ChatPartner';
import { TranslatorDictionary } from './components/TranslatorDictionary';
import { PronunciationTrainer } from './components/PronunciationTrainer';
import { DailyPracticeScenarios } from './components/DailyPracticeScenarios';
import { PhrasebookVocabulary } from './components/PhrasebookVocabulary';
import { FluencyProgress } from './components/FluencyProgress';
import { VoiceSelectorModal } from './components/VoiceSelectorModal';
import { VocabularyWord, PracticeScenario } from './types';
import { VoiceConfig } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'translate' | 'pronounce' | 'scenarios' | 'vocabulary' | 'progress'>('chat');
  const [userLevel, setUserLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [streakCount, setStreakCount] = useState<number>(4);

  // Voice Selection State (Male / Female Tutor Voice Config)
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    gender: 'female',
    voiceName: 'Kore',
    rate: 0.95,
    pitch: 1.0,
  });
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Load / Persist Voice Config
  useEffect(() => {
    try {
      const savedVoice = localStorage.getItem('bolenglish_voice_config');
      if (savedVoice) {
        setVoiceConfig(JSON.parse(savedVoice));
      }
    } catch (e) {
      console.warn("Failed to load voice config from storage", e);
    }
  }, []);

  const handleUpdateVoiceConfig = (newConfig: VoiceConfig) => {
    setVoiceConfig(newConfig);
    try {
      localStorage.setItem('bolenglish_voice_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn("Failed to save voice config", e);
    }
  };

  // Initial phrasebook state with default English-Urdu words
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>([
    {
      id: 'vocab_1',
      word: 'Fluency',
      phonetic: '/ˈfluː.ən.si/',
      partOfSpeech: 'noun',
      definition: 'The ability to express oneself easily and accurately in a language.',
      urduMeaning: 'روانی، بلاغت، بغیر رکاوٹ بولنا',
      romanUrdu: 'Rawani, Blaghat',
      exampleSentence: 'Practice every day to improve your English fluency.',
      urduExample: 'اپنی انگلش کی روانی بہتر بنانے کے لیے روزانہ مشق کریں۔',
      dateAdded: new Date().toISOString().split('T')[0],
      mastered: false,
    },
    {
      id: 'vocab_2',
      word: 'Articulate',
      phonetic: '/ɑːrˈtɪk.jə.lət/',
      partOfSpeech: 'adjective',
      definition: 'Having or showing the ability to speak fluently and coherently.',
      urduMeaning: 'واضح بولنے والا، فصیح',
      romanUrdu: 'Wazih bolne wala',
      exampleSentence: 'She gave an articulate speech at the meeting.',
      urduExample: 'اس نے اجلاس میں بہت واضح تقریر کی۔',
      dateAdded: new Date().toISOString().split('T')[0],
      mastered: true,
    },
    {
      id: 'vocab_3',
      word: 'Resilient',
      phonetic: '/rɪˈzɪl.jənt/',
      partOfSpeech: 'adjective',
      definition: 'Able to withstand or recover quickly from difficult conditions.',
      urduMeaning: 'مضبوط، مشکلات کا مقابلہ کرنے والا',
      romanUrdu: 'Mazboot, Mushkilat ka muqabla karne wala',
      exampleSentence: 'Keep practicing, language learners are very resilient!',
      urduExample: 'مشق جاری رکھیں، زبان سیکھنے والے بہت باہمت ہوتے ہیں!',
      dateAdded: new Date().toISOString().split('T')[0],
      mastered: false,
    }
  ]);

  // Load / Persist phrasebook in LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bolenglish_phrasebook');
      if (saved) {
        setVocabularyList(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load phrasebook from storage", e);
    }
  }, []);

  const saveToStorage = (newList: VocabularyWord[]) => {
    setVocabularyList(newList);
    try {
      localStorage.setItem('bolenglish_phrasebook', JSON.stringify(newList));
    } catch (e) {
      console.warn("Failed to save phrasebook", e);
    }
  };

  const handleSaveWord = (word: string, meaning: string, ipa: string, example: string) => {
    if (vocabularyList.some(v => v.word.toLowerCase() === word.toLowerCase())) {
      return; // Already exists
    }

    const newWord: VocabularyWord = {
      id: `vocab_${Date.now()}`,
      word,
      phonetic: ipa || '/phonetic/',
      partOfSpeech: 'word',
      definition: meaning,
      urduMeaning: meaning,
      romanUrdu: word,
      exampleSentence: example || `Useful phrase: ${word}`,
      urduExample: meaning,
      dateAdded: new Date().toISOString().split('T')[0],
      mastered: false
    };

    saveToStorage([newWord, ...vocabularyList]);
  };

  const handleRemoveWord = (id: string) => {
    saveToStorage(vocabularyList.filter(v => v.id !== id));
  };

  const handleToggleMastered = (id: string) => {
    saveToStorage(
      vocabularyList.map(v => v.id === id ? { ...v, mastered: !v.mastered } : v)
    );
  };

  const handleSelectScenarioFromHub = (scenario: PracticeScenario) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Ambient Glowing Blur Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={streakCount}
        userLevel={userLevel}
        setUserLevel={setUserLevel}
        voiceConfig={voiceConfig}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10 relative">
        {activeTab === 'chat' && (
          <ChatPartner
            userLevel={userLevel}
            onSaveWord={handleSaveWord}
            savedWords={vocabularyList.map(v => v.word.toLowerCase())}
            voiceConfig={voiceConfig}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeTab === 'translate' && (
          <TranslatorDictionary
            onSaveWord={handleSaveWord}
            savedWords={vocabularyList.map(v => v.word.toLowerCase())}
          />
        )}

        {activeTab === 'pronounce' && (
          <PronunciationTrainer />
        )}

        {activeTab === 'scenarios' && (
          <DailyPracticeScenarios
            onSelectScenario={handleSelectScenarioFromHub}
            onSaveWord={handleSaveWord}
          />
        )}

        {activeTab === 'vocabulary' && (
          <PhrasebookVocabulary
            vocabularyList={vocabularyList}
            onRemoveWord={handleRemoveWord}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {activeTab === 'progress' && (
          <FluencyProgress
            streakCount={streakCount}
            savedWordsCount={vocabularyList.length}
            userLevel={userLevel}
          />
        )}
      </main>

      {/* Voice Gender & Persona Modal */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceConfig={voiceConfig}
        onUpdateVoiceConfig={handleUpdateVoiceConfig}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-[#0a0d14] py-4 px-6 text-center text-xs text-slate-500 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BolEnglish AI • Gemini Powered Conversational Assistant</span>
          <span className="font-urdu text-cyan-400">انگلش بولنا سیکھیں آسان اور روانی کے ساتھ</span>
        </div>
      </footer>
    </div>
  );
}
