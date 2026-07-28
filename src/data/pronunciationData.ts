import { PronunciationItem } from '../types';

export const MINIMAL_PAIRS: PronunciationItem[] = [
  {
    id: 'mp_ship_sheep',
    targetWordOrPhrase: 'Ship vs Sheep',
    phoneticIpa: '/ʃɪp/ vs /ʃiːp/',
    urduTransliteration: 'شپ بمقابلہ شیپ',
    category: 'minimal_pairs',
    diffWord1: 'Ship (Short Vowel /ɪ/)',
    diffWord2: 'Sheep (Long Vowel /iː/)',
    urduMeaning: 'بحری جہاز بمقابلہ بھیڑ',
    tips: 'In "Ship", relax your mouth for a quick "ɪ". In "Sheep", pull the corners of your mouth back into a full smile for "iː".',
  },
  {
    id: 'mp_think_sink',
    targetWordOrPhrase: 'Think vs Sink',
    phoneticIpa: '/θɪŋk/ vs /sɪŋk/',
    urduTransliteration: 'تھنک بمقابلہ سنک',
    category: 'minimal_pairs',
    diffWord1: 'Think (Tongue between teeth /θ/)',
    diffWord2: 'Sink (Tongue behind teeth /s/)',
    urduMeaning: 'سوچنا بمقابلہ ڈوبنا',
    tips: 'For "Think", gently place your tongue tip between your upper and lower teeth and blow air out softly.',
  },
  {
    id: 'mp_vet_wet',
    targetWordOrPhrase: 'Vet vs Wet',
    phoneticIpa: '/vet/ vs /wet/',
    urduTransliteration: 'ویٹ (V) بمقابلہ ویٹ (W)',
    category: 'minimal_pairs',
    diffWord1: 'Vet (Top teeth on bottom lip /v/)',
    diffWord2: 'Wet (Rounded lips /w/)',
    urduMeaning: 'جانوروں کا ڈاکٹر بمقابلہ گیلا',
    tips: 'Urdu speakers often mix V and W! For "Vet", place your top teeth gently on your lower lip. For "Wet", make a round circle with your lips like blowing a kiss.',
  },
  {
    id: 'mp_pen_pan',
    targetWordOrPhrase: 'Pen vs Pan',
    phoneticIpa: '/pen/ vs /pæn/',
    urduTransliteration: 'پین (Pen) بمقابلہ پین (Pan)',
    category: 'minimal_pairs',
    diffWord1: 'Pen (Mid vowel /e/)',
    diffWord2: 'Pan (Open wide vowel /æ/)',
    urduMeaning: 'قلم بمقابلہ برتن/فرائنگ پین',
    tips: 'For "Pan", drop your jaw wider than you would for "Pen".',
  },
  {
    id: 'mp_full_fool',
    targetWordOrPhrase: 'Full vs Fool',
    phoneticIpa: '/fʊl/ vs /fuːl/',
    urduTransliteration: 'فل بمقابلہ فول',
    category: 'minimal_pairs',
    diffWord1: 'Full (Relaxed short /ʊ/)',
    diffWord2: 'Fool (Tight long /uː/)',
    urduMeaning: 'بھرا ہوا بمقابلہ بیوقوف',
    tips: 'Don\'t pronounce "Full" like "Fool"! "Full" uses a relaxed throat sound like "book".',
  }
];

