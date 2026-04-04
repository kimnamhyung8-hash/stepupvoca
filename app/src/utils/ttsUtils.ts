import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

/**
 * TTS 발화 전 텍스트 정제
 */
export const cleanTextForTTS = (text: string): string => {
    return text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF])/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/["'「」『』]/g, '')
        .replace(/[*_#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const FEMALE_VOICE_CONFIG = {
    rate: 0.95,
    pitch: 1.2,
    volume: 1.0,
    category: 'playback' as const,
};

const LANG_MAP: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    zh: 'zh-CN',
    tw: 'zh-TW',
    vi: 'vi-VN'
};

const speakWithWebTTS = (text: string, langCode: string): Promise<void> => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) return resolve();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = FEMALE_VOICE_CONFIG.rate;
        utterance.pitch = FEMALE_VOICE_CONFIG.pitch;
        utterance.volume = FEMALE_VOICE_CONFIG.volume;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const shortCode = langCode.split('-')[0];
            // 1. Google Network Voice (Highest quality)
            let voice = voices.find(v => v.lang.includes(shortCode) && v.name.includes('Google'));
            // 2. Any Voice matching language (e.g. native OS Vietnamese voice)
            if (!voice) voice = voices.find(v => v.lang.includes(shortCode));
            
            if (voice) {
                utterance.voice = voice;
            }
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
    });
};

const speakText = async (text: string, langCode: string) => {
    if (Capacitor.getPlatform() === 'web' && window.speechSynthesis) {
        await speakWithWebTTS(text, langCode);
    } else {
        await TextToSpeech.speak({
            ...FEMALE_VOICE_CONFIG,
            text,
            lang: langCode,
        });
    }
};

export const playNaturalTTS = async (text: string, defaultLang: string = 'ko') => {
    try {
        await TextToSpeech.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        const cleaned = cleanTextForTTS(text);
        if (!cleaned) return;

        const targetLangCode = LANG_MAP[defaultLang] || (defaultLang === 'ko' ? 'ko-KR' : 'en-US');

        if (defaultLang === 'vi' || defaultLang === 'en') {
            await speakText(cleaned, targetLangCode);
            return;
        }

        const segments = cleaned.split(/([a-zA-Z\s,.'!?-]{4,})/g).filter(s => s.trim().length > 0);

        for (const segment of segments) {
            const isEnglish = /^[a-zA-Z\s,.'!?-]+$/.test(segment);
            const lang = isEnglish ? 'en-US' : targetLangCode;
            await speakText(segment.trim(), lang);
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
