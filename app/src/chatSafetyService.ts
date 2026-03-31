/**
 * chatSafetyService.ts
 * Legal safety layer for Live Chat:
 *  1. Profanity / banned-word filter (client-side, 5 languages)
 *  2. User reporting to Firebase
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ── 1. Profanity Filter ────────────────────────────────────────────────────
// Minimal seed list — add more as needed. Stored as regex-safe fragments.
const BANNED_FRAGMENTS: string[] = [
    // Sexual / adult
    'sex', 'porn', 'nude', 'naked', 'xxx', 'hentai',
    'sexual', 'erotic', 'fetish', 'penis', 'vagina',
    // Korean
    '섹스', '야동', '음란', '포르노', '성기', '자위', '강간', '원나잇',
    '소개팅섹', '만남섹',
    // Japanese
    'エロ', 'セックス', 'ポルノ', '裸',
    // Chinese
    '色情', '做爱', '裸体',
    // Violence / hate
    'kill yourself', 'kys', 'go die', 'terrorist',
    // Spam / scam triggers
    'onlyfans', 'onlyfan',
];

/** Build case-insensitive regex for fast matching */
const BANNED_REGEX = new RegExp(
    BANNED_FRAGMENTS.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'i'
);

/**
 * Returns true if the text is safe (no banned content).
 * Returns false if banned content is found.
 */
export function isSafeText(text: string): boolean {
    return !BANNED_REGEX.test(text);
}

/**
 * Returns a masked version of text (replaces banned fragments with ***)
 */
export function maskBannedText(text: string): string {
    return text.replace(BANNED_REGEX, '***');
}

// ── 2. User Report ────────────────────────────────────────────────────────

export type ReportReason =
    | 'inappropriate_language'
    | 'sexual_content'
    | 'harassment'
    | 'spam'
    | 'hate_speech'
    | 'other';

export interface ChatReport {
    reporterId: string;
    reporterName: string;
    reportedUserId: string;
    reportedUserName: string;
    roomId: string;
    reason: ReportReason;
    detail?: string;
    createdAt: any;
}

/**
 * Submits a user report to the `chat_reports` Firestore collection.
 */
export async function submitChatReport(report: Omit<ChatReport, 'createdAt'>): Promise<void> {
    await addDoc(collection(db, 'chat_reports'), {
        ...report,
        createdAt: serverTimestamp(),
    });
}