export const TONGUE_TWISTERS: PronunciationItem[] = [
  {
    id: 'tt_th',
    targetWordOrPhrase: 'Thirty-three thirsty thieves thought of thrilling things.',
    phoneticIpa: '/ˈθɜː.ti θriː ˈθɜː.sti θiːvz θɔːt əv ˈθrɪl.ɪŋ θɪŋz/',
    urduTransliteration: 'تھرٹی تھری تھرسٹی تھیوز تھوٹ آف تھرلنگ تھنگز',
    category: 'tongue_twister',
    urduMeaning: 'تینتیس پیاسے چوروں نے سنسنی خیز باتوں کے بارے میں سوچا۔',
    tips: 'Focus on keeping your tongue relaxed at the teeth boundary for every "th" /θ/ sound!',
  },
  {
    id: 'tt_s_sh',
    targetWordOrPhrase: 'She sells seashells by the seashore.',
    phoneticIpa: '/ʃiː selz ˈsiː.ʃelz baɪ ðə ˈsiː.ʃɔːr/',
    urduTransliteration: 'شی سیلز سی شیلز بائی دی سی شور',
    category: 'tongue_twister',
    urduMeaning: 'وہ سمندر کے کنارے صدف بیچتی ہے۔',
    tips: 'Alternate smoothly between /ʃ/ (sh - "ش") and /s/ (s - "س").',
  },
  {
    id: 'tt_w_v',
    targetWordOrPhrase: 'Very well, white wine will work wonders.',
    phoneticIpa: '/ˈver.i wel waɪt waɪn wɪl ˈwʌn.dəz/',
    urduTransliteration: 'ویری ویل وائٹ وائن ول ونڈرز',
    category: 'tongue_twister',
    urduMeaning: 'بہت خوب، سفید وائن زبردست اثر دکھائے گی۔',
    tips: 'Switch between tooth-lip contact (/v/ for "Very") and rounded lips (/w/ for "well", "white", "wine", "will", "wonders").',
  },
  {
    id: 'tt_p_f',
    targetWordOrPhrase: 'Peter Piper picked a peck of pickled peppers.',
    phoneticIpa: '/ˈpiː.tər ˈpaɪ.pər pɪkt ə pek əv ˈpɪk.l̩d ˈpep.əz/',
    urduTransliteration: 'پیٹر پائپر پکڈ اَ پیک آف پکلڈ پیپرز',
    category: 'tongue_twister',
    urduMeaning: 'پیٹر پائپر نے اچار والی مرچوں کا ایک تھیلا چنا۔',
    tips: 'Practice burst-puffs of air on every "P" sound (aspiration)!',
  }
];

export interface PhoneticSound {
  symbol: string;
  exampleWord: string;
  urduEquivalent: string;
  urduDescription: string;
  tip: string;
}

export const PHONETIC_CHARTS: PhoneticSound[] = [
  {
    symbol: '/θ/',
    exampleWord: 'Think, Thank, Both',
    urduEquivalent: 'تھ (نرم "ت" کی آواز)',
    urduDescription: 'زبان کو اوپر اور نیچے والے دانتوں کے درمیان رکھ کر ہوا خارج کریں۔',
    tip: 'Put your tongue tip slightly between your teeth.',
  },
  {
    symbol: '/ð/',
    exampleWord: 'This, That, Mother',
    urduEquivalent: 'دھ (نرم "د" کی آواز)',
    urduDescription: 'تھ /θ/ کی طرح زبان دانتوں میں رکھ کر گلے سے آواز پیدا کریں۔',
    tip: 'Vocalized "th" - feel your vocal cords vibrate.',
  },
  {
    symbol: '/v/',
    exampleWord: 'Voice, Victory, Love',
    urduEquivalent: 'و (دانتوں اور ہونٹوں سے)',
    urduDescription: 'اوپر کے دانت نیچے والے ہونٹ پر رکھ کر آواز بنائیں۔',
    tip: 'Top teeth resting gently on bottom lip.',
  },
  {
    symbol: '/w/',
    exampleWord: 'Water, World, Where',
    urduEquivalent: 'و (گول ہونٹوں سے)',
    urduDescription: 'ہونٹوں کو گول کر کے سٹی کی طرح شکل بنائیں۔',
    tip: 'Round your lips like whistling before saying the word.',
  },
  {
    symbol: '/æ/',
    exampleWord: 'Cat, Apple, Flat',
    urduEquivalent: 'ایـ (کھلی آواز)',
    urduDescription: 'منہ کو زیادہ کھول کر گہری "ایـ" کی آواز نکالیں۔',
    tip: 'Drop your jaw down wide when producing this vowel.',
  },
  {
    symbol: '/ŋ/',
    exampleWord: 'Sing, Ring, English',
    urduEquivalent: 'نگ (ناک کی آواز)',
    urduDescription: 'زبان کے پچھلے حصے کو تالو سے ملا کر ناک سے آواز نکالیں۔',
    tip: 'Velar nasal sound - do not pronounce a hard "g" at the end.',
  }
];
