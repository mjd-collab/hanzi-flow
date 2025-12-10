import cnchar from 'cnchar';
import 'cnchar-poly';
import 'cnchar-radical';
import 'cnchar-explain';
import 'cnchar-words';
import 'cnchar-order';

// Initialize cnchar
cnchar.use();

export interface WordItem {
  text: string;
  pinyin: string;
}

export interface CharacterMetadata {
  radical: string;
  radicalStrokes: number;
  totalStrokes: number;
  remainingStrokes: number;
  pinyin: string[];
  words: WordItem[];
  definition: string;
}

export const cleanHanziString = (input: string): string => {
  const hanziRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/g;
  const matches = input.match(hanziRegex);
  return matches ? matches.join('') : '';
};

export const getStrokeNames = (char: string): string[] => {
    try {
        // @ts-ignore
        const strokes = cnchar.stroke(char, 'order', 'name');
        if(Array.isArray(strokes)) return strokes;
        return [];
    } catch (e) {
        return [];
    }
}

export const getCharacterInfo = async (char: string): Promise<CharacterMetadata> => {
  if (!char) return { 
    radical: '', 
    radicalStrokes: 0,
    totalStrokes: 0,
    remainingStrokes: 0,
    pinyin: [], 
    words: [], 
    definition: '' 
  };

  try {
    // @ts-ignore
    const spellInfo = cnchar.spell(char, 'array', 'tone', 'low');
    
    // @ts-ignore
    const radicalData = cnchar.radical(char);
    const info = Array.isArray(radicalData) ? radicalData[0] : radicalData;
    
    const radical = info?.radical || '';
    const totalStrokes = (info as any)?.stroke || (cnchar as any).stroke(char);
    const radicalStrokes = info?.radicalCount || (radical ? (cnchar as any).stroke(radical) : 0);
    const remainingStrokes = Math.max(0, totalStrokes - radicalStrokes);

    // @ts-ignore
    const explainData = cnchar.explain(char);
    let definition = '';
    if (explainData && Array.isArray(explainData)) {
        definition = explainData[0]?.replace(/.*\s：/, '') || '';
    }

    // @ts-ignore
    const wordsData = cnchar.words(char);
    const rawWords: string[] = Array.isArray(wordsData) ? wordsData.slice(0, 3) : [];
    
    const words: WordItem[] = rawWords.map(w => {
        // @ts-ignore
        const wp = cnchar.spell(w, 'tone', 'low');
        return { text: w, pinyin: wp as string };
    });

    return {
      radical,
      radicalStrokes: typeof radicalStrokes === 'number' ? radicalStrokes : 0,
      totalStrokes: typeof totalStrokes === 'number' ? totalStrokes : 0,
      remainingStrokes: typeof remainingStrokes === 'number' ? remainingStrokes : 0,
      pinyin: Array.isArray(spellInfo) ? spellInfo : [spellInfo],
      words,
      definition: definition.slice(0, 20)
    };
  } catch (e) {
    console.warn("Dictionary lookup failed", e);
    return {
      radical: '',
      radicalStrokes: 0,
      totalStrokes: 0,
      remainingStrokes: 0,
      pinyin: [],
      words: [],
      definition: ''
    };
  }
};
