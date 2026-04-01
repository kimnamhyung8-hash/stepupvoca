/**
 * VocaQuest - User Service (Firestore 기반)
 * - 닉네임 고유성 보장
 * - 유저 프로필 저장/조회
 * - 닉네임으로 상대 검색 (배틀용)
 */

import {
    doc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    collection,
    serverTimestamp,
    orderBy,
    limit,
    onSnapshot,
    runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

export interface VQUser {
    uid: string;
    nickname: string;
    skin: string;
    level: number;
    points: number;
    winCount: number;
    loseCount: number;
    lang: string;
    email?: string | null;
    region?: string;
    createdAt?: any;
    lastSeenAt?: any;
    lastActive?: any;
    isOnline?: boolean;
    isPremium?: boolean;
    isAdmin?: boolean;
    age?: string;
    purpose?: string;
    engLevel?: string;        // Assessment level (A1, B2...)
    notes?: string;           // JSON string of incorrectNotes
    unlockedLevels?: number[];
    purchasedSkins?: string[];
    myPhrases?: string;       // JSON string of saved phrases
    streak?: number;
    maxStreak?: number;
    blockedUids?: string[];   // List of UIDs this user has blocked
    isInChatLobby?: boolean;  // Whether user is currently in the Live Chat module
}

// ── 닉네임 중복 체크 ─────────────────────────────────
export async function isNicknameTaken(nickname: string, excludeUid?: string): Promise<boolean> {
    try {
        const lowerNick = nickname.trim().toLowerCase();

        // 1. nickname_lower로 먼저 체크 (대소문자 구분 없음)
        const q1 = query(
            collection(db, 'users'),
            where('nickname_lower', '==', lowerNick)
        );
        const snap1 = await getDocs(q1);

        if (!snap1.empty) {
            if (excludeUid) {
                // 현재 내가 소유한 닉네임이라면 중복이 아님
                return snap1.docs.some(d => d.id !== excludeUid);
            }
            return true;
        }

        // 2. 하위 호환성을 위해 기존 nickname 필드로도 체크 (nickname_lower가 없는 예전 계정들)
        const q2 = query(
            collection(db, 'users'),
            where('nickname', '==', nickname.trim())
        );
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
            if (excludeUid) {
                return snap2.docs.some(d => d.id !== excludeUid);
            }
            return true;
        }

        return false;
    } catch (e) {
        console.warn('[userService] isNicknameTaken error:', e);
        return false; // 오프라인인 경우 통과 처리
    }
}

// ── 유저 등록/업데이트 ────────────────────────────────
export async function upsertUser(uid: string, data: Partial<VQUser>): Promise<void> {
    try {
        const ref = doc(db, 'users', uid);
        const nickname = data.nickname || `VocaUser${Math.floor(Math.random() * 9999)}`;
        const nickname_lower = nickname.toLowerCase();

        // 1. 우선 update를 시도해봅니다. (Read를 줄이기 위함)
        try {
            const updatePayload: any = {
                ...data,
                lastSeenAt: serverTimestamp(),
                isOnline: true,
            };
            if (data.email) {
                updatePayload.email = data.email;
            }
            if (data.nickname) {
                updatePayload.nickname = data.nickname;
                updatePayload.nickname_lower = data.nickname.toLowerCase();
            }
            await updateDoc(ref, updatePayload);
        } catch (updateErr: any) {
            // 2. 문서가 없는 경우(NotFound)에만 setDoc으로 새로 생성합니다.
            if (updateErr.code === 'not-found') {
                await setDoc(ref, {
                    uid,
                    nickname,
                    nickname_lower,
                    skin: data.skin || 'default',
                    level: data.level || 1,
                    points: data.points || 0,
                    email: data.email || null,
                    winCount: 0,
                    loseCount: 0,
                    lang: data.lang || 'ko',
                    region: data.region || '',
                    notes: data.notes || '[]',
                    unlockedLevels: data.unlockedLevels || [1],
                    purchasedSkins: data.purchasedSkins || ['default'],
                    myPhrases: data.myPhrases || '[]',
                    streak: data.streak || 0,
                    maxStreak: data.maxStreak || 0,
                    age: data.age || '',
                    purpose: data.purpose || '',
                    engLevel: data.engLevel || '',
                    createdAt: serverTimestamp(),
                    lastSeenAt: serverTimestamp(),
                    isOnline: true,
                });
            } else {
                throw updateErr;
            }
        }
    } catch (e) {
        console.warn('[userService] upsertUser error:', e);
    }
}

