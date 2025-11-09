import { frenchCommonWords } from './dictionary';

export interface SpellcheckEntry {
  word: string;
  occurrences: number;
  suggestions: string[];
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const dictionary = new Set(frenchCommonWords.map(normalize));

const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1));
  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const WORD_PATTERN = /[A-Za-zÀ-ÖØ-öø-ÿ'-]{3,}/gu;

export const computeSpellcheck = (text: string): SpellcheckEntry[] => {
  const counts = new Map<string, { original: string; occurrences: number }>();
  const suggestions = new Map<string, string[]>();

  const matches = text.matchAll(WORD_PATTERN);
  for (const match of matches) {
    const raw = match[0];
    const normalized = normalize(raw);
    if (normalized.length < 3) {
      continue;
    }
    if (/^\d+$/.test(raw)) {
      continue;
    }
    if (dictionary.has(normalized)) {
      continue;
    }
    const entry = counts.get(normalized) ?? { original: raw, occurrences: 0 };
    entry.occurrences += 1;
    entry.original = raw;
    counts.set(normalized, entry);
  }

  if (counts.size === 0) {
    return [];
  }

  const dictionaryList = Array.from(dictionary.values());

  for (const [normalized, entry] of counts.entries()) {
    const ranked = dictionaryList
      .map((word) => ({ word, distance: levenshtein(normalized, word) }))
      .filter((item) => item.distance <= 2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map((item) => frenchCommonWords.find((original) => normalize(original) === item.word) ?? item.word);
    suggestions.set(normalized, ranked);
  }

  return Array.from(counts.entries())
    .map(([normalized, value]) => ({
      word: value.original,
      occurrences: value.occurrences,
      suggestions: suggestions.get(normalized) ?? []
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.word.localeCompare(b.word));
};
