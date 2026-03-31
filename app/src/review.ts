/**
 * VocaQuest - Smart Review Prompt System
 * Implements Two-Step filtering + Google Play In-App Review API
 */

const REVIEW_STORAGE_KEY = 'vq_review_state';
const MIN_LAUNCH_COUNT = 5;      // Show prompt after at least 5 app launches
const COOLDOWN_DAYS = 60;        // Don't show again for 60 days after prompt

interface ReviewState {
    launchCount: number;
    lastPromptDate: string | null;
    neverAsk: boolean;
    promptShownCount: number;
}

function getState(): ReviewState {
    try {
        const saved = localStorage.getItem(REVIEW_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return { launchCount: 0, lastPromptDate: null, neverAsk: false, promptShownCount: 0 };
}

function saveState(state: ReviewState) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state));
}

export function incrementLaunchCount() {
    const s = getState();
    s.launchCount = (s.launchCount || 0) + 1;
    saveState(s);
}

/**
 * Decide whether it's appropriate to show the review prompt now.
 * Called at "happy moments" (level up, perfect score, streak milestone).
 */
export function shouldShowReview(): boolean {
    const s = getState();
    if (s.neverAsk) return false;
    if (s.launchCount < MIN_LAUNCH_COUNT) return false;
    if (s.promptShownCount >= 3) return false; // max 3 prompts lifetime

    if (s.lastPromptDate) {
        const last = new Date(s.lastPromptDate);
        const now = new Date();
        const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < COOLDOWN_DAYS) return false;
    }
    return true;
}

export function markPromptShown() {
    const s = getState();
    s.lastPromptDate = new Date().toISOString();
    s.promptShownCount = (s.promptShownCount || 0) + 1;
    saveState(s);
}

export function markNeverAsk() {
    const s = getState();
    s.neverAsk = true;
    saveState(s);
}

/**
 * Trigger native In-App Review (Google Play). Falls back gracefully on web.
 */
export async function requestNativeReview(): Promise<void> {
    try {
        const isNative = typeof (window as any).Capacitor !== 'undefined'
            && (window as any).Capacitor.getPlatform() !== 'web';
        if (!isNative) {
            // web fallback: open Play Store URL
            window.open('https://play.google.com/store/apps/details?id=com.stepup.vocaquest', '_blank');
            return;
        }
        const { InAppReview } = await import('@capacitor-community/in-app-review');
        await InAppReview.requestReview();
    } catch (e) {
        console.warn('[Review] In-App review error:', e);
        // Final fallback
        window.open('https://play.google.com/store/apps/details?id=com.stepup.vocaquest', '_blank');
    }
}
