
/**
 * Utility to track and manage seen words to prevent duplicates across games.
 */

const SEEN_WORDS_KEY = 'vq_recently_seen_words';
const MAX_SEEN_HISTORY = 200; // Keep track of last 200 words to prevent repetition

export const getRecentlySeenWords = (): string[] => {
    try {
        const saved = localStorage.getItem(SEEN_WORDS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
};

export const markWordsAsSeen = (words: string[]) => {
    let seen = getRecentlySeenWords();
    // Add new words to the beginning
    seen = [...words, ...seen];
    // Keep only unique words and limit history
    const uniqueSeen = Array.from(new Set(seen)).slice(0, MAX_SEEN_HISTORY);
    localStorage.setItem(SEEN_WORDS_KEY, JSON.stringify(uniqueSeen));
};

/**
 * Shuffles and filters words to ensure uniqueness and prioritize fresh content.
 * @param allWords Pool of available words
 * @param limit Number of words to pick
 * @returns Array of unique, prioritized words
 */
export const pickUniqueWords = (allWords: any[], limit: number): any[] => {
    if (!allWords || allWords.length === 0) return [];

    const recentlySeen = new Set(getRecentlySeenWords());
    
    // 1. Ensure absolute uniqueness within the pool
    const uniqueMap = new Map();
    allWords.forEach(w => {
        if (w && w.word && !uniqueMap.has(w.word)) {
            uniqueMap.set(w.word, w);
        }
    });
    
    const absoluteUniqueWords = Array.from(uniqueMap.values());

    // 2. Separate into "fresh" and "recent"
    const fresh = absoluteUniqueWords.filter(w => !recentlySeen.has(w.word));
    const recent = absoluteUniqueWords.filter(w => recentlySeen.has(w.word));

    // 3. Shuffle both
    const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());
    const shuffledFresh = shuffle(fresh);
    const shuffledRecent = shuffle(recent);

    // 4. Combine (Fresh first, then Recent if needed)
    const combined = [...shuffledFresh, ...shuffledRecent];

    return combined.slice(0, limit);
};

/**
 * CEFR level mapping based on numeric level.
 * A1: 1-15, A2: 16-50, B1: 51-125, B2: 126-220, C1: 221-300, C2: 301-334
 */
export const getCefrFromLevel = (level: number): string => {
    if (level <= 15) return "A1";
    if (level <= 50) return "A2";
    if (level <= 125) return "B1";
    if (level <= 220) return "B2";
    if (level <= 300) return "C1";
    return "C2";
};

export const getCefrDescription = (cefr: string): string => {
    const desc: any = {
        'A1': 'Beginner - Basic vocabulary and essential phrases.',
        'A2': 'Elementary - Simple everyday communication.',
        'B1': 'Intermediate - Natural dialogue and solid core vocabulary.',
        'B2': 'Upper-Intermediate - Fluent expression and social mobility.',
        'C1': 'Advanced - Complex academic and professional concepts.',
        'C2': 'Proficiency - Near-native mastery of global English.'
    };
    return desc[cefr] || 'General Learner';
};