// ── UID로 유저 조회 ──────────────────────────────────
export async function getUserByUid(uid: string): Promise<VQUser | null> {
    try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as VQUser) : null;
    } catch (e) {
        console.warn('[userService] getUserByUid error:', e);
        return null;
    }
}

/**
 * [NEW] 다른 기기 사용 여부 체크
 * - isOnline이 true이고 lastActive가 3분 이내면 사용 중으로 간주
 */
export async function checkUserAvailability(uid: string): Promise<{ available: boolean; message?: string }> {
    const user = await getUserByUid(uid);
    if (!user) return { available: true };

    if (user.isOnline) {
        const lastActive = user.lastActive?.seconds ? user.lastActive.seconds * 1000 : 0;
        const now = Date.now();
        const diffMinutes = (now - lastActive) / (1000 * 60);

        if (diffMinutes < 3) {
            return { 
                available: false, 
                message: "다른 기기에서 사용 중입니다. 먼저 사용 중인 기기에서 로그아웃을 하세요." 
            };
        }
    }
    return { available: true };
}

/**
 * [NEW] 사용자의 온라인/활성 상태 주기적 업데이트 (Heartbeat)
 */
export async function updateHeartbeat(uid: string): Promise<void> {
    try {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, {
            isOnline: true,
            lastActive: serverTimestamp()
        });
    } catch (e) {
        // Ignore heartbeat errors on network issues
    }
}

// ── 유저 정보 실시간 감시 (기기 간 동기화용) ─────────
export function listenToUserByUid(uid: string, callback: (user: VQUser | null, hasPendingWrites: boolean) => void) {
    const ref = doc(db, 'users', uid);
    return onSnapshot(ref, (snap) => {
        if (!snap.exists()) callback(null, false);
        else callback(snap.data() as VQUser, snap.metadata.hasPendingWrites);
    }, (err) => {
        console.warn('[userService] listenToUserByUid error:', err);
    });
}

// ── 닉네임으로 유저 검색 (배틀 상대 검색) ──────────────
export async function searchUserByNickname(nickname: string): Promise<VQUser[]> {
    try {
        const searchStr = nickname.trim().toLowerCase();
        if (!searchStr) return [];

        // 대소문자 구분 없는 '시작단어' 검색 (Prefix Search)
        // nickname_lower가 searchStr로 시작하는 유저들을 조회
        const q = query(
            collection(db, 'users'),
            where('nickname_lower', '>=', searchStr),
            where('nickname_lower', '<=', searchStr + '\uf8ff'),
            limit(20)
        );
        const snap = await getDocs(q);
        if (snap.empty) return [];
        return snap.docs.map(d => d.data() as VQUser);
    } catch (e) {
        console.warn('[userService] searchUserByNickname error:', e);
        return [];
    }
}

// ── 온라인 유저 목록 조회 (배틀 대기방) ─────────────────
export async function getOnlineUsers(limit = 10): Promise<VQUser[]> {
    try {
        const q = query(
            collection(db, 'users'),
            where('isOnline', '==', true)
        );
        const snap = await getDocs(q);
        return snap.docs
            .map(d => d.data() as VQUser)
            .slice(0, limit);
    } catch (e) {
        console.warn('[userService] getOnlineUsers error:', e);
        return [];
    }
}

// ── 오프라인 처리 ────────────────────────────────────
export async function setUserOffline(uid: string): Promise<void> {
    try {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, { isOnline: false, lastSeenAt: serverTimestamp() });
    } catch (e) {
        console.warn('[userService] setUserOffline error:', e);
    }
}

