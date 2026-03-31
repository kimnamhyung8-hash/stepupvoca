// streak.ts — 일일 스트릭 & 로컬 알림 관리
import { LocalNotifications } from '@capacitor/local-notifications';

const KEY_STREAK = 'vq_streak';
const KEY_LAST_DATE = 'vq_streak_last_date';
const KEY_MAX_STREAK = 'vq_streak_max';
const KEY_NOTIF_HOUR = 'vq_notif_hour';   // 0~23
const KEY_NOTIF_MIN = 'vq_notif_minute';  // 0~59
const KEY_NOTIF_ON = 'vq_notif_on';
const KEY_ACTIVITY_LOG = 'vq_activity_log'; // JSON array of { date: string, type: string, value: any }

/** YYYY-MM-DD 형식으로 오늘 날짜 반환 */
function today(): string {
    return new Date().toISOString().slice(0, 10);
}

/** 스트릭 상태 로드 */
export function loadStreak() {
    return {
        streak: parseInt(localStorage.getItem(KEY_STREAK) || '0'),
        lastDate: localStorage.getItem(KEY_LAST_DATE) || '',
        streakMax: parseInt(localStorage.getItem(KEY_MAX_STREAK) || '0'),
    };
}

/**
 * 퀴즈/학습 완료 시 호출 → 스트릭 갱신
 * @returns 갱신된 streak 값
 */
export function recordActivity() {
    const { streak, lastDate, streakMax } = loadStreak();
    const todayStr = today();

    if (lastDate === todayStr) {
        // 오늘 이미 했으면 변경 없음
        return { streak, streakMax, isNewStreakDay: false };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let newStreak: number;
    if (lastDate === yesterdayStr) {
        // 어제 했으면 연속 +1
        newStreak = streak + 1;
    } else if (lastDate === '') {
        // 최초
        newStreak = 1;
    } else {
        // 하루 이상 끊김 → 리셋
        newStreak = 1;
    }

    const newMax = Math.max(newStreak, streakMax);
    localStorage.setItem(KEY_STREAK, String(newStreak));
    localStorage.setItem(KEY_LAST_DATE, todayStr);
    localStorage.setItem(KEY_MAX_STREAK, String(newMax));

    // 스트릭 달성 시 오늘 남은 알림 취소 (이미 완료했으므로)
    cancelTodayNotification();

    return { streak: newStreak, streakMax: newMax, isNewStreakDay: true };
}

/** 오늘 이미 활동했는지 */
export function didActivityToday(): boolean {
    return localStorage.getItem(KEY_LAST_DATE) === today();
}

// ─────────────────────────────────────────
//  알림 설정
// ─────────────────────────────────────────

export function getNotifSettings() {
    return {
        on: localStorage.getItem(KEY_NOTIF_ON) !== 'false',  // 기본 ON
        hour: parseInt(localStorage.getItem(KEY_NOTIF_HOUR) || '20'),  // 기본 20시
        min: parseInt(localStorage.getItem(KEY_NOTIF_MIN) || '0'),
    };
}

export function saveNotifSettings(on: boolean, hour: number, min: number) {
    localStorage.setItem(KEY_NOTIF_ON, String(on));
    localStorage.setItem(KEY_NOTIF_HOUR, String(hour));
    localStorage.setItem(KEY_NOTIF_MIN, String(min));
}

/** 권한 요청 후 매일 알림 예약 */
export async function scheduleStreakNotification(hour = 20, min = 0) {
    try {
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== 'granted') return false;

        // 기존 알림 전부 취소
        await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }] });

        const { streak } = loadStreak();
        const body = streak > 0
            ? `🔥 ${streak}일 연속 학습 중! 오늘도 스트릭을 이어가세요!`
            : `📚 오늘 영어 단어 공부 하셨나요? VocaQuest가 기다려요!`;

        // 오늘 지정 시각으로 알림 (매일 반복)
        const scheduleAt = new Date();
        scheduleAt.setHours(hour, min, 0, 0);
        if (scheduleAt <= new Date()) {
            scheduleAt.setDate(scheduleAt.getDate() + 1); // 이미 지났으면 내일
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 1001,
                    title: '🔥 VocaQuest',
                    body,
                    schedule: { at: scheduleAt, repeats: true, every: 'day' },
                    sound: undefined,
                    smallIcon: 'ic_stat_icon_config_sample',
                    actionTypeId: '',
                    extra: null,
                },
            ],
        });
        return true;
    } catch (e) {
        console.warn('스트릭 알림 등록 실패:', e);
        return false;
    }
}

/** 오늘 남은 알림 취소 (활동 완료 후 호출) */
async function cancelTodayNotification() {
    try {
        await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
        // 내일 알림 다시 예약
        const { on, hour, min } = getNotifSettings();
        if (on) await scheduleStreakNotification(hour, min);
    } catch { /* noop */ }
}

/** 활동 로그 기록 */
export function logActivity(type: 'LOGIN' | 'QUIZ' | 'STUDY' | 'BATTLE' | 'MINIGAME' | 'ai_usage', value: any = 1) {
    try {
        const saved = localStorage.getItem(KEY_ACTIVITY_LOG);
        const log = saved ? JSON.parse(saved) : [];
        const entry = {
            date: new Date().toISOString().slice(0, 10),
            timestamp: Date.now(),
            type,
            value
        };
        log.push(entry);
        // 최근 1000개 정도만 유지 (용량 제한 대비)
        if (log.length > 1000) log.shift();
        localStorage.setItem(KEY_ACTIVITY_LOG, JSON.stringify(log));
    } catch (e) {
        console.error('Activity log error:', e);
    }
}

/** 활동 로그 로드 */
export function getActivityLog() {
    try {
        const saved = localStorage.getItem(KEY_ACTIVITY_LOG);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}
