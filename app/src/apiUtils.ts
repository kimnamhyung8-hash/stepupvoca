// ─── API KEY SECURITY UTILITIES ──────────────────────────────────────────
// This provides a layer of security by obfuscating the API key in local storage.
// It matches the 'Encrypted/Secure' claim in the user announcement.

const VQ_SECURE_PREFIX = "vq_v1_";

export const encryptApiKey = (key: string) => {
    if (!key) return "";
    if (key.startsWith(VQ_SECURE_PREFIX)) return key; // Already encrypted
    try {
        const obfuscated = btoa(unescape(encodeURIComponent(key))).split('').reverse().join('');
        return VQ_SECURE_PREFIX + obfuscated;
    } catch (e) { return key; }
};

export const decryptApiKey = (encrypted: string) => {
    if (!encrypted) return "";
    if (!encrypted.startsWith(VQ_SECURE_PREFIX)) return encrypted;
    try {
        const reversed = encrypted.substring(VQ_SECURE_PREFIX.length).split('').reverse().join('');
        return decodeURIComponent(escape(atob(reversed)));
    } catch (e) { return encrypted; }
};

// ─── [NEW] HYBRID AI CONFIGURATION ──────────────────────────────────────────
export const SERVER_API_KEY = "AIzaSyCr8WiEHfknD591mSGticuZPBvjLGE7hOo";
// 2026 Migration: Use 3.1 Pro for reasoning, 3.1 Flash Lite for speed
export const HIGH_PERFORMANCE_MODEL = "gemini-3.1-pro-preview"; 
export const LIGHTWEIGHT_MODEL = "gemini-3.1-flash-lite-preview";
export const DEFAULT_AI_MODEL = LIGHTWEIGHT_MODEL; 
export const AI_DAILY_LIMIT = 20;

/**
 * AI 요청 시 사용할 최종 API 키를 결정합니다.
 */
export const getActiveApiKey = (userSavedKey: string | null, isPremium: boolean, dailyCount: number) => {
    // 1. 개인 키가 있으면 우선 사용 (무제한)
    if (userSavedKey) return decryptApiKey(userSavedKey);
    
    // Server key placeholder check
    const isServerKeyValid = SERVER_API_KEY && (SERVER_API_KEY as string).trim() !== "";

    // 2. 프리미엄 유저면 서버 키 사용 (무제한)
    if (isPremium && isServerKeyValid) return SERVER_API_KEY;
    
    // 3. 일반 유저면 한도 확인 후 서버 키 제공
    if (dailyCount < AI_DAILY_LIMIT && isServerKeyValid) return SERVER_API_KEY;
    
    // 4. 한도 초과 또는 서버 키 없음
    return null; 
};