// ── 라이브챗 로비 상태 관리 (사용자 요청 반영) ───────────
export async function setChatLobbyPresence(uid: string, isInLobby: boolean): Promise<void> {
    try {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, { 
            isInChatLobby: isInLobby,
            lastSeenAt: serverTimestamp() 
        });
    } catch (e) {
        console.warn('[userService] setChatLobbyPresence error:', e);
    }
}

// ── 사용자 차단 기능 (UGC 정책 준수) ────────────────────
export async function blockUser(myUid: string, targetUid: string): Promise<void> {
    try {
        const ref = doc(db, 'users', myUid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data() as VQUser;
        const currentBlocks = data.blockedUids || [];
        if (!currentBlocks.includes(targetUid)) {
            await updateDoc(ref, {
                blockedUids: [...currentBlocks, targetUid]
            });
        }
    } catch (e) {
        console.warn('[userService] blockUser error:', e);
    }
}

// ── 라이브챗 로비 유저 목록 조회 (필터링 적용) ──────────
export async function getChatLobbyUsers(limitCount = 20): Promise<VQUser[]> {
    try {
        const q = query(
            collection(db, 'users'),
            where('isInChatLobby', '==', true),
            orderBy('lastSeenAt', 'desc'),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as VQUser);
    } catch (e) {
        console.warn('[userService] getChatLobbyUsers error:', e);
        return [];
    }
}

// ── 배틀 결과 기록 ───────────────────────────────────
export async function recordBattleResult(uid: string, isWin: boolean): Promise<void> {
    try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data() as VQUser;
        await updateDoc(ref, {
            winCount: (data.winCount || 0) + (isWin ? 1 : 0),
            loseCount: (data.loseCount || 0) + (isWin ? 0 : 1),
            lastSeenAt: serverTimestamp(),
        });
    } catch (e) {
        console.warn('[userService] recordBattleResult error:', e);
    }
}

// ── 실시간 배틀 (PvP) ────────────────────────────────
export interface BattleMessage {
    senderId: string;
    senderNickname: string;
    text: string;
    timestamp: number;
}

export interface BattleRoom {
    id: string;
    challengerId: string;
    challengerName: string;
    challengerSkin?: string;  // [NEW] 방장 스킨
    challengerLevel?: number; // [NEW] 방장 레벨
    challengerRegion?: string;// [NEW] 방장 지역
    receiverId: string;
    receiverName?: string;    // [NEW] 참여자 닉네임
    receiverSkin?: string;    // [NEW] 참여자 스킨
    receiverLevel?: number;   // [NEW] 참여자 레벨
    receiverRegion?: string;  // [NEW] 참여자 지역
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ONGOING' | 'FINISHED' | 'CANCELLED' | 'WAITING' | 'RECHALLENGING';
    challengerHP: number;
    receiverHP: number;
    battleLevel: number;
    wordIndices: number[];
    battleWords?: any[];      // 같은 단어 공유를 위해 단어 배열 저장
    currentWordIdx?: number;  // 동기화된 문항 진행 상태
    message?: string;
    title?: string;           // [NEW] 방 제목
    challengerEmoji?: string; // 실시간 이모지 감시용 데이터
    receiverEmoji?: string;
    winnerId?: string;
    ownerId?: string;         // [NEW] 현재 방의 권한 소유자 (승리 시 변경됨)
    messages?: BattleMessage[]; // [NEW] 대기실 채팅 내용
    createdAt: any;
}

/**
 * 전장 라운드 증가 (동기화) -> 트랜잭션 적용
 */
export async function advanceBattleRound(battleId: string, nextIdx: number) {
    try {
        const ref = doc(db, 'battles', battleId);
        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) return;
            const currentIdx = snap.data().currentWordIdx || 0;
            // 로컬에서 받은 nextIdx가 현재 DB의 idx보다 클 때만 갱신 (뒤로 가는 현상 방지)
            if (nextIdx > currentIdx) {
                transaction.update(ref, { currentWordIdx: nextIdx });
            }
        });
    } catch (e) {
        console.error("advanceBattleRound error", e);
    }
}

