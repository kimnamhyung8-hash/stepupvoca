import { en } from './en';
import { ko } from './ko';
import { ja } from './ja';
import { zh } from './zh';
import { vi } from './vi';
import { tw } from './tw';

export type LanguageCode = 'en' | 'ko' | 'ja' | 'zh' | 'vi' | 'tw';

export const languages = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'tw', name: '繁體中文' }
] as const;

export const translations: Record<LanguageCode, Record<string, string>> = {
    en,
    ko,
    ja,
    zh,
    vi,
    tw,
};

let currentLanguage: LanguageCode = 'ko';

export const setLanguage = (lang: LanguageCode) => {
    currentLanguage = lang;
};

export const getLanguage = (): LanguageCode => {
    return currentLanguage;
};

export const getBrowserLanguage = (): LanguageCode => {
    const lang = navigator.language.split('-')[0] as LanguageCode;
    return (Object.keys(translations) as LanguageCode[]).includes(lang) ? lang : 'en';
};

export const getVocaOptions = (word: any, lang: string): string[] => {
    if (!word) return [];
    if (!word.options_loc) return word.options || [];
    return word.options_loc[lang] || word.options || [];
};

export const getVocaMeaning = (word: any, lang: string): string => {
    if (!word) return "";
    
    // 0. Primary fallback for notes/AI-generated report items
    if (word.translation) return word.translation;

    // 1. Try localized meaning field if exists (future-proofing)
    if (word.meaning_loc && word.meaning_loc[lang]) return word.meaning_loc[lang];
    
    // 2. If it's Korean, use the original meaning field which is core
    if (lang === 'ko' && word.meaning) return word.meaning;

    // 3. Fallback to options index (traditional way)
    const options = getVocaOptions(word, lang);
    if (typeof word.answer_index === 'number' && options[word.answer_index]) {
        return options[word.answer_index];
    }
    
    // 4. Ultimate fallback
    return word.meaning || "";
};

export function t(key: string, params?: Record<string, string | number>): string;
export function t(lang: string | undefined | null, key: string, params?: Record<string, string | number>): string;
export function t(arg1: any, arg2?: any, arg3?: any): string {
    let lang: string | undefined | null;
    let key: string;
    let params: Record<string, string | number> | undefined;

    if (typeof arg2 === 'string') {
        // Form: t(lang, key, params)
        lang = arg1;
        key = arg2;
        params = arg3;
    } else {
        // Form: t(key, params)
        lang = currentLanguage;
        key = arg1;
        params = arg2;
    }

    const l = (lang || currentLanguage || 'en') as LanguageCode;
    const dict = translations[l] || translations['en'];
    let text = dict[key] || (translations['en'] && translations['en'][key]) || key;

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
        });
    }

    return text;
}
