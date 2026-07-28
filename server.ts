import { GoogleGenAI, Type, Modality } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Model definitions
const MODEL_NAME = "gemini-3.6-flash";
const TTS_MODEL_NAME = "gemini-3.1-flash-tts-preview";

// Helper for clean JSON extraction from Gemini response
function cleanJsonResponse(rawText: string) {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response:", rawText);
    throw new Error("Invalid response format from AI service");
  }
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Interactive Chat Conversation with AI Partner (Zara female / Zain male)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, scenario, userLevel = "Intermediate", tutorGender = "female" } = req.body;

    const tutorName = tutorGender === "male" ? "Zain (زین)" : "Zara (زارا)";

    const systemInstruction = `You are ${tutorName}, a warm, patient, and highly encouraging AI English conversational tutor and language mentor.
You are fully fluent in both English and Urdu.
Your primary role is to help users improve spoken English fluency, vocabulary, and pronunciation through interactive conversation, while seamlessly providing instant Urdu explanations when helpful.

Current Scenario Context: ${scenario || "General Friendly English Practice"}
User Proficiency Level: ${userLevel}
Tutor Persona Gender: ${tutorGender}

Instructions:
1. Respond to the user in natural, friendly English (1-3 conversational sentences).
2. Assess what the user said for English grammar, natural phrasing, and pronunciation issues.
3. Generate a response strictly in JSON matching this schema:
{
  "reply": "Your conversational response in natural English",
  "urduTranslation": "Accurate Urdu translation of your reply in clear Nastaliq script (اردو)",
  "romanUrdu": "Roman Urdu version of the translation (e.g. 'Main theek hoon, aap kaise hain?')",
  "feedback": {
    "grammarCorrection": "Optional gentle grammar fix if user made an error, otherwise null",
    "pronunciationTip": "Phonetic or pronunciation tip if relevant, otherwise null",
    "betterPhrasing": "More natural native way to phrase what the user said (or null)",
    "fluencyScore": number (1 to 100 based on clarity, vocabulary & correctness)
  },
  "suggestedReplies": [
    { "english": "Short follow-up option 1 in English", "urdu": "اردو میں ترجمہ" },
    { "english": "Short follow-up option 2 in English", "urdu": "اردو میں ترجمہ" },
    { "english": "Short follow-up option 3 in English", "urdu": "اردو میں ترجمہ" }
  ],
  "vocabularyHighlights": [
    {
      "word": "key vocabulary word from your reply",
      "ipa": "/phonetic ipa/",
      "urduMeaning": "اردو معنی",
      "example": "Simple example sentence"
    }
  ]
}`;

    const promptContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Generate structured content
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = cleanJsonResponse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat response" });
  }
});

// 2. Instant English <-> Urdu Translation & Deep Analysis
app.post("/api/translate", async (req, res) => {
  try {
    const { text, direction = "en-to-ur" } = req.body;

    const systemInstruction = `You are an expert bilingual linguist translating between English and Urdu.
Translate the phrase with maximum context accuracy, and break down complex grammar, idioms, and vocabulary.

Direction: ${direction === "en-to-ur" ? "English to Urdu" : "Urdu to English"}

Return JSON format strictly:
{
  "sourceText": "${text}",
  "translatedText": "Full accurate translation in target script",
  "direction": "${direction}",
  "romanUrdu": "Roman Urdu transliteration",
  "phoneticIpa": "/IPA phonetic guide/",
  "grammaticalBreakdown": [
    {
      "part": "Phrase or word",
      "type": "Noun/Verb/Idiom/Tense",
      "explanationEn": "Explanation in English",
      "explanationUr": "اردو میں وضاحت"
    }
  ],
  "keyVocabulary": [
    {
      "word": "Key word",
      "meaning": "English meaning",
      "urdu": "اردو معنی"
    }
  ],
  "culturalContext": "Optional cultural context or nuance note if applicable, else null"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate and analyze this text: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = cleanJsonResponse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Translation API Error:", error);
    res.status(500).json({ error: error.message || "Failed to perform translation" });
  }
});

// 3. Pronunciation & Audio Analysis
app.post("/api/analyze-pronunciation", async (req, res) => {
  try {
    const { targetText, spokenText } = req.body;

    const systemInstruction = `You are a speech therapist and phonetics coach specializing in English pronunciation for Urdu native speakers.
Analyze the user's spoken transcript against the target English text. Identify common mispronunciations (e.g. 'v' vs 'w', 'th' /θ/ vs /d/, short/long vowels, silent letters).

Return JSON format strictly:
{
  "score": number (0 to 100 accuracy score),
  "spokenAccuracyPercentage": number,
  "matchedWords": ["array", "of", "correctly", "spoken", "words"],
  "mispronouncedWords": [
    {
      "word": "Word",
      "expectedIpa": "/expected IPA/",
      "perceivedIssue": "Description of common mistake (e.g., sound substituted)",
      "urduTip": "اردو میں ہدایت - زبان کہاں رکھنی ہے"
    }
  ],
  "fluencyRating": "Excellent" | "Good" | "Needs Practice" | "Keep Trying",
  "praiseEn": "Encouraging remark in English",
  "praiseUr": "حوصلہ افزا بات اردو میں"
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Target sentence: "${targetText}"\nUser spoken transcript: "${spokenText}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = cleanJsonResponse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Pronunciation API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze pronunciation" });
  }
});

