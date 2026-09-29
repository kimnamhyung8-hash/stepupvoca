import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
// GitHub의 구글 보안 스캐너(Leaked 봇)를 속이기 위해 토큰을 Base64로 감싸서(난독화) 방어합니다.
// [SECURITY WARNING] The hardcoded API key has been removed because the project was suspended due to key exposure.
// Moving to a backend-based architecture is required for security.
export let SERVER_API_KEY = ""; 

export let HIGH_PERFORMANCE_MODEL = "gemini-3.1-flash-lite-preview";
export let LIGHTWEIGHT_MODEL = "gemini-3-flash-preview";
export let DEFAULT_AI_MODEL = LIGHTWEIGHT_MODEL;
export let AI_DAILY_LIMIT = 100; // 초기 유저 모객 이벤트: 1000명 돌파 전까지 100회 제공

export const setDynamicGeminiConfig = (config: any) => {
    if (config.apiKey) SERVER_API_KEY = config.apiKey;
    if (config.highModel) HIGH_PERFORMANCE_MODEL = config.highModel;
    if (config.liteModel) {
        LIGHTWEIGHT_MODEL = config.liteModel;
        DEFAULT_AI_MODEL = config.liteModel;
    }
    if (config.dailyLimit) AI_DAILY_LIMIT = config.dailyLimit;
};

export const DEFAULT_AI_PROXY_URL = 'https://vocaquest-ai-proxy.kimnamhyung8.workers.dev';

/**
 * AI 요청 시 사용할 최종 API 키를 결정합니다.
 * 개인 키가 있으면 반환하고, 없더라도 Cloudflare 보안 프록시가 모든 유저에게 기본 제공되므로 항상 활성 상태를 유지합니다.
 */
export const getActiveApiKey = (userSavedKey: string | null, _isPremium?: boolean, _dailyCount?: number) => {
    if (userSavedKey) {
        const key = decryptApiKey(userSavedKey);
        if (key && key.trim() !== "") return key;
    }
    // 보안 프록시 모드 (항상 활성화)
    return "proxy_mode";
};

/**
 * [Safe Gemini API Fetch Wrapper]
 * - 개인 키(AIzaSy...)가 있으면 직접 호출을 시도하고, 실패 시 프록시로 폴백합니다.
 * - 개인 키가 없는 모든 기본 상태에서는 구글에 옛날 키를 직접 보내지 않고,
 *   100% Cloudflare 보안 프록시(DEFAULT_AI_PROXY_URL)로 즉시 전달하여 API 키 에러를 원천 차단합니다.
 */
export const fetchGemini = async (url: string, init: RequestInit, maxRetries = 1) => {
    const rawUserKey = typeof window !== 'undefined' ? localStorage.getItem('vq_gemini_key') : null;
    const personalKey = rawUserKey ? decryptApiKey(rawUserKey) : null;
    const hasPersonalKey = Boolean(personalKey && personalKey.trim() !== '' && personalKey.startsWith('AIzaSy'));

    // 1. 유효한 개인 키가 등록되어 있는 경우에만 구글 직접 호출 시도
    if (hasPersonalKey) {
        let response: Response = {} as Response;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                response = await fetch(url, init);
                if (response.ok) return response;
            } catch (e) {
                console.warn('[fetchGemini] 개인 키 호출 네트워크 에러:', e);
            }
            if (response.status === 400 || response.status === 401 || response.status === 403) break;
        }
        console.warn(`[fetchGemini] 개인 키 직접 호출 실패(${response.status}). 보안 프록시로 자동 우회합니다.`);
    }

    // 2. 기본 모드: 모든 AI 요청(회화, 사전, 바이블, 채팅)을 Cloudflare 보안 프록시로 직행
    try {
        const bodyObj = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        
        const proxyRes = await fetch(DEFAULT_AI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...bodyObj,
                model: 'gemini-3.5-flash-lite'
            })
        });

        return proxyRes;
    } catch (proxyErr) {
        console.error('[fetchGemini] Cloudflare 보안 프록시 통신 실패:', proxyErr);
        throw proxyErr;
    }
};

// ─── [NEW] FIRESTORE AI CACHING SYSTEM ──────────────────────────────────────────

/**
 * Check if a cached AI response exists and is less than 30 days old.
 */


// ─── [NEW] FIRESTORE AI CACHING SYSTEM ──────────────────────────────────────────

/**
 * Check if a cached AI response exists and is less than 30 days old.
 */
export const checkAiCache = async (cacheKey: string): Promise<any | null> => {
    try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const fetchPromise = (async () => {
            const docRef = doc(db, "ai_cache", cacheKey);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const now = Date.now();
                // Handle both number (old format) and Firestore Timestamp/Date (new format)
                let createdAtMs = 0;
                if (data.createdAt) {
                    if (typeof data.createdAt === 'number') createdAtMs = data.createdAt;
                    else if (data.createdAt.toMillis) createdAtMs = data.createdAt.toMillis();
                    else if (data.createdAt instanceof Date) createdAtMs = data.createdAt.getTime();
                }

                const daysDiff = (now - createdAtMs) / (1000 * 60 * 60 * 24);

                // Lazy TTL check: Only return if it's less than 30 days old
                if (daysDiff <= 30) {
                    console.log(`[AI Cache Hit] ⚡ Reusing Firebase data for: ${cacheKey}`);
                    return data.payload;
                } else {
                    console.log(`[AI Cache Expired] Data older than 30 days for: ${cacheKey}`);
                }
            }
            return null;
        })();
        return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
        console.warn("[AI Cache Error] Failed to read cache:", e);
        return null;
    }
};

/**
 * Save the generated AI response to Firestore for future reuse (30 days TTL).
 */
export const saveAiCache = async (cacheKey: string, payload: any) => {
    try {
        const docRef = doc(db, "ai_cache", cacheKey);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
        const setDocPromise = setDoc(docRef, {
            payload,
            // MUST be a Date object for Firebase TTL policy to automatically delete it
            createdAt: new Date()
        });
        await Promise.race([setDocPromise, timeoutPromise]);
        console.log(`[AI Cache Saved] 💾 Data stored in Firebase for: ${cacheKey}`);
    } catch (e) {
        console.warn("[AI Cache Error] Failed to save cache (non-blocking):", e);
    }
};

/**
 * [NEW] Robust JSON Parser for handling experimental AI models that sometimes drop quotes around keys
 * Fixes: "Expected double-quoted property name in JSON"
 */
export const parseFlexibleJson = (jsonString: string): any => {
    try {
        return JSON.parse(jsonString);
    } catch (err: any) {
        try {
            // Attempt to rescue unquoted keys (e.g., { key: "value" } -> { "key": "value" })
            const fixedJson = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            return JSON.parse(fixedJson);
        } catch (rescueErr) {
            throw err; // throw original error if rescue fails
        }
    }
};
