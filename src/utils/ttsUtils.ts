import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * TTS 발화 전 텍스트 정제
 * - 이모지 제거
 * - 괄호 및 괄호 안 내용(보통 번역본) 제거
 * - 따옴표 제거
 */
export const cleanTextForTTS = (text: string): string => {
    return text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF])/g, '') // 이모지 제거
        .replace(/\(.*?\)/g, '') // 괄호와 그 안의 내용 제거 (번역본 무시)
        .replace(/["'「」『』]/g, '') // 따옴표 제거
        .replace(/[*_#]/g, '') // 마크다운 기호(*, _, #) 제거
        .replace(/\s+/g, ' ') // 공백 정형화
        .trim();
};

// 10대 소녀 하이톤 명랑 목소리 프로필 배열
export const TEEN_GIRL_PROFILES = [
    { pitch: 1.45, rate: 1.15 },
    { pitch: 1.55, rate: 1.20 },
    { pitch: 1.40, rate: 1.10 },
    { pitch: 1.60, rate: 1.25 }
];

export const NATIVE_TTS_LOCALE: Record<string, string> = {
    ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tw: 'zh-TW', vi: 'vi-VN',
};

let cachedVoices: any[] = [];
export const getBestVoiceIndex = async (langCode: string) => {
    if (cachedVoices.length === 0) {
        try {
            const { voices } = await TextToSpeech.getSupportedVoices();
            cachedVoices = voices || [];
        } catch (e) {}
    }
    if (cachedVoices.length === 0) return undefined;

    const isEn = langCode.startsWith('en');
    const isKo = langCode.startsWith('ko');
    
    if (isEn) {
        const priority = ['Samantha', 'Victoria', 'Karen', 'Tessa', 'Google US English'];
        for (const name of priority) {
            const idx = cachedVoices.findIndex(v => v.name.includes(name) && v.lang.startsWith('en'));
            if (idx !== -1) return idx;
        }
        const femaleIdx = cachedVoices.findIndex(v => v.lang.startsWith('en') && v.name.includes('Female'));
        if (femaleIdx !== -1) return femaleIdx;
    } else if (isKo) {
        const priority = ['Yuna', 'Google 한국의'];
        for (const name of priority) {
            const idx = cachedVoices.findIndex(v => v.name.includes(name) && v.lang.startsWith('ko'));
            if (idx !== -1) return idx;
        }
    }
    
    const fallbackFemale = cachedVoices.findIndex(v => v.lang.startsWith(langCode.split('-')[0]) && v.name.toLowerCase().includes('female'));
    if (fallbackFemale !== -1) return fallbackFemale;
    
    const fallback = cachedVoices.findIndex(v => v.lang.startsWith(langCode.split('-')[0]));
    return fallback !== -1 ? fallback : undefined;
};

/**
 * 20대 밝은 여성(아나운서/강사 톤) 목소리 읽기 도우미
 * 피치: 1.25, 속도: 1.05
 */
export const play20sFemaleTTS = async (text: string, langCode: string = 'en-US') => {
    try {
        await TextToSpeech.stop().catch(() => {});
        const voiceIndex = await getBestVoiceIndex(langCode);
        const options: any = {
            text,
            lang: langCode,
            rate: 1.05,
            pitch: 1.25,
            volume: 1.0,
            category: 'playback',
        };
        if (voiceIndex !== undefined) options.voice = voiceIndex;
        await TextToSpeech.speak(options);
    } catch (e) {
        console.error("20s Female TTS Error:", e);
    }
};

/**
 * 한국어와 영어가 섞인 문장을 분석하여 언어별로 원어민 음성을 번역하여 들려줌
 */
export const playNaturalTTS = async (text: string, defaultLang: string = 'ko') => {
    try {
        await TextToSpeech.stop().catch(() => {});
        
        const cleaned = cleanTextForTTS(text);
        if (!cleaned) return;

        let targetLocale = NATIVE_TTS_LOCALE[defaultLang] || 'ko-KR';

        // 문자열 언어 동적 감지
        const hasKorean = /[가-힣]/.test(cleaned);
        const hasKana = /[ぁ-んァ-ン]/.test(cleaned);
        const hasVietnamese = /[À-ỹẠ-ỹĂăĐđĨĩŨũƠơƯư]/.test(cleaned);
        const hasHanzi = /[\u4E00-\u9FA5]/.test(cleaned);

        if (hasKorean) {
            targetLocale = 'ko-KR';
        } else if (hasKana) {
            targetLocale = 'ja-JP';
        } else if (hasVietnamese) {
            targetLocale = 'vi-VN';
        } else if (hasHanzi) {
            if (defaultLang === 'ja') targetLocale = 'ja-JP';
            else if (defaultLang === 'tw') targetLocale = 'zh-TW';
            else targetLocale = 'zh-CN';
        } else if (/[a-zA-Z]/.test(cleaned)) {
            // 알파벳만 있는 경우: 기본 언어가 베트남어라면 베트남어로 추정
            if (defaultLang === 'vi') targetLocale = 'vi-VN';
            else targetLocale = 'en-US'; 
        }

        const voiceIndex = await getBestVoiceIndex(targetLocale);

        const options: any = {
            rate: 1.05,
            pitch: 1.15, // 기분 좋고 밝은 아나운서/강사 톤
            volume: 1.0,
            category: 'playback',
            text: cleaned,
            lang: targetLocale,
        };
        if (voiceIndex !== undefined) options.voice = voiceIndex;

        await TextToSpeech.speak(options);
    } catch (e) {
        console.error("Natural TTS Error:", e);
    }
};

export const stopTTS = async () => {
    try {
        await TextToSpeech.stop();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    } catch (e) { }
};