/**
 * 실시간 이모지 전송
 */
export async function sendBattleEmoji(battleId: string, isChallenger: boolean, emoji: string) {
    const ref = doc(db, 'battles', battleId);
    await updateDoc(ref, {
        [isChallenger ? 'challengerEmoji' : 'receiverEmoji']: `${emoji}_${Date.now()}` // 중복 전송 감지를 위해 타임스탬프 결합
    });
}

/**
 * 대기실 채팅 메시지 전송
 */
export async function sendBattleChatMessage(battleId: string, senderId: string, nickname: string, text: string) {
    const ref = doc(db, 'battles', battleId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        const data = snap.data() as BattleRoom;
        const messages = data.messages || [];
        const newMessage: BattleMessage = {
            senderId,
            senderNickname: nickname,
            text,
            timestamp: Date.now()
        };
        // 최근 50개 메시지만 유지
        const updatedMessages = [...messages, newMessage].slice(-50);
        await updateDoc(ref, { messages: updatedMessages });
    }
}

/**
 * 배틀 공식 시작 (방장이 대기실에서 시작 버튼 클릭 시)
 */
export async function startBattleOfficial(battleId: string) {
    const ref = doc(db, 'battles', battleId);
    await updateDoc(ref, { status: 'ONGOING' });
}

/**
 * 도전장 보내기
 */
export async function createBattleRoom(
    challenger: VQUser,
    receiverUid: string,
    battleLevel: number,
    message?: string,
    battleWords?: any[], // 추가
    wordCount = 15
): Promise<string> {
    const battleId = `${challenger.uid}_${receiverUid}_${Date.now()}`;
    const wordIndices = Array.from({ length: wordCount }, () => Math.floor(Math.random() * 50));

    const battleData: BattleRoom = {
        id: battleId,
        challengerId: challenger.uid,
        challengerName: challenger.nickname,
        receiverId: receiverUid,
        status: 'PENDING',
        challengerHP: 100,
        receiverHP: 100,
        battleLevel,
        wordIndices,
        battleWords,
        currentWordIdx: 0,
        message, // 저장
        createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'battles', battleId), battleData);
    return battleId;
}

/**
 * 내게 온 도전장 감시 (onSnapshot용 쿼리 반환)
 */
export function listenToMyChallenges(myUid: string, callback: (battle: BattleRoom | null) => void) {
    const q = query(
        collection(db, 'battles'),
        where('receiverId', '==', myUid),
        where('status', '==', 'PENDING')
    );
    return onSnapshot(q, (snap) => {
        if (snap.empty) callback(null);
        else callback({ ...snap.docs[0].data(), id: snap.docs[0].id } as BattleRoom);
    }, (err) => {
        console.warn('[userService] listenToMyChallenges error:', err);
        callback(null);
    });
}

/**
 * 전투 수락/거절
 */
export async function respondToChallenge(battleId: string, accept: boolean) {
    const ref = doc(db, 'battles', battleId);
    await updateDoc(ref, {
        status: accept ? 'ACCEPTED' : 'DECLINED'
    });
}

/**
 * 방 퇴장 처리 (방장/도전자 구분)
 */
