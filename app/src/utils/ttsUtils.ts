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

/**
 * 젊고 친절한 여성 음성톤을 위한 설정값
 */
const FEMALE_VOICE_CONFIG = {
    rate: 0.95, // 약간 천천히 읽어줌
    pitch: 1.2, // 피치를 높여 더 젊고 밝은 톤 구현
    volume: 1.0,
    category: 'ambient' as const,
};

/**
 * 한국어와 영어가 섞인 문장을 분석하여 언어별로 원어민 음성을 번역하여 들려줌
 */
export const playNaturalTTS = async (text: string, defaultLang: string = 'ko') => {
    try {
        await TextToSpeech.stop();
        
        const cleaned = cleanTextForTTS(text);
        if (!cleaned) return;

        // 문장을 한글 구간과 영어 구간으로 분리 (단순화된 정규식)
        // 한글 구간 또는 영어 구간으로 나누어 배열 생성
        const segments = cleaned.split(/([a-zA-Z\s,.'!?-]{4,})/g).filter(s => s.trim().length > 0);

        for (const segment of segments) {
            const isEnglish = /^[a-zA-Z\s,.'!?-]+$/.test(segment);
            const lang = isEnglish ? 'en-US' : (defaultLang === 'ko' ? 'ko-KR' : 'en-US');

            await TextToSpeech.speak({
                ...FEMALE_VOICE_CONFIG,
                text: segment.trim(),
                lang,
            });
        }
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
