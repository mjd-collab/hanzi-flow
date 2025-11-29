import cnchar from 'cnchar';
import 'cnchar-poly';
import 'cnchar-radical';
import 'cnchar-explain';
import 'cnchar-words';

// Initialize cnchar (optional config)
cnchar.use();

export interface CharacterMetadata {
  radical: string;
  strokes: number;
  pinyin: string[];
  words: string[];
  definition: string;
}

/**
 * Clean input string to keep only Chinese characters
 */
export const cleanHanziString = (input: string): string => {
  const hanziRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/g;
  const matches = input.match(hanziRegex);
  return matches ? matches.join('') : '';
};

/**
 * Fetches metadata using cnchar library (Offline/Local)
 */
export const getCharacterInfo = async (char: string): Promise<CharacterMetadata> => {
  if (!char) return { radical: '', strokes: 0, pinyin: [], words: [], definition: '' };

  try {
    // 1. Get basic info (spell = pinyin, stroke = strokes)
    // args: 'spell', 'stroke', 'up' (uppercase tone)
    const spellInfo = (cnchar as any).spell(char, 'array', 'tone');
    const strokeCount = (cnchar as any).stroke(char);
    
    // 2. Get Radical
    // @ts-ignore
    const radical = cnchar.radical(char) || '';

    // 3. Get Explanation (Definition)
    // @ts-ignore
    const explainData = cnchar.explain(char);
    let definition = '';
    if (explainData && Array.isArray(explainData)) {
        // Extract the first meaning, cleanup format
        definition = explainData[0]?.replace(/.*\s：/, '') || '';
    }

    // 4. Get Words (组词)
    // @ts-ignore
    const wordsData = cnchar.words(char);
    const words = Array.isArray(wordsData) ? wordsData.slice(0, 3) : [];

    return {
      radical: typeof radical === 'string' ? radical : radical[0]?.radical || '',
      strokes: typeof strokeCount === 'number' ? strokeCount : 0,
      pinyin: Array.isArray(spellInfo) ? spellInfo : [spellInfo],
      words: words,
      definition: definition.slice(0, 20) // Limit length for UI
    };
  } catch (e) {
    console.warn("Dictionary lookup failed", e);
    return {
      radical: '',
      strokes: 0,
      pinyin: [],
      words: [],
      definition: ''
    };
  }
};