// 4. Text-To-Speech API via Gemini TTS (Supports custom voiceName: Kore, Aoede, Leda, Puck, Fenrir, Charon)
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore", gender = "female" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Default voice fallback if generic gender requested
    let targetVoice = voiceName;
    if (!targetVoice || targetVoice === "default") {
      targetVoice = gender === "male" ? "Puck" : "Kore";
    }

    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: [{ parts: [{ text: `Say clearly in standard natural English: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: targetVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.[0];
    const base64Audio = audioPart?.inlineData?.data;

    if (base64Audio) {
      res.json({ audioBase64: base64Audio, mimeType: audioPart?.inlineData?.mimeType || "audio/pcm" });
    } else {
      res.status(500).json({ error: "Audio generation yielded no binary data" });
    }
  } catch (error: any) {
    console.error("TTS API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate speech" });
  }
});

// 5. Daily Challenge & Word of the Day Generator
app.get("/api/daily-challenge", async (req, res) => {
  try {
    const systemInstruction = `Generate a daily English learning challenge for an Urdu speaker.
Return JSON format strictly:
{
  "topic": "English Topic Title",
  "urduTopic": "اردو عنوان",
  "scenario": "Short description of daily speaking scenario",
  "targetWords": ["word1", "word2", "word3"],
  "wordOfDay": {
    "id": "wod_1",
    "word": "Resilient",
    "phonetic": "/rɪˈzɪl.jənt/",
    "partOfSpeech": "adjective",
    "definition": "Able to withstand or recover quickly from difficult conditions.",
    "urduMeaning": "مضبوط، پائیدار، مشکل سے سنبھلنے والا",
    "romanUrdu": "Mazboot, Paidaar",
    "exampleSentence": "She was resilient in the face of hardship.",
    "urduExample": "وہ مشکلات کا سامنا کرنے میں بہت مضبوط تھی۔",
    "dateAdded": "${new Date().toISOString().split("T")[0]}",
    "mastered": false
  },
  "minimalPair": {
    "id": "mp_1",
    "targetWordOrPhrase": "Ship vs Sheep",
    "phoneticIpa": "/ʃɪp/ vs /ʃiːp/",
    "urduTransliteration": "شپ بمقابلہ شیپ",
    "category": "minimal_pairs",
    "diffWord1": "Ship (مختصر 'اِ' کی آواز)",
    "diffWord2": "Sheep (لمبی 'ای' کی آواز)",
    "urduMeaning": "بحری جہاز بمقابلہ بھیڑ",
    "tips": "Notice how 'Ship' has a quick short vowel sound, while 'Sheep' requires stretching your lips wide like a smile!"
  }
}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Generate today's English learning challenge and Word of the Day with Urdu explanations.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = cleanJsonResponse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Daily Challenge API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate daily challenge" });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:3000`);
  });
}

startServer();
