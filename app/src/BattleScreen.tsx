import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { pauseMainBGM } from './bgm';
import { X, Trophy, Skull, Zap, Swords, Search, UserX, RefreshCw, Send, MessageSquare, LogOut } from 'lucide-react';
import { t, getVocaOptions } from './i18n';
import { showAdIfFree } from './admob';
import {
    searchUserByNickname,
    getOnlineUsers,
    recordBattleResult,
    createBattleRoom,
    listenToMyChallenges,
    respondToChallenge,
    updateBattleHP,
    listenToBattleStatus,
    sendBattleEmoji,
    getBattleHistory,
    finalizeBattle,
    attackRival,
    advanceBattleRound,
    createOpenBattleRoom,
    getOpenBattleRooms,
    listenToOpenBattleRooms,
    joinBattleRoom,
    requestRechallenge,
    respondRechallenge,
    sendBattleChatMessage,
    startBattleOfficial,
    cancelChallenge,
    leaveBattleRoom,
    joinQuickMatchQueue,
    findAndClaimQuickMatch,
    listenToQuickMatchResult,
    cancelQuickMatchQueue
} from './userService';
import type { VQUser, BattleRoom } from './userService';
import { markWordsAsSeen, pickUniqueWords } from './utils/wordUtils';

// Skin emoji map
const SKIN_EMOJI: Record<string, string> = {
    default: '🐣', ninja: '🥷', wizard: '🧙‍♂️', king: '👑',
    dragon: '🐲', alien: '👽', robot: '🤖',
};

import { CEFR_CONFIG } from './constants/appConstants';

const getCefrByLevel = (lvl: number) => {
    return CEFR_CONFIG.find(c => lvl >= c.range[0] && lvl <= c.range[1]) || CEFR_CONFIG[0];
};