export async function leaveBattleRoom(battleId: string, userId: string) {
    try {
        const ref = doc(db, 'battles', battleId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data() as BattleRoom;
        
        // 1. 방장(Challenger)이 나가는 경우 -> 방 전체 취소
        if (data.challengerId === userId) {
            await updateDoc(ref, { status: 'CANCELLED' });
        } 
        // 2. 참여자(Receiver)가 나가는 경우 -> 방을 다시 WAITING으로
        else if (data.receiverId === userId) {
            await updateDoc(ref, {
                status: 'WAITING',
                receiverId: '',
                receiverName: '',
                receiverSkin: '',
                receiverLevel: 0,
                receiverRegion: '',
                battleWords: [] // 새로운 참가자가 자신의 레벨에 맞게 생성하도록 초기화
            });
        }
    } catch (e) {
        console.error("leaveBattleRoom error", e);
    }
}

/**
 * 도전 취소 (레거시 호환용)
 */
export async function cancelChallenge(battleId: string) {
    try {
        const ref = doc(db, 'battles', battleId);
        await updateDoc(ref, { status: 'CANCELLED' });
    } catch (e) {
        console.error("cancelChallenge error", e);
    }
}

/**
 * 내 HP 동기화 (틀렸을 때나 혼자 데미지 입을 때) -> 트랜잭션 적용
 */
export async function updateBattleHP(battleId: string, isChallenger: boolean, newHP: number) {
    try {
        const ref = doc(db, 'battles', battleId);
        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) return;
            const targetField = isChallenger ? 'challengerHP' : 'receiverHP';
            
            // 더 낮게 갱신될 때만 허용 (HP 복구 어뷰징 방지)
            const currentHP = snap.data()[targetField] || 100;
            if (newHP < currentHP) {
                transaction.update(ref, { [targetField]: Math.max(0, newHP) });
            }
        });
    } catch (e) {
        console.error("updateBattleHP error", e);
    }
}

/**
 * 상대방 공격 (정답 시 상대 체력 깎기) -> 트랜잭션 적용
 */
export async function attackRival(battleId: string, isChallenger: boolean, damage: number) {
    try {
        const ref = doc(db, 'battles', battleId);
        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists()) return;
            
            const targetField = isChallenger ? 'receiverHP' : 'challengerHP';
            const currentRivalHP = snap.data()[targetField] || 100;
            
            if (currentRivalHP > 0) {
                transaction.update(ref, {
                    [targetField]: Math.max(0, currentRivalHP - damage)
                });
            }
        });
    } catch (e) {
        console.error("attackRival error", e);
    }
}

/**
 * 특정 배틀 방의 상태 변화 감시
 */
export function listenToBattleStatus(battleId: string, callback: (battle: BattleRoom | null) => void) {
    const ref = doc(db, 'battles', battleId);
    return onSnapshot(ref, (snap) => {
        if (!snap.exists()) callback(null);
        else callback({ ...snap.data(), id: snap.id } as BattleRoom);
    }, (err) => {
        console.warn('[userService] listenToBattleStatus error:', err);
        callback(null);
    });
}
/**
 * 배틀 종료 처리 (상태 변경 및 승자 기록)
 */
export async function finalizeBattle(battleId: string, winnerId: string) {
    const ref = doc(db, 'battles', battleId);
    await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        
        // If already finalized or rematching, ignore to prevent race-condition overrides
        if (data.status === 'FINISHED' || data.status === 'RECHALLENGING' || data.status === 'ACCEPTED') {
            return;
        }

        transaction.update(ref, {
            status: 'FINISHED',
            winnerId,
            ownerId: winnerId // 승자에게 방장 권한 부여
        });
    });
}

/**
 * [NEW] 공개 대기방 만들기
 */
export async function createOpenBattleRoom(
    owner: VQUser,
    battleLevel: number,
    title?: string,
    message?: string
): Promise<string> {
    const battleId = `open_${owner.uid}_${Date.now()}`;
    const battleData: any = {
        id: battleId,
        challengerId: owner.uid,
        challengerName: owner.nickname,
        challengerSkin: owner.skin || 'default',
        challengerLevel: owner.level || 1,
        challengerRegion: owner.region || '🌍',
        receiverId: '', // 아직 도전자 없음
        status: 'WAITING',
        challengerHP: 100,
        receiverHP: 100,
        battleLevel,
        currentWordIdx: 0,
        title,
        message,
        ownerId: owner.uid,
        createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'battles', battleId), battleData);
    return battleId;
}

/**
 * [NEW] 공개 대기방 목록 조회
 */
