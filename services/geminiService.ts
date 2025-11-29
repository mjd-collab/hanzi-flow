import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Extracts Chinese characters from a base64 image string.
 */
export const extractHanziFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify all Chinese characters (Hanzi) visible in this image. Return ONLY the characters combined in a single string. Do not include pinyin, translation, punctuation, or any other text. If no Chinese characters are found, return an empty string.",
          },
        ],
      },
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("Failed to recognize characters.");
  }
};

/**
 * Filters a string to return only Chinese characters.
 */
export const cleanHanziString = (input: string): string => {
  // Regex matches Chinese characters
  const hanziRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/g;
  const matches = input.match(hanziRegex);
  return matches ? matches.join('') : '';
};

export interface CharacterMetadata {
  radical: string;
  strokes: number;
  pinyin: string[];
  words: string[];
  definition: string;
}

/**
 * Fetches metadata (radical, strokes, pinyin, words, definition) for a given character.
 */
export const getCharacterInfo = async (char: string): Promise<CharacterMetadata> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `For the Chinese character '${char}', return a JSON object with these keys:
        - "radical": (string) the radical character.
        - "strokes": (number) total stroke count.
        - "pinyin": (array of strings) all common pinyin readings with tone marks.
        - "words": (array of strings) 3-4 common words or idioms using this character.
        - "definition": (string) a concise definition in Simplified Chinese (简体中文) (max 15 chars).
        Return ONLY the JSON string, no markdown formatting.`,
        config: {
            responseMimeType: 'application/json',
        }
    });
    
    const text = response.text || '{}';
    const data = JSON.parse(text);
    return {
        radical: data.radical || '?',
        strokes: typeof data.strokes === 'number' ? data.strokes : 0,
        pinyin: Array.isArray(data.pinyin) ? data.pinyin : [],
        words: Array.isArray(data.words) ? data.words : [],
        definition: data.definition || ''
    };
  } catch (e) {
      console.warn("Failed to fetch char info", e);
      return { 
          radical: '', 
          strokes: 0,
          pinyin: [],
          words: [],
          definition: ''
      };
  }
}