export function BattleScreen(props: any) {
    const {
        setScreen,
        userLevel = 1,
        equippedSkin = 'default',
        userInfo = {},
        vocaDB = [],
        playSound,
        settings,
        isPremium = false,
    } = props;
    const lang = settings?.lang || 'ko';

    const [gameState, setGameState] = useState<'LOBBY' | 'MATCHING' | 'READY_ROOM' | 'BATTLE' | 'RESULT'>('LOBBY');
    const [rival, setRival] = useState<any>(null);
    const [battleWords, setBattleWords] = useState<any[]>([]);
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [playerHP, setPlayerHP] = useState(100);
    const [rivalHP, setRivalHP] = useState(100);
    const [playerCombo, setPlayerCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [battleResult, setBattleResult] = useState<'WIN' | 'LOSE' | 'DRAW'>('WIN');
    const [solvedCount, setSolvedCount] = useState(0);
    const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hit'>('idle');
    const [rivalAnim, setRivalAnim] = useState<'idle' | 'attack' | 'hit'>('idle');
    const [isActiveCountdown, setIsActiveCountdown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(3);

    // ── 로비 전용 state ──────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<VQUser[] | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<VQUser[]>([]);
    const [lobbyTab, setLobbyTab] = useState<'rooms' | 'online' | 'search' | 'history'>('rooms');
    const [battleHistory, setBattleHistory] = useState<BattleRoom[]>([]);
    const [waitingRooms, setWaitingRooms] = useState<BattleRoom[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [roomTitle, setRoomTitle] = useState(''); // [NEW] 방 제목 입력 상태
    const [showCreateModal, setShowCreateModal] = useState(false); // [NEW] 방 생성 모달 고유 상태

    // ── PvP 전용 state ──────────────────────────────────────
    const [activeBattle, setActiveBattle] = useState<any>(null); // 실시간 BattleRoom 정보
    const [incomingChallenge, setIncomingChallenge] = useState<any>(null); // 나에게 온 도전
    const [isChallenger, setIsChallenger] = useState(false); // 내가 공객측인가?
    const [selectedCefr, setSelectedCefr] = useState(() => getCefrByLevel(userLevel).id); // 선택된 CEFR 등급 (A1~C2)
    const [battleLevel] = useState(userLevel); // 실제 내부 단어 레벨 (1~334)
    const [challengeMsg, setChallengeMsg] = useState(''); // 도발 메시지 입력 상태

    // ── 이모지 도발 전용 state ──────────────────────────────
    const [chatMsg, setChatMsg] = useState(''); // 대기실 메시지 입력
    const [pEmoji, setPEmoji] = useState<string | null>(null);
    const [rEmoji, setREmoji] = useState<string | null>(null);

    // ── 로그인 유도 모달 / 거절 알림 모달 ───────────────────
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showDeclinedModal, setShowDeclinedModal] = useState(false);

    const timerRef = useRef<any>(null);
    const targetWordIdxRef = useRef<number>(-1);
    const battleListenerRef = useRef<any>(null);
    const waitingRoomsListenerRef = useRef<any>(null);
    const quickMatchListenerRef = useRef<any>(null);
    const quickMatchTimeoutRef = useRef<any>(null);
    const lastRoundTimeRef = useRef<number>(Date.now());
    const messagesEndRef = useRef<HTMLDivElement>(null); // [NEW] 채팅 자동 스크롤용 ref

    // 채팅 자동 스크롤 효과
    useEffect(() => {
        if (gameState === 'READY_ROOM' && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeBattle?.messages, gameState]);

    // ── [NEW] 무한 루프 서킷 브레이커 (Safety Guard) ──────────
    const breakerRef = useRef<{ [key: string]: { count: number, lastReset: number, isBroken: boolean } }>({});
    const checkBreaker = (label: string, limit = 50, window = 60000) => {
        const now = Date.now();
        if (!breakerRef.current[label]) {
            breakerRef.current[label] = { count: 0, lastReset: now, isBroken: false };
        }
        const b = breakerRef.current[label];
        if (b.isBroken) return false;

        if (now - b.lastReset > window) {
            b.count = 0;
            b.lastReset = now;
        }
        b.count++;
        if (b.count > limit) {
            b.isBroken = true;
            console.error(`[CircuitBreaker] ${label} triggered! Stopping listener to prevent excessive Firestore reads.`);
            alert(lang === 'ko' ? `시스템 보호를 위해 ${label} 연결이 일시 차단되었습니다. 재접속이 필요합니다.` : `Connection for ${label} blocked for system protection. Please refresh.`);
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (gameState !== 'RESULT') {
            pauseMainBGM();
        }
    }, [gameState]);

    // 항상 최신 상태를 참조하기 위한 Ref (클로저 문제 방지)
    const stateRef = useRef({ playerHP: 100, playerCombo: 0, currentWordIdx: 0 });
    useEffect(() => {
        stateRef.current = { playerHP, playerCombo, currentWordIdx };
    }, [playerHP, playerCombo, currentWordIdx]);

    const triggerNextRound = (nextIdx: number) => {
        if (nextIdx <= targetWordIdxRef.current) return;
        targetWordIdxRef.current = nextIdx;

        setIsActiveCountdown(true);
        setCountdownValue(2);

        let c = 2;
        const cInt = setInterval(() => {
            c -= 1; setCountdownValue(c);
            if (c <= 0) {
                clearInterval(cInt);
                setIsActiveCountdown(false);
                setCurrentWordIdx(nextIdx);
                setSolvedCount(nextIdx); // 15개가 넘어가면 종료 로직 동작
            }
        }, 800);
    };

    const generateBattlePool = (specificLvl?: number) => {
        try {
            if (!vocaDB || !Array.isArray(vocaDB) || vocaDB.length === 0) return [];
            let pool: any[] = [];

            // 특정 레벨이 주어지든(specificLvl), 선택된 등급(selectedCefr) 기반이근,
            // 항상 해당 레벨/등급이 속한 CEFR 전체 범위를 풀로 활용함.
            let targetLvl = specificLvl || 1;
            if (!specificLvl) {
                const config = CEFR_CONFIG.find(c => c.id === selectedCefr) || CEFR_CONFIG[0];
                targetLvl = config.range[0]; // 등급의 첫 번째 레벨을 기준으로 삼음
            }

            const currentConfig = CEFR_CONFIG.find(c => targetLvl >= c.range[0] && targetLvl <= c.range[1]) || CEFR_CONFIG[0];
            const [min, max] = currentConfig.range;

            // 해당 등급 전체 범위에서 단어 수집 (약 600개 이상 확보)
            for (let l = min; l <= max; l++) {
                const levelData = vocaDB.find((d: any) => d.level === l);
                if (levelData?.words) pool = [...pool, ...levelData.words];
            }

            if (pool.length === 0) {
                const fallback = vocaDB.find((d: any) => d.words?.length > 0);
                if (fallback?.words) pool = fallback.words;
            }

            // Ensure absolute uniqueness and prioritize fresh words
            const final = pickUniqueWords(pool, 15);
            
            // Mark as seen
            if (final.length > 0) {
                markWordsAsSeen(final.map((w: any) => w.word));
            }

            return final;
        } catch { return []; }
    };

    // 온라인 유저 로드
    const loadOnlineUsers = async () => {
        try {
            const users = await getOnlineUsers(20);
            // 자신은 제외
            const filtered = users.filter(u => u.nickname !== userInfo?.nickname);
            setOnlineUsers(filtered);
        } catch (e) {
            console.warn('getOnlineUsers failed:', e);
        }
    };

    // 대기방 목록 로드 (수동 새로고침 시에도 리스너가 동작하지만, 명시적으로 로딩 상태 표시)
    const loadWaitingRooms = async () => {
        setIsLoadingRooms(true);
        try {
            const rooms = await getOpenBattleRooms(10);
            setWaitingRooms(rooms);
        } catch (e) {
            console.warn('getOpenBattleRooms failed:', e);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    // 내 전적 로드
    const loadHistory = async () => {
        if (!props.firebaseUser) return;
        try {
            const h = await getBattleHistory(props.firebaseUser.uid);
            setBattleHistory(h);
        } catch (e) { console.warn("Load history error", e); }
    };

    useEffect(() => {
        if (gameState === 'LOBBY') {
            if (lobbyTab === 'rooms') {
                if (!checkBreaker('OpenRooms')) return;
                setIsLoadingRooms(true);
                const unsub = listenToOpenBattleRooms((rooms) => {
                    // 자기 자신의 방은 목록에서 제외
                    const myUid = props.firebaseUser?.uid;
                    const filtered = myUid ? rooms.filter(r => r.challengerId !== myUid) : rooms;
                    setWaitingRooms(filtered);
                    setIsLoadingRooms(false);
                }, 15);
                waitingRoomsListenerRef.current = unsub;
            } else {
                if (waitingRoomsListenerRef.current) {
                    waitingRoomsListenerRef.current();
                    waitingRoomsListenerRef.current = null;
                }
                if (lobbyTab === 'online') loadOnlineUsers();
                if (lobbyTab === 'history') loadHistory();
            }
        } else {
            if (waitingRoomsListenerRef.current) {
                waitingRoomsListenerRef.current();
                waitingRoomsListenerRef.current = null;
            }
        }

        // [Fix] Ghost Room Issue: Cleanup Firestore status when component unmounts or navigates away
        return () => {
            if (activeBattle?.id && props.firebaseUser?.uid) {
                // If in matching or ready room, cancel or leave
                // Use non-blocking catch to avoid unmount errors
                if (gameState === 'MATCHING' || gameState === 'READY_ROOM') {
                    if (isChallenger) cancelChallenge(activeBattle.id).catch(() => {});
                    else leaveBattleRoom(activeBattle.id, props.firebaseUser.uid).catch(() => {});
                }
            }
            if (waitingRoomsListenerRef.current) {
                waitingRoomsListenerRef.current();
                waitingRoomsListenerRef.current = null;
            }
        };
    }, [gameState, lobbyTab, activeBattle?.id, props.firebaseUser?.uid, isChallenger]);

    // 닉네임 검색
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchResult(null);
        try {
            const results = await searchUserByNickname(searchQuery.trim());
            setSearchResult(results);
        } catch (e) {
            setSearchResult([]);
        }
    };

    // ── 실시간 도전 감시 ─────────────────────────────────────
    useEffect(() => {
        const uid = props.firebaseUser?.uid;
        if (!uid || gameState !== 'LOBBY') return;
        
        if (!checkBreaker('Challenges')) return;
        const unsub = listenToMyChallenges(uid, (battle) => {
            if (battle) setIncomingChallenge(battle);
        });
        return () => unsub();
    }, [props.firebaseUser?.uid, gameState]);

    /**
     * 공개 대기방 만들기
     */
    const handleCreateRoom = async () => {
        if (!props.firebaseUser) {
            setShowLoginModal(true);
            return;
        }
        if (!roomTitle.trim()) {
            alert(lang === 'ko' ? '방 제목을 입력해주세요!' : 'Please enter a room title!');
            return;
        }

        try {
            // 선택된 CEFR 등급의 대표 레벨(시작 레벨) 결정
            const config = CEFR_CONFIG.find(c => c.id === selectedCefr) || CEFR_CONFIG[0];
            const representativeLevel = config.range[0];

            // userInfo 전체 전달 (skin, level 등 포함)
            const bId = await createOpenBattleRoom(
                { ...userInfo, uid: props.firebaseUser.uid } as any,
                representativeLevel,
                roomTitle.trim(),
                challengeMsg || t(lang, 'default_challenge_msg')
            );
            setIsChallenger(true);
            setActiveBattle({
                id: bId,
                challengerId: props.firebaseUser.uid,
                challengerName: userInfo.nickname,
                challengerSkin: equippedSkin,
                challengerLevel: userLevel,
                receiverId: '',
                status: 'WAITING',
                battleLevel,
                title: roomTitle.trim(),
                ownerId: props.firebaseUser.uid,
                createdAt: new Date()
            });
            setShowCreateModal(false);
            setGameState('READY_ROOM');
        } catch (e) {
            console.error("Create room error", e);
        }
    };

    /**
     * 공개 대기방 입장하기
     */
    const handleJoinRoom = async (room: BattleRoom) => {
        if (!props.firebaseUser) {
            setShowLoginModal(true);
            return;
        }

        const pool = generateBattlePool(room.battleLevel);
        if (pool.length === 0) return;

        try {
            // userInfo 전체 전달 (skin, level 등 포함)
            const fullUser = { ...userInfo, uid: props.firebaseUser.uid, skin: equippedSkin, level: userLevel };
            await joinBattleRoom(room.id, fullUser as any, pool);
            
            setRival({
                name: room.challengerName,
                skin: '🎮',
                level: 1,
                region: '🌍'
            });
            setIsChallenger(false);
            setBattleWords(pool);
            setGameState('READY_ROOM');
            setActiveBattle({ 
                ...room, 
                status: 'ACCEPTED', 
                receiverId: props.firebaseUser.uid,
                receiverName: userInfo.nickname,
                receiverSkin: equippedSkin,
                receiverLevel: userLevel
            });
        } catch (e) {
            console.error("Join room error", e);
        }
    };

    /**
     * 도전장 보내기 / 매칭 시작
     */
    const startMatching = async (specificRival?: VQUser) => {
        const pool = generateBattlePool(battleLevel);
        if (pool.length === 0) {
            alert(lang === 'ko' ? '단어 데이터를 불러올 수 없습니다.' : 'Failed to load word data.');
            return;
        }

        setBattleWords(pool);

        // 1. 진짜 유저에게 도전하는 경우 (1:1 PvP)
        if (specificRival && specificRival.isOnline) {
            if (!props.firebaseUser) {
                setShowLoginModal(true);
                return;
            }

            setIsChallenger(true);
            setRival({
                name: specificRival.nickname,
                skin: SKIN_EMOJI[specificRival.skin] || '🎮',
                level: specificRival.level || 1,
                region: specificRival.region || '🌍',
                winCount: specificRival.winCount || 0,
                loseCount: specificRival.loseCount || 0
            });
            targetWordIdxRef.current = -1;
            setSolvedCount(0);
            setCurrentWordIdx(0);
            setGameState('MATCHING');

            try {
                const bId = await createBattleRoom(
                    { uid: props.firebaseUser.uid, nickname: userInfo.nickname } as any,
                    specificRival.uid,
                    battleLevel,
                    challengeMsg || `${selectedCefr} 레벨에서 도전합니다!`,
                    pool
                );

                setActiveBattle({ id: bId });

                battleListenerRef.current = listenToBattleStatus(bId, (room) => {
                    if (room?.status === 'ACCEPTED') {
                        if (battleListenerRef.current) battleListenerRef.current();
                        battleListenerRef.current = null;
                        setActiveBattle(room);
                        setGameState('READY_ROOM');
                    } else if (room?.status === 'DECLINED') {
                        if (battleListenerRef.current) battleListenerRef.current();
                        battleListenerRef.current = null;
                        setShowDeclinedModal(true);
                        setGameState('LOBBY');
                    }
                });
            } catch (e) {
                console.error("Challenge error", e);
                setGameState('LOBBY');
            }
        }
        // 2. 빠른 매칭 (큐 활용)
        else {
            if (!props.firebaseUser) {
                setShowLoginModal(true);
                return;
            }

            targetWordIdxRef.current = -1;
            setSolvedCount(0);
            setCurrentWordIdx(0);
            setGameState('MATCHING');
            setIsChallenger(false); // 일단 대기자 역할로 초기화
            
            const fullUser = { ...userInfo, uid: props.firebaseUser.uid, skin: equippedSkin, level: userLevel };

            // 1) 즉시 매칭 시도 (내가 다른 대기방 선점)
            const matchedBattleId = await findAndClaimQuickMatch(fullUser as any, battleLevel, pool);
            
            if (matchedBattleId) {
                // 선점 성공 -> 바로 IN-GAME 돌입
                listenToBattleStatus(matchedBattleId, (room) => {
                    if (room) {
                        setActiveBattle(room);
                        setRival({
                            name: room.challengerName,
                            skin: (room.challengerSkin && SKIN_EMOJI[room.challengerSkin]) || '🎮',
                            level: room.challengerLevel || 1,
                            region: room.challengerRegion || '🌍'
                        });
                        setGameState('BATTLE');
                    }
                });
                return;
            }

            // 2) 매칭 실패 시 큐 대기
            await joinQuickMatchQueue(fullUser as any, battleLevel);
            setIsChallenger(true); // 큐를 만들고 기다리므로 방장 역할(Challenger) 부여

            // 리스너 등록: 누군가 나를 선점했는지 감시
            quickMatchListenerRef.current = listenToQuickMatchResult(props.firebaseUser.uid, (mId) => {
                if (mId) {
                    if (quickMatchListenerRef.current) quickMatchListenerRef.current();
                    clearTimeout(quickMatchTimeoutRef.current);
                    
                    listenToBattleStatus(mId, (room) => {
                        if (room) {
                            setActiveBattle(room);
                            setRival({
                                name: room.receiverName,
                                skin: (room.receiverSkin && SKIN_EMOJI[room.receiverSkin]) || '🎮',
                                level: room.receiverLevel || 1,
                                region: room.receiverRegion || '🌍'
                            });
                            setGameState('BATTLE');
                        }
                    });
                }
            });

            // 3) 15초(15000ms) 동안 매칭 안 되면 AI 봇 매칭으로 폴백
            quickMatchTimeoutRef.current = setTimeout(() => {
                if (quickMatchListenerRef.current) {
                    quickMatchListenerRef.current(); // 리스너 해제
                }
                cancelQuickMatchQueue(props.firebaseUser.uid); // 큐에서 삭제
                
                const BOTS = [
                    { name: 'VocaBot', skin: '🤖', level: 1, winRate: '50%', region: 'KR' },
                    { name: 'WordAI', skin: '👾', level: 5, winRate: '67%', region: 'VN' },
                ];
                setRival(BOTS[Math.floor(Math.random() * BOTS.length)]);
                setIsChallenger(true); // 봇전은 로컬 처리이므로 기본 역할
                setActiveBattle(null);
                setGameState('BATTLE');
            }, 15000);
        }
    };

    // ── 배틀 타이머 및 Disconnect 체크 ──────────────────────
    useEffect(() => {
        if (gameState === 'BATTLE' && !isActiveCountdown) {
            lastRoundTimeRef.current = Date.now();
            setTimeLeft(10);
            
            timerRef.current = setInterval(() => {
                const now = Date.now();
                
                // [NEW] 상대방 접속 끊김 (Disconnect / Zombie) 판별 (25초 경과 시)
                // activeBattle(진짜 유저 매칭)일 때만 동작
                if (activeBattle && (now - lastRoundTimeRef.current > 25000)) {
                    console.log('Opponent disconnected or idle too long. Winning by timeout.');
                    setRivalHP(0); // 상대방 강제 패배 처리
                    return;
                }

                setTimeLeft(prev => {
                    if (prev <= 1) { handleAnswer(-1); return 10; }
                    return prev - 1;
                });
                // AI 봇전일 때만 랜덤 봇 공격 시뮬레이션
                if (!activeBattle) {
                    if (Math.random() > 0.96) setPlayerHP(p => Math.max(0, p - 6));
                }
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [gameState, activeBattle, isActiveCountdown]);

    // ── 게임 종료 ───────────────────────────────────────────
    useEffect(() => {
        const handleEnd = (res: 'WIN' | 'LOSE') => {
            if (gameState !== 'BATTLE') return;
            setBattleResult(res);
            showAdIfFree().then(() => setGameState('RESULT'));

            if (props.firebaseUser) {
                recordBattleResult(props.firebaseUser.uid, res === 'WIN').catch(e => console.error("record result error", e));

                if (activeBattle) {
                    finalizeBattle(activeBattle.id, res === 'WIN' ? props.firebaseUser.uid : (activeBattle.challengerId === props.firebaseUser.uid ? activeBattle.receiverId : activeBattle.challengerId))
                        .catch(e => console.error("finalize error", e));
                }
            }

            if (typeof props.setUserPoints === 'function' && res === 'WIN') {
                try { props.setUserPoints((p: number) => p + 100); } catch (e) { }
            }
        };
        if (gameState === 'BATTLE') {
            if (playerHP <= 0) handleEnd('LOSE');
            else if (rivalHP <= 0) handleEnd('WIN');
            else if (solvedCount >= 15) {
                handleEnd(playerHP >= rivalHP ? 'WIN' : 'LOSE');
            }
        }
    }, [playerHP, rivalHP, solvedCount, gameState, activeBattle, isChallenger]);

    // PvP 중 상대방의 HP 변화 및 결과/재도전 상태 감시
    useEffect(() => {
        if ((gameState !== 'BATTLE' && gameState !== 'RESULT' && gameState !== 'READY_ROOM') || !activeBattle?.id) return;

        if (!checkBreaker('BattleStatus')) return;
        const unsub = listenToBattleStatus(activeBattle.id, (room) => {
            if (!room) return;
            setActiveBattle(room);

            const myUid = props.firebaseUser?.uid;
            if (!myUid) return;

            // 내가 방장(challenger)인지 확인
            const isMeChallengerField = room.challengerId === myUid;
            
            // 상대방 정보 추출
            if (isMeChallengerField) {
                // 내 라이벌은 receiver
                if (room.receiverId && room.receiverName) {
                    setRival({
                        name: room.receiverName,
                        skin: (room.receiverSkin && SKIN_EMOJI[room.receiverSkin]) || '🎮',
                        level: room.receiverLevel || 1,
                        region: room.receiverRegion || '🌍'
                    });
                } else {
                    setRival(null);
                }
            } else {
                // 내 라이벌은 challenger (방장)
                setRival({
                    name: room.challengerName,
                    skin: (room.challengerSkin && SKIN_EMOJI[room.challengerSkin]) || '🎮',
                    level: room.challengerLevel || 1,
                    region: room.challengerRegion || '🌍'
                });
            }

            if (gameState === 'BATTLE') {
                const remoteRivalHP = isChallenger ? room.receiverHP : room.challengerHP;
                const remoteMyHP = isChallenger ? room.challengerHP : room.receiverHP;

                if (remoteRivalHP !== undefined) setRivalHP(remoteRivalHP);
                if (remoteMyHP !== undefined) setPlayerHP(remoteMyHP);

                const remoteRivalEmoji = isChallenger ? room.receiverEmoji : room.challengerEmoji;
                if (remoteRivalEmoji) {
                    const em = remoteRivalEmoji.split('_')[0];
                    setREmoji(em);
                    setTimeout(() => setREmoji(null), 1500);
                }

                if (room.currentWordIdx !== undefined && room.currentWordIdx > targetWordIdxRef.current) {
                    lastRoundTimeRef.current = Date.now(); // [NEW] 라운드 갱신 시간 기록 (Disconnect 체크용)
                    triggerNextRound(room.currentWordIdx);
                }
            }
            
            // [Rematch Logic] Handle state reset whenever a new game starts or is accepted
            const isNewGameStarting = (room.status === 'ACCEPTED' || room.status === 'ONGOING');
            const isFinishedState = (gameState === 'RESULT' || gameState === 'READY_ROOM');

            if (isNewGameStarting && isFinishedState) {
                // If the game just started (ONGOING) or is in ready room (ACCEPTED)
                // we must ensure locally we have reset for the new round.
                if (room.status === 'ACCEPTED' && gameState === 'RESULT') {
                    setGameState('READY_ROOM');
                    setSolvedCount(0);
                    setCurrentWordIdx(0);
                    setPlayerHP(100);
                    setRivalHP(100);
                    targetWordIdxRef.current = -1;
                } else if (room.status === 'ONGOING' && (gameState === 'READY_ROOM' || gameState === 'RESULT')) {
                    // Update words before starting
                    if (room.battleWords && room.battleWords.length > 0) {
                        setBattleWords(room.battleWords);
                    }
                    // Reset if coming directly from RESULT (skipped ACCEPTED)
                    if (gameState === 'RESULT') {
                        setSolvedCount(0);
                        setCurrentWordIdx(0);
                        setPlayerHP(100);
                        setRivalHP(100);
                    }
                    targetWordIdxRef.current = -1;
                    setGameState('BATTLE');
                }
            }
            
            if (room.status === 'WAITING' && gameState === 'RESULT') {
                const isMeKicked = isChallenger ? (room.challengerId === '') : (room.receiverId === '');
                if (isMeKicked) {
                    setGameState('LOBBY');
                    setActiveBattle(null);
                    setShowDeclinedModal(true);
                }
            }
        });
        return () => unsub();
    }, [gameState, activeBattle?.id, isChallenger, props.firebaseUser?.uid]);

    const handleSendMessage = async () => {
        if (!chatMsg.trim() || !activeBattle || !props.firebaseUser) return;
        try {
            await sendBattleChatMessage(activeBattle.id, props.firebaseUser.uid, userInfo.nickname, chatMsg.trim());
            setChatMsg('');
        } catch (e) {
            console.error("Send message error", e);
        }
    };

    const handleStartBattle = async () => {
        if (!activeBattle) return;
        try {
            await startBattleOfficial(activeBattle.id);
        } catch (e) {
            console.error("Start battle error", e);
        }
    };

    const handleSendEmoji = async (emoji: string) => {
        if (!activeBattle) {
            setPEmoji(emoji);
            setTimeout(() => setPEmoji(null), 1500);
            return;
        }
        setPEmoji(emoji);
        setTimeout(() => setPEmoji(null), 1500);
        await sendBattleEmoji(activeBattle.id, isChallenger, emoji);
    };

    /**
     * 도전 수락
     */
    const handleAcceptChallenge = async () => {
        if (!incomingChallenge) return;
        try {
            await respondToChallenge(incomingChallenge.id, true);

            setRival({
                name: incomingChallenge.challengerName,
                skin: '🎮',
                level: 1,
                region: '🌍'
            });
            setIsChallenger(false);
            setActiveBattle(incomingChallenge);
            setIncomingChallenge(null);

            targetWordIdxRef.current = -1;
            setSolvedCount(0);
            setCurrentWordIdx(0);

            const pool = (incomingChallenge.battleWords && incomingChallenge.battleWords.length > 0)
                ? incomingChallenge.battleWords
                : generateBattlePool(incomingChallenge.battleLevel || 1);
            setBattleWords(pool);
            setGameState('BATTLE');
        } catch (e) {
            console.error("Accept error", e);
        }
    };

    /**
     * 도전 거절
     */
    const handleDeclineChallenge = async () => {
        if (!incomingChallenge) return;
        await respondToChallenge(incomingChallenge.id, false);
        setIncomingChallenge(null);
    };

    /**
     * 매칭 취소
     */
    const handleCancelMatching = async () => {
        if (battleListenerRef.current) {
            battleListenerRef.current();
            battleListenerRef.current = null;
        }
        if (quickMatchListenerRef.current) {
            quickMatchListenerRef.current();
            quickMatchListenerRef.current = null;
        }
        if (quickMatchTimeoutRef.current) {
            clearTimeout(quickMatchTimeoutRef.current);
            quickMatchTimeoutRef.current = null;
        }
        
        if (props.firebaseUser?.uid) {
            cancelQuickMatchQueue(props.firebaseUser.uid);
        }

        if (activeBattle?.id) {
            await cancelChallenge(activeBattle.id);
        }

        setGameState('LOBBY');
        setActiveBattle(null);
        setIsChallenger(false);
    };

    // ── 답변 처리 ────────────────────────────────────────────
    const handleAnswer = (idx: number) => {
        if (battleWords.length === 0 || gameState !== 'BATTLE' || isActiveCountdown) return;

        const { currentWordIdx, playerHP, playerCombo } = stateRef.current;
        const currentWord = battleWords[currentWordIdx];
        const isCorrect = idx === (currentWord?.answer_index);
        const nextIdx = currentWordIdx + 1;

        if (isCorrect) {
            const damage = 18 + playerCombo * 2;
            setRivalHP(prev => Math.max(0, prev - damage));
            if (activeBattle) {
                attackRival(activeBattle.id, isChallenger, damage).catch(() => { });
            }
            setPlayerCombo(prev => prev + 1);
            if (typeof playSound === 'function') try { playSound('correct'); } catch (e) { }
            setPlayerAnim('attack'); setRivalAnim('hit');
            setTimeout(() => { setPlayerAnim('idle'); setRivalAnim('idle'); }, 400);
        } else {
            const damage = 10;
            const nextHP = Math.max(0, playerHP - damage);
            setPlayerHP(nextHP);
            if (activeBattle) {
                updateBattleHP(activeBattle.id, isChallenger, nextHP).catch(() => { });
            }
            setPlayerCombo(0);
            if (typeof playSound === 'function') try { playSound('wrong'); } catch (e) { }
            setRivalAnim('attack'); setPlayerAnim('hit');
            setTimeout(() => { setPlayerAnim('idle'); setRivalAnim('idle'); }, 400);
        }

        if (activeBattle) {
            advanceBattleRound(activeBattle.id, nextIdx).catch(() => { });
        }

        triggerNextRound(nextIdx);
    };

    const pSkin = SKIN_EMOJI[equippedSkin] || '🐣';
    const isRoomOwner = activeBattle?.ownerId === props.firebaseUser?.uid;

    return (
        <div className="screen bg-white flex flex-col overflow-hidden font-sans">
            {/* LOBBY */}
            {gameState === 'LOBBY' && (
                <>
                    <header className="px-6 pb-4 flex items-center justify-between bg-indigo-600 text-white shrink-0 shadow-lg" style={{ paddingTop: 'calc(1rem + var(--safe-area-top))' }}>
                        <button 
                            onClick={() => {
                                // [Fix] Clear any active matching if exiting lobby
                                if (activeBattle?.id) cancelChallenge(activeBattle.id).catch(() => {});
                                setScreen('HOME')
                            }} 
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">{t(lang, 'battle_title')}</h2>
                        <div className="w-10" />
                    </header>

                    <div className="flex-1 overflow-y-auto pb-24">
                        <div className="bg-indigo-600 px-8 pt-4 pb-14 rounded-b-[50px] flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 rounded-[30px] flex items-center justify-center text-4xl border-2 border-white/20 shadow-inner">{pSkin}</div>
                            <div className="text-center">
                                <h3 className="text-white text-xl font-black italic tracking-tight">{userInfo?.nickname || t(lang, 'voca_warrior')}</h3>
                                <div className="inline-block bg-yellow-400 px-4 py-0.5 rounded-full font-black text-indigo-900 text-xs shadow-lg uppercase mt-1">Level {userLevel}</div>
                            </div>
                            <div className="w-full px-4 mt-2">
                                <input
                                    type="text"
                                    value={challengeMsg}
                                    onChange={(e) => setChallengeMsg(e.target.value)}
                                    placeholder={lang === 'ko' ? "상대를 도발할 메시지 입력..." : "Enter a provocative message..."}
                                    maxLength={25}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-white placeholder-white/40 text-sm font-bold focus:outline-none focus:bg-white/20 transition-all text-center"
                                />
                            </div>
                        </div>

                        <div className="px-6 -mt-8 mb-4 grid grid-cols-2 gap-3">
                            <button onClick={() => setShowCreateModal(true)}
                                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm shadow-2xl active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <Swords size={20} className="text-white" />
                                {lang === 'ko' ? '방 만들기' : 'Create Room'}
                            </button>
                            <button onClick={() => startMatching()}
                                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm shadow-2xl active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                                {lang === 'ko' ? '빠른 매칭' : 'Quick Match'}
                            </button>
                        </div>

                        <div className="px-6 mb-8 mt-2">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 ml-1">
                                {lang === 'ko' ? '대결 등급 선택' : 'SELECT BATTLE GRADE'}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {CEFR_CONFIG.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCefr(c.id)}
                                        className={`py-3 rounded-2xl font-black text-xs transition-all border-2 flex flex-col items-center gap-0.5 ${selectedCefr === c.id
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.03]'
                                            : 'bg-white border-slate-100 text-slate-400'
                                            }`}
                                    >
                                        <span style={{ color: selectedCefr === c.id ? 'white' : c.color }}>{c.id}</span>
                                        <span className="text-[8px] opacity-60 font-bold uppercase">{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 mb-4">
                            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                                <button onClick={() => setLobbyTab('rooms')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${lobbyTab === 'rooms' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {lang === 'ko' ? '🏰 대기방' : '🏰 Rooms'}
                                </button>
                                <button onClick={() => setLobbyTab('online')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${lobbyTab === 'online' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {lang === 'ko' ? '🟢 온라인' : '🟢 Online'}
                                </button>
                                <button onClick={() => setLobbyTab('search')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${lobbyTab === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {lang === 'ko' ? '🔍 검색' : '🔍 Search'}
                                </button>
                                <button onClick={() => setLobbyTab('history')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${lobbyTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {lang === 'ko' ? '📜 전적' : '📜 History'}
                                </button>
                            </div>
                        </div>

                        {lobbyTab === 'rooms' && (
                            <div className="px-6 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                        {lang === 'ko' ? `참여 가능한 방 ${waitingRooms.length}개` : `${waitingRooms.length} Waiting Rooms`}
                                    </p>
                                    <button onClick={loadWaitingRooms} className="text-slate-300 active:scale-90 transition">
                                        <RefreshCw size={14} className={isLoadingRooms ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                {isLoadingRooms && <div className="flex items-center justify-center py-10 text-slate-300 gap-2"><RefreshCw size={18} className="animate-spin" /><span className="text-xs font-bold">Loading...</span></div>}
                                {!isLoadingRooms && waitingRooms.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                        <div className="text-4xl mb-3">👻</div>
                                        <p className="text-slate-400 text-sm font-bold">{lang === 'ko' ? '참여 가능한 방이 없습니다.' : 'No available rooms yet.'}</p>
                                    </div>
                                )}
                                {!isLoadingRooms && waitingRooms.map((room, i) => {
                                    const isWaiting = room.status === 'WAITING';
                                    return (
                                        <div 
                                            key={i} 
                                            className={`bg-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-md border border-indigo-50 transition-all ${isWaiting ? 'active:scale-95 group cursor-pointer' : 'opacity-70'}`}
                                            onClick={() => isWaiting && handleJoinRoom(room)}
                                        >
                                            <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-colors ${isWaiting ? 'bg-indigo-50 group-hover:bg-indigo-600' : 'bg-slate-100 grayscale'}`}>
                                                    🏰
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-slate-900 text-sm mb-0.5 truncate">{room.title || `${room.challengerName}'s Room`}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{room.challengerName}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0" />
                                                        <span className="text-[10px] font-black text-indigo-500 shrink-0">Lv.{room.battleLevel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isWaiting ? (
                                                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 uppercase italic tracking-tighter shrink-0">Enter</button>
                                            ) : (
                                                <button disabled className="px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase tracking-tighter shrink-0">{lang === 'ko' ? '게임중' : 'Playing'}</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {lobbyTab === 'online' && (
                            <div className="px-6 space-y-3">
                                <div className="flex items-center justify-between mb-1"><p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Online {onlineUsers.length}</p></div>
                                {onlineUsers.map((u, i) => (
                                    <div key={i} className="bg-white p-4 rounded-[2rem] flex items-center justify-between shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{SKIN_EMOJI[u.skin] || '🎮'}</div>
                                            <div><p className="font-black text-slate-800 text-sm uppercase">{u.nickname}</p><p className="text-[10px] text-slate-400 font-bold">Lv.{u.level} · {u.winCount||0}W {u.loseCount||0}L</p></div>
                                        </div>
                                        <button onClick={() => startMatching(u)} className="p-3 text-indigo-600 bg-indigo-50 rounded-2xl"><Swords size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {lobbyTab === 'search' && (
                            <div className="px-6 space-y-4">
                                <div className="flex gap-2">
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Enter nickname..." className="flex-1 bg-white border-2 border-slate-100 rounded-[20px] px-5 py-4 text-sm font-bold shadow-sm" />
                                    <button onClick={handleSearch} className="w-14 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center shadow-lg"><Search size={18} /></button>
                                </div>
                                {searchResult?.map((res, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] p-5 border-2 border-indigo-100 shadow-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3"><div className="text-3xl">{SKIN_EMOJI[res.skin] || '🎮'}</div><div><p className="font-black text-slate-900 text-sm uppercase">{res.nickname}</p></div></div>
                                        <button onClick={() => startMatching(res)} className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg">Challenge!</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {lobbyTab === 'history' && (
                            <div className="px-6 space-y-3">
                                {battleHistory.map((h, i) => {
                                    const isWin = h.winnerId === props.firebaseUser.uid;
                                    return (
                                        <div key={i} className="bg-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg ${isWin ? 'bg-indigo-500' : 'bg-slate-300'}`}>{isWin ? 'WIN' : 'LOSE'}</div>
                                                <div><p className="font-black text-slate-900 text-sm uppercase">{h.receiverId===props.firebaseUser.uid ? h.challengerName : h.receiverName||'Player'}</p></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {/* [Fix] Spacer for Ad bottom */}
                        {!isPremium && <div className="h-[calc(var(--ad-height)+20px)]" />}
                    </div>
                </>
            )}

            {/* MATCHING */}
            {gameState === 'MATCHING' && (
                <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center relative">
                    <button onClick={handleCancelMatching} className="absolute right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400" style={{ top: 'calc(1.25rem + var(--safe-area-top))' }}><X size={20} /></button>
                    <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                        <div className="absolute inset-0 border-8 border-slate-50 rounded-full" />
                        <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                        <div className="text-6xl animate-pulse">{rival?.skin || '🏰'}</div>
                    </div>
                    <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter mb-2">{t(lang, 'searching')}</h2>
                    <p className="mt-12 text-slate-400 text-sm font-bold animate-pulse">{lang === 'ko' ? '상대방의 수락을 기다리는 중...' : 'Waiting for opponent...'}</p>
                </div>
            )}

            {/* READY_ROOM */}
            {gameState === 'READY_ROOM' && (
                <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                    <div className="px-6 flex justify-between items-center mb-4 shrink-0" style={{ paddingTop: 'calc(1rem + var(--safe-area-top))' }}>
                        <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter">{lang === 'ko' ? '대기실' : 'Ready Room'}</h2>
                        <button 
                            onClick={() => { 
                                if(activeBattle?.id && props.firebaseUser?.uid) {
                                    if(isChallenger) cancelChallenge(activeBattle.id).catch(()=>{});
                                    else leaveBattleRoom(activeBattle.id, props.firebaseUser.uid).catch(()=>{});
                                } 
                                setGameState('LOBBY'); 
                            }} 
                            className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 active:scale-90 transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    <div className="px-6 grid grid-cols-2 gap-4 mb-4 shrink-0">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
                            <div className="text-5xl mb-3">{pSkin}</div>
                            <span className="text-sm font-black text-slate-800 line-clamp-1">{userInfo.nickname}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isRoomOwner ? 'text-indigo-500' : 'text-slate-400'}`}>
                                {isRoomOwner ? 'Host' : 'Challenger'}
                            </span>
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center relative">
                            <div className="text-5xl mb-3">{rival?.skin || '🏰'}</div>
                            <span className="text-sm font-black text-slate-800 line-clamp-1">{rival?.name || '...'}</span>
                            <span className={`text-[10px] font-bold tracking-widest mt-1 italic ${!isRoomOwner ? 'text-indigo-500' : 'text-slate-400'}`}>
                                {!isRoomOwner ? 'Host' : 'Challenger'}
                            </span>
                            {!rival && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[2.5rem] flex items-center justify-center animate-pulse"><span className="text-[10px] font-black text-slate-300 italic">WAITING...</span></div>}
                        </div>
                    </div>

                    {/* 채팅 영역: 높이 고정으로 시작 버튼이 광고에 가려지지 않게 함 */}
                    <div className="h-[260px] px-6 pb-2 flex flex-col shrink-0 overflow-hidden">
                        <div className="h-full bg-white rounded-[2.5rem] shadow-inner border border-slate-100 p-6 flex flex-col min-h-0 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3 shrink-0"><MessageSquare size={16} className="text-slate-300" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Chat</span></div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {activeBattle?.messages?.map((m: any, idx: number) => (
                                    <div key={idx} className={`flex flex-col ${m.senderId === props.firebaseUser?.uid ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] font-bold text-slate-400 px-1">{m.senderNickname}</span>
                                        <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${m.senderId === props.firebaseUser?.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>{m.text}</div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="mt-3 flex gap-2 shrink-0">
                                <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message..." className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold" />
                                <button onClick={handleSendMessage} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"><Send size={20} /></button>
                            </div>
                        </div>
                    </div>
                    
                    {/* 버튼과의 간격을 위한 여백 스페이서 */}
                    <div className="flex-1" />

                    {/* 시작 버튼: shrink-0으로 항상 하단 고정 */}
                    <div 
                        className="px-6 pt-4 shrink-0 transition-all duration-300"
                        style={{ paddingBottom: isPremium ? 'calc(2rem + var(--safe-area-bottom))' : 'calc(var(--ad-height) + 2rem + var(--safe-area-bottom))' }}
                    >
                        {isRoomOwner ? (
                            <button onClick={handleStartBattle} disabled={!rival} className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-2xl transition-all ${rival ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>START BATTLE</button>
                        ) : (
                            <div className="w-full py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-center text-slate-400 font-black text-sm italic animate-pulse">Waiting for Host...</div>
                        )}
                    </div>
                </div>
            )}

            {/* BATTLE */}
            {gameState === 'BATTLE' && (
                <div className="flex-1 bg-white flex flex-col overflow-hidden pt-12 select-none">
                    <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-slate-100" style={{ paddingTop: 'calc(1.25rem + var(--safe-area-top))' }}>
                        <div className="w-[42%]"><p className="text-[10px] font-black text-indigo-600 mb-1">{userInfo?.nickname||'YOU'}</p><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${playerHP}%` }} /></div></div>
                        <div className="bg-slate-900 text-white rounded-full px-4 py-1.5 text-[11px] font-black italic shadow-lg">{solvedCount + 1} / 15</div>
                        <div className="w-[42%] text-right"><p className="text-[10px] font-black text-red-600 mb-1">{rival?.name||'Rival'}</p><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${rivalHP}%` }} /></div></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative p-10">
                        {pEmoji && <div className="absolute top-2 left-6 bg-white shadow-lg rounded-2xl px-3 py-1 text-4xl animate-bounce z-20 border border-slate-100">{pEmoji}</div>}
                        {rEmoji && <div className="absolute top-2 right-6 bg-white shadow-lg rounded-2xl px-3 py-1 text-4xl animate-bounce z-20 border border-slate-100">{rEmoji}</div>}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white w-14 h-14 rounded-full border-4 border-slate-50 shadow-2xl flex items-center justify-center font-black text-xl italic">{timeLeft}</div>
                        <div className="flex items-center justify-between w-full">
                            <div className={`text-8xl transition-all duration-300 ${playerAnim === 'attack' ? 'translate-x-16 scale-110 rotate-12' : playerAnim === 'hit' ? 'animate-shake' : ''}`}>{pSkin}</div>
                            <div className={`text-8xl transition-all duration-300 ${rivalAnim === 'attack' ? '-translate-x-16 scale-110 -rotate-12' : rivalAnim === 'hit' ? 'animate-shake' : ''}`}>{rival?.skin || '🐼'}</div>
                        </div>
                    </div>
                    <div className="px-6 pb-2 flex justify-center gap-3">
                        {['😂', '😎', '😡', '😱', '🤫', '🔥'].map(emoji => (
                            <button key={emoji} onClick={() => handleSendEmoji(emoji)} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-xl">{emoji}</button>
                        ))}
                    </div>
                    <div className="bg-indigo-600 rounded-t-[50px] px-6 pt-6 flex flex-col relative shadow-[0_-20px_50px_rgba(79,70,229,0.2)] transition-all duration-300" 
                        style={{ paddingBottom: isPremium ? 'calc(80px + var(--safe-area-bottom))' : 'calc(var(--ad-height) + 80px + var(--safe-area-bottom))' }}
                    >
                        {isActiveCountdown && (
                            <div className="absolute inset-0 bg-indigo-600/90 z-50 flex items-center justify-center rounded-t-[50px]"><span className="text-8xl font-black text-white animate-bounce italic">{countdownValue}</span></div>
                        )}
                        <div className="bg-white/10 border border-white/20 p-6 rounded-[2.5rem] text-center mb-4 backdrop-blur-md">
                            <h2 className="text-4xl font-black text-white italic tracking-tight">{battleWords[currentWordIdx]?.word || '...'}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(battleWords[currentWordIdx] ? getVocaOptions(battleWords[currentWordIdx], lang) : ['...', '...', '...', '...']).map((opt: string, i: number) => (
                                <button key={i} onClick={() => handleAnswer(i)} disabled={isActiveCountdown} className="bg-white p-4 rounded-[2rem] text-[13px] font-black text-slate-800 active:scale-95 transition-all text-center h-24 flex items-center justify-center shadow-xl italic leading-tight">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* RESULT */}
            {gameState === 'RESULT' && (
                <div 
                    className="flex-1 bg-white flex flex-col items-center justify-center p-10 text-center animate-fade-in relative overflow-y-auto transition-all duration-300"
                    style={{ paddingBottom: (Capacitor.getPlatform() !== 'web' && !isPremium) ? 'calc(var(--ad-height) + 80px + var(--safe-area-bottom))' : 'calc(80px + var(--safe-area-bottom))' }}
                >
                    <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 border-4 ${battleResult === 'WIN' ? 'bg-indigo-600 border-indigo-100 text-white' : 'bg-slate-100 border-slate-50 text-slate-300'}`}>
                        {battleResult === 'WIN' ? <Trophy size={56} fill="white" /> : <Skull size={56} />}
                    </div>
                    <h2 className={`text-5xl font-black mb-3 italic tracking-tighter uppercase ${battleResult === 'WIN' ? 'text-indigo-600' : 'text-slate-900'}`}>{battleResult === 'WIN' ? t(lang, 'victory') : t(lang, 'defeated')}</h2>
                    <div className="w-full max-w-xs p-6 bg-slate-50 rounded-[2.5rem] mb-10 shadow-inner">
                        <div className="flex justify-between mb-4"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reward</span><span className="text-2xl font-black text-indigo-600">+{battleResult === 'WIN' ? '100' : '10'}</span></div>
                        <div className="flex justify-between"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Combo</span><span className="text-xl font-black text-slate-800">x{playerCombo}</span></div>
                    </div>

                    <div className="w-full max-w-xs flex flex-col gap-3">
                        {isRoomOwner ? (
                            <>
                                {activeBattle?.status === 'RECHALLENGING' ? (
                                    <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-200 mb-2">
                                        <p className="text-indigo-600 font-black text-sm mb-3">Rematch requested!</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => respondRechallenge(activeBattle.id, false)} className="flex-1 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black text-xs">Kick</button>
                                            <button onClick={() => respondRechallenge(activeBattle.id, true, generateBattlePool(activeBattle.battleLevel))} className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg">Accept</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-[11px] font-bold mb-2 italic">Wait for challenger to rematch...</p>
                                )}
                                <button onClick={() => respondRechallenge(activeBattle.id, false)} className="w-full bg-slate-100 text-slate-400 py-4 rounded-3xl font-black text-sm">Kick & Wait New</button>
                            </>
                        ) : (
                            <>
                                {activeBattle?.status === 'RECHALLENGING' ? (
                                    <div className="py-4 text-indigo-400 font-bold text-sm animate-pulse">Waiting for Approval...</div>
                                ) : (
                                    <button onClick={() => requestRechallenge(activeBattle.id)} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl text-lg italic uppercase">Rematch</button>
                                )}
                            </>
                        )}
                        <button onClick={() => { if(activeBattle?.id) cancelChallenge(activeBattle.id); setGameState('LOBBY'); }} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl text-lg italic uppercase">{t(lang, 'back_to_base')}</button>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-6"><div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5"><UserX size={36} className="text-indigo-400" /></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">로그인이 필요해요</h3>
                    <div className="flex flex-col gap-3 mt-8">
                        <button onClick={() => { setShowLoginModal(false); setScreen('LOGIN'); }} className="w-full bg-indigo-600 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-xl">Go to Login</button>
                        <button onClick={() => setShowLoginModal(false)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-[1.5rem] font-black">Close</button>
                    </div>
                </div></div>
            )}

            {incomingChallenge && gameState === 'LOBBY' && (
                <div className="fixed inset-x-4 bottom-24 bg-white rounded-[2.5rem] p-6 shadow-2xl border-2 border-indigo-600 animate-slide-up z-[10000]">
                    <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-indigo-100">⚔️</div><div><p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">New Challenge!</p><h4 className="text-xl font-black text-slate-900 italic tracking-tight line-clamp-1">{incomingChallenge.challengerName}</h4></div></div>
                    {incomingChallenge.message && <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-2xl mb-6 relative"><p className="text-slate-600 text-sm font-black italic">"{incomingChallenge.message}"</p></div>}
                    <div className="flex gap-3"><button onClick={handleDeclineChallenge} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm italic uppercase">Later</button><button onClick={handleAcceptChallenge} className="flex-2 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm italic uppercase px-8 shadow-lg">Accept!</button></div>
                </div>
            )}

            {showDeclinedModal && (
                <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"><div className="bg-white rounded-[40px] p-8 w-full max-w-[340px] shadow-2xl flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner"><Skull size={36} className="text-red-400" /></div>
                    <div className="text-center mb-10"><h3 className="text-xl font-black text-slate-900 tracking-tight">{t(lang, 'challenge_declined_title')}</h3><p className="text-sm text-slate-500 font-bold mt-2 font-bold leading-relaxed opacity-80">{t(lang, 'challenge_declined_desc')}</p></div>
                    <button onClick={() => setShowDeclinedModal(false)} className="w-full bg-slate-900 text-white font-black py-4.5 rounded-[24px] shadow-xl text-[15px] underline">OK</button>
                </div></div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-[10001] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in group">
                    <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-4 border-indigo-100 flex flex-col animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black italic text-slate-900 tracking-tight uppercase leading-none">{lang === 'ko' ? '새 배틀 방 만들기' : 'CREATE BATTLE'}</h3>
                            <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'ko' ? '방 제목' : 'ROOM TITLE'}</label>
                                <input 
                                    type="text" 
                                    value={roomTitle} 
                                    onChange={(e) => setRoomTitle(e.target.value)}
                                    placeholder={lang === 'ko' ? "예: 영어 고수만 들어와!" : "Example: Pro Only!"}
                                    maxLength={20}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 mb-2 block">{lang === 'ko' ? '대결 등급 (난이도)' : 'BATTLE GRADE'}</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CEFR_CONFIG.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setSelectedCefr(c.id)}
                                            className={`py-3 rounded-2xl font-black text-xs transition-all border-2 flex flex-col items-center gap-0.5 ${selectedCefr === c.id
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.03]'
                                                : 'bg-slate-50 border-slate-100 text-slate-400 focus:outline-none'
                                                }`}
                                        >
                                            <span>{c.id}</span>
                                            <span className={`text-[8px] font-bold uppercase ${selectedCefr === c.id ? 'text-white/70' : 'text-slate-300'}`}>{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleCreateRoom}
                            disabled={!roomTitle.trim()}
                            className="mt-10 w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            {lang === 'ko' ? '방 개설하기 ⚔️' : 'OPEN ROOM ⚔️'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Battle hooks logic lives in the component body above.