export async function getOpenBattleRooms(limitCount = 10): Promise<BattleRoom[]> {
    try {
        const q = query(
            collection(db, 'battles'),
            where('status', 'in', ['WAITING', 'ACCEPTED', 'ONGOING']),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs
            .map(d => ({ ...d.data(), id: d.id } as BattleRoom))
            .filter(room => room.id.startsWith('open_'));
    } catch (e) {
        console.warn('getOpenBattleRooms error:', e);
        return [];
    }
}

/**
 * [NEW] 공개 대기방 목록 실시간 리스너
 */
export function listenToOpenBattleRooms(callback: (rooms: BattleRoom[]) => void, limitCount = 20) {
    const q = query(
        collection(db, 'battles'),
        where('status', 'in', ['WAITING', 'ACCEPTED', 'ONGOING']),
        limit(limitCount)
    );
    return onSnapshot(q, (snap) => {
        const now = Date.now();
        const TTL_MS = 30 * 60 * 1000; // 30분 만료
        const rooms = snap.docs
            .map(d => ({ ...d.data(), id: d.id } as BattleRoom))
            .filter(room => {
                if (!room.id.startsWith('open_')) return false;
                // createdAt이 Firestore Timestamp인 경우 .seconds로 접근
                const createdMs = room.createdAt?.seconds
                    ? room.createdAt.seconds * 1000
                    : (room.createdAt instanceof Date ? room.createdAt.getTime() : 0);
                // 30분 이상 된 방은 필터링
                if (createdMs > 0 && (now - createdMs) > TTL_MS) return false;
                return true;
            });
        callback(rooms);
    }, (err) => {
        console.warn('listenToOpenBattleRooms error:', err);
        callback([]);
    });
}

/**
 * [NEW] 대기방 입장하기
 */
export async function joinBattleRoom(roomId: string, user: VQUser, battleWords: any[]) {
    const ref = doc(db, 'battles', roomId);
    await updateDoc(ref, {
        receiverId: user.uid,
        receiverName: user.nickname,
        receiverSkin: user.skin || 'default',
        receiverLevel: user.level || 1,
        receiverRegion: user.region || '🌍',
        status: 'ACCEPTED',
        battleWords, // 참여자가 단어 풀을 확정하여 업데이트
        challengerHP: 100,
        receiverHP: 100,
        currentWordIdx: 0
    });
}

/**
 * [NEW] 재도전 요청/응답
 */
export async function requestRechallenge(battleId: string) {
    const ref = doc(db, 'battles', battleId);
    await updateDoc(ref, { status: 'RECHALLENGING' });
}

export async function respondRechallenge(battleId: string, accept: boolean, battleWords?: any[]) {
    const ref = doc(db, 'battles', battleId);
    if (accept) {
        await updateDoc(ref, {
            status: 'ACCEPTED',
            challengerHP: 100,
            receiverHP: 100,
            currentWordIdx: 0,
            battleWords: battleWords || []
        });
    } else {
        // 거절 시 패배자 강퇴 및 방을 다시 대기 상태로
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data() as BattleRoom;
            const isWinnerChallenger = data.winnerId === data.challengerId;
            
            await updateDoc(ref, {
                status: 'WAITING',
                [isWinnerChallenger ? 'receiverId' : 'challengerId']: '',
                winnerId: '',
                challengerHP: 100,
                receiverHP: 100,
                currentWordIdx: 0
            });
        }
    }
}

/**
 * 내 배틀 전적 가져오기 (최근 20건)
 */
