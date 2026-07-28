export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioUrl?: string;
  urduTranslation?: string;
  romanUrdu?: string;
  feedback?: {
    grammarCorrection?: string;
    pronunciationTip?: string;
    betterPhrasing?: string;
    fluencyScore?: number;
  };
  suggestedReplies?: Array<{
    english: string;
    urdu: string;
  }>;
  vocabularyHighlights?: Array<{
    word: string;
    ipa: string;
    urduMeaning: string;
    example: string;
  }>;
  showTranslation?: boolean;
  showDetails?: boolean;
}

export interface PracticeScenario {
  id: string;
  title: string;
  urduTitle: string;
  category: 'daily' | 'work' | 'travel' | 'social' | 'exam';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  urduDescription: string;
  icon: string;
  initialPrompt: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  urduMeaning: string;
  romanUrdu: string;
  exampleSentence: string;
  urduExample: string;
  dateAdded: string;
  mastered: boolean;
}

export interface PronunciationItem {
  id: string;
  targetWordOrPhrase: string;
  phoneticIpa: string;
  urduTransliteration: string;
  category: 'minimal_pairs' | 'tongue_twister' | 'daily_phrase' | 'stress_practice';
  diffWord1?: string;
  diffWord2?: string;
  urduMeaning: string;
  tips: string;
  audioSample?: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  direction: 'en-to-ur' | 'ur-to-en';
  romanUrdu: string;
  phoneticIpa: string;
  grammaticalBreakdown: Array<{
    part: string;
    type: string;
    explanationEn: string;
    explanationUr: string;
  }>;
  keyVocabulary: Array<{
    word: string;
    meaning: string;
    urdu: string;
  }>;
  culturalContext?: string;
}

export interface PronunciationAnalysisResult {
  score: number;
  spokenAccuracyPercentage: number;
  matchedWords: string[];
  mispronouncedWords: Array<{
    word: string;
    expectedIpa: string;
    perceivedIssue: string;
    urduTip: string;
    correctAudioGuide?: string;
  }>;
  fluencyRating: 'Excellent' | 'Good' | 'Needs Practice' | 'Keep Trying';
  praiseEn: string;
  praiseUr: string;
}

export interface DailyChallenge {
  topic: string;
  urduTopic: string;
  targetWords: string[];
  scenario: string;
  wordOfDay: VocabularyWord;
  minimalPair: PronunciationItem;
}