export async function getBattleHistory(uid: string): Promise<BattleRoom[]> {
    try {
        const qC = query(
            collection(db, 'battles'),
            where('challengerId', '==', uid),
            where('status', '==', 'FINISHED'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
        const qR = query(
            collection(db, 'battles'),
            where('receiverId', '==', uid),
            where('status', '==', 'FINISHED'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const [snapC, snapR] = await Promise.all([getDocs(qC), getDocs(qR)]);
        const combined = [
            ...snapC.docs.map(d => ({ ...d.data(), id: d.id } as BattleRoom)),
            ...snapR.docs.map(d => ({ ...d.data(), id: d.id } as BattleRoom))
        ];

        // 시간순 정렬
        return combined.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    } catch (e) {
        console.warn('[userService] getBattleHistory error:', e);
        return [];
    }
}

// ── [NEW] 진짜 빠른 매칭 큐(Queue) 로직 ──────────────────

/**
 * 큐에 등록
 */
export async function joinQuickMatchQueue(user: VQUser, battleLevel: number): Promise<void> {
    try {
        const ref = doc(db, 'quick_matches', user.uid);
        await setDoc(ref, {
            ...user,
            battleLevel,
            status: 'WAITING', // WAITING | MATCHED
            matchedBattleId: null,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.warn('joinQuickMatchQueue error', e);
    }
}

/**
 * 큐에서 대기 중인 상대를 찾아 매칭 성사 (트랜잭션)
 * 성사되면 새로운 battleId를 반환
 */
export async function findAndClaimQuickMatch(myUser: VQUser, targetLevel: number, battleWords: any[]): Promise<string | null> {
    try {
        const q = query(
            collection(db, 'quick_matches'),
            where('status', '==', 'WAITING'),
            where('battleLevel', '>=', targetLevel - 30),
            where('battleLevel', '<=', targetLevel + 30),
            orderBy('createdAt', 'asc'),
            limit(5) // 대기자 5명 정도 중 탐색
        );
        const snap = await getDocs(q);
        
        // 내 UID는 제외
        const candidates = snap.docs.filter(d => d.id !== myUser.uid);
        if (candidates.length === 0) return null;

        // 트랜잭션을 통해 선점 시도
        for (const candidateDoc of candidates) {
            const resultBattleId = await runTransaction(db, async (transaction) => {
                const docRef = doc(db, 'quick_matches', candidateDoc.id);
                const currentData = await transaction.get(docRef);
                
                // 이미 누군가 가로챘거나 취소했으면 패스
                if (!currentData.exists() || currentData.data().status !== 'WAITING') {
                    return null;
                }
                
                // 내가 선점! (Match 생성)
                const rivalData = currentData.data() as VQUser;
                const newBattleId = `quick_${rivalData.uid}_${myUser.uid}_${Date.now()}`;
                const wordIndices = Array.from({ length: 15 }, () => Math.floor(Math.random() * 50));
                
                const battleRef = doc(db, 'battles', newBattleId);
                transaction.set(battleRef, {
                    id: newBattleId,
                    challengerId: rivalData.uid, // 큐에서 기다리던 사람이 방장
                    challengerName: rivalData.nickname,
                    challengerSkin: rivalData.skin || 'default',
                    challengerLevel: rivalData.level || 1,
                    receiverId: myUser.uid,      // 선점한 내가 참여자
                    receiverName: myUser.nickname,
                    receiverSkin: myUser.skin || 'default',
                    receiverLevel: myUser.level || 1,
                    status: 'ONGOING',           // 빠른 매칭이므로 READY_ROOM 없이 바로 시작
                    challengerHP: 100,
                    receiverHP: 100,
                    battleLevel: rivalData.level, // 방장 기준 난이도로 보정
                    wordIndices,
                    battleWords, // 방에 진입한 유저가 전달한 풀 사용
                    currentWordIdx: 0,
                    createdAt: serverTimestamp()
                });

                // 큐 문서 상태를 업데이트하여 내가 매칭했음을 알림
                transaction.update(docRef, {
                    status: 'MATCHED',
                    matchedBattleId: newBattleId
                });
                
                return newBattleId;
            });

            if (resultBattleId) {
                return resultBattleId;
            }
        }
        return null;
    } catch (e) {
        console.warn('findAndClaimQuickMatch error', e);
        return null;
    }
}

/**
 * 내가 큐에서 기다리는 동안, 방이 잡혔는지 리스닝
 */
export function listenToQuickMatchResult(uid: string, callback: (battleId: string | null) => void) {
    const ref = doc(db, 'quick_matches', uid);
    return onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data.status === 'MATCHED' && data.matchedBattleId) {
            callback(data.matchedBattleId);
        }
    });
}

/**
 * 큐 취소 (매칭 실패 시)
 */
export async function cancelQuickMatchQueue(uid: string) {
    try {
        const ref = doc(db, 'quick_matches', uid);
        await updateDoc(ref, { status: 'CANCELLED' });
    } catch (e) {
        console.warn('cancelQuickMatchQueue error', e);
    }
}
