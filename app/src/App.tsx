
import { useState, useEffect, useRef, useMemo } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getBrowserLanguage, t } from './i18n';
import { WidgetPlugin } from './utils/WidgetPlugin';
import { loadStreak, recordActivity, didActivityToday, scheduleStreakNotification, getNotifSettings, logActivity } from './streak';
import { ConversationListScreen, ConversationScreen } from './ConversationScreens';
import { BattleScreen } from './BattleScreen';
import { DictionaryScreen } from './DictionaryScreen';
import { BibleScreen } from './BibleScreen';
import { MyPhraseScreen } from './MyPhraseScreen';
import { LevelTestContainer } from './LevelTestScreens';
import { ArcadeScreen } from './ArcadeScreen';
import { LoginScreen } from './LoginScreen';
import { MemoizedLiveChatScreen as LiveChatScreen } from './LiveChatScreen';
import { auth, db } from './firebase';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { upsertUser, setUserOffline, getUserByUid, listenToUserByUid, setChatLobbyPresence } from './userService';
import { listenToMyChatRequests, listenToChatRoomStatus, cancelChatRequest } from './chatService';

import { playSound } from './utils/soundUtils';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { NoticeBanner } from './components/NoticeBanner';
import { PcHeader, PcHero, PcFooter, PcAdSlot, PcModuleGrid, PcLeaderboard, PcFeaturesDetailed, PcStats } from './components/PcComponents';
import { ArrowRight } from 'lucide-react';

import { vocaDBJson } from './data/vocaData';

import { PaywallPopup } from './components/PaywallPopup';
import { WidgetInstallPopup } from './components/WidgetInstallPopup';
import { DailyGuidePopup } from './components/DailyGuidePopup';

import { initAdMob, grantAdFreePass } from './admob';
import { initBilling, isPremiumUser } from './billing';
import { initBGM, playMainBGM, pauseMainBGM, setBgmVolume } from './bgm';
import { incrementLaunchCount, shouldShowReview } from './review';
import { ReviewPrompt } from './ReviewPrompt';
import { OfflineBanner } from './OfflineBanner';
import { AiQuotaModal } from './components/AiQuotaModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AI_DAILY_LIMIT, setDynamicGeminiConfig } from './apiUtils';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { AboutScreen, CommunityScreen, SuccessStoriesScreen, CareersScreen, ContentIntroScreen, ExpertConsultationScreen } from './screens/InfoScreens';
import { AiReportScreen } from './screens/AiReportScreen';
import { MasteryListScreen } from './screens/MasteryListScreen'
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { StoreScreen } from './screens/StoreScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { StudyModeScreen } from './screens/StudyModeScreen';
import { LegalDocumentScreen } from './screens/LegalDocumentScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { AdminDashboardScreen } from './AdminScreens';
import { EvalScreen } from './screens/EvalScreen';
import { StudyLevelScreen } from './screens/StudyLevelScreen';

const SCREEN_URL_MAP: { [key: string]: string } = {
  'HOME': 'index.html',
  'STUDY_LEVEL': 'study.html',
  'MASTERY': 'mastery.html',
  'BATTLE': 'battle.html',
  'CONVERSATION_LIST': 'aiconv.html',
  'DICTIONARY': 'dictionary.html',
  'BIBLE': 'bible.html',
  'CONTENTS': 'contents.html',
  'ABOUT': 'about.html',
  'COMMUNITY': 'community.html',
  'SUCCESS': 'success.html',
  'CAREERS': 'careers.html',
  'EXPERT': 'partnership.html',
  'STORE': 'store.html',
};

function MainApp() {
  const [screen, _setScreen] = useState<any>(() => {
    if (Capacitor.getPlatform() !== 'web') return 'SPLASH';
    const path = window.location.pathname;
    const foundEntry = Object.entries(SCREEN_URL_MAP).find(([_, url]) => path.includes(url));
    return foundEntry ? foundEntry[0] : 'SPLASH';
  });
  const [prevScreen, setPrevScreen] = useState<any>('HOME');

  const setScreen = (val: any) => {
    if (val !== screen) {
      if (['HOME', 'CONVERSATION_LIST', 'STATS', 'PROFILE', 'STORE', 'SETTINGS', 'MASTERY', 'BIBLE', 'MY_PHRASES', 'DICTIONARY', 'REVIEW', 'STUDY_LEVEL'].includes(screen)) {
        setPrevScreen(screen);
      }
      _setScreen(val);
      
      // Update URL without reload (Hybrid SPA)
      const targetUrl = SCREEN_URL_MAP[val];
      if (targetUrl && (Capacitor.getPlatform() === 'web')) {
        if (targetUrl.includes('.html') && targetUrl !== 'index.html') {
          window.location.href = `/${targetUrl}`;
          return;
        }
        window.history.pushState({ screen: val }, '', `/${targetUrl}`);
      }
    }
  };

  useEffect(() => {
    // URL fallback for browser back/forward buttons
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        _setScreen(e.state.screen);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // [NEW] Global Capacitor Hardware Back Button Handler (Android)
  useEffect(() => {
    const backBtnListener = CapApp.addListener('backButton', () => {
      if (screen === 'HOME' || screen === 'SPLASH') {
        CapApp.exitApp();
      } else {
        // Go back to Home from any other screen
        setScreen('HOME');
      }
    });

    return () => {
      backBtnListener.then((handle: any) => handle.remove());
    };
  }, [screen]);
  const [userPoints, setUserPoints] = useState(() => { const saved = localStorage.getItem('vq_points'); const val = saved ? parseInt(saved) : 1250; return isNaN(val) ? 1250 : val; });
  const [incorrectNotes, setIncorrectNotes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('vq_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vq_settings');
    const defaults = { bgm: true, sfx: true, tts: true, vibration: true, lang: getBrowserLanguage() };
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.hasOwnProperty('sound')) {
        parsed.bgm = parsed.sound;
        parsed.sfx = parsed.sound;
      }
      return { ...defaults, ...parsed };
    } catch (e) { return defaults; }
  });
  const [userInfo, setUserInfo] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('vq_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [equippedSkin, setEquippedSkin] = useState(() => localStorage.getItem('vq_skin') || 'default');
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vq_skins_purchased');
      return saved ? JSON.parse(saved) : ['default'];
    } catch (e) { return ['default']; }
  });
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('vq_unlocked_levels');
      return saved ? JSON.parse(saved) : [1];
    } catch (e) { return [1]; }
  });
  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedLevel = localStorage.getItem('vq_level');
    const val = savedLevel ? parseInt(savedLevel) : 1;
    return isNaN(val) ? 1 : val;
  });
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [activeStudyLevel, setActiveStudyLevel] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showWidgetPromo, setShowWidgetPromo] = useState(false);
  const [showDailyGuide, setShowDailyGuide] = useState(false);
  const [streak, setStreak] = useState(0);
  const [streakMax, setStreakMax] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [legalDocInfo, setLegalDocInfo] = useState<{ id: string, title: string } | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<{ type: 'praise' | 'suggest' | 'bug' } | null>(null);
  const [customWords, setCustomWords] = useState<any[]>([]);
  const [aiReportMode, setAiReportMode] = useState<'VOCAB' | 'CONVERSATION'>('VOCAB');

  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  const commitReportUsage = () => {};
  const reportUsage = 0;

  // --- [NEW] PC Version State ---
  const [isPcView, setIsPcView] = useState(() => {
    if (Capacitor.getPlatform() !== 'web') return false;
    return window.innerWidth > 1024;
  });

  useEffect(() => {
    const handleResize = () => {
        if (Capacitor.getPlatform() === 'web') {
            setIsPcView(window.innerWidth > 1024);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSyncActiveRef = useRef(false);

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
      console.error(`[CircuitBreaker] Global ${label} triggered!`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const q = query(collection(db, 'custom_voca'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const custom = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomWords(custom);
    }, (err) => console.error("Firestore custom words error:", err));
    return () => unsubscribe();
  }, []);

  // [NEW] Dynamic Gemini Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'system', 'geminiConfig'));
        if (snap.exists()) {
          setDynamicGeminiConfig(snap.data());
          console.log('[System] Remote Gemini Config Loaded');
        }
      } catch (err) {
        console.warn('[System] Failed to load remote Gemini Config. Using local fail-safe.', err);
      }
    };
    fetchConfig();
  }, []);

  const mergedVocaDB = useMemo(() => {
    if (customWords.length === 0) return vocaDBJson;
    const merged = [...vocaDBJson];
    customWords.forEach(cw => {
      const levelIdx = merged.findIndex(l => l.level === cw.level);
      if (levelIdx > -1) {
        const words = [...merged[levelIdx].words];
        const wordIdx = words.findIndex(w => w.id === cw.id || (w.word === cw.word && w.level === cw.level));
        if (wordIdx > -1) { words[wordIdx] = { ...words[wordIdx], ...cw }; }
        else { words.push(cw); }
        merged[levelIdx] = { ...merged[levelIdx], words };
      } else { merged.push({ level: cw.level, words: [cw] }); }
    });
    return merged.sort((a, b) => a.level - b.level);
  }, [customWords]);

  const [aiUsage, setAiUsage] = useState<any>(() => {
    const saved = localStorage.getItem('vq_ai_usage');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString()) return parsed.count || 0;
      } catch (e) { }
    }
    return 0;
  });

  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(() => localStorage.getItem('vq_waiting_room_id'));
  const waitingRoomIdRef = useRef<string | null>(waitingRoomId);

  useEffect(() => {
    waitingRoomIdRef.current = waitingRoomId;
    if (waitingRoomId) { localStorage.setItem('vq_waiting_room_id', waitingRoomId); }
    else { localStorage.removeItem('vq_waiting_room_id'); }
  }, [waitingRoomId]);

  const lastSyncedData = useRef<string>('');
  const syncTimerRef = useRef<any>(null);
  const userInfoRef = useRef<any>(userInfo);

  useEffect(() => { userInfoRef.current = userInfo; }, [userInfo]);

  useEffect(() => {
    LocalNotifications.requestPermissions();
    const actionListener = LocalNotifications.addListener('localNotificationActionPerformed', (notif: any) => {
      const extra = notif.notification.extra;
      if (extra?.type === 'chat_request' || extra?.type === 'chat_matched') {
        if (extra.roomId) setWaitingRoomId(extra.roomId);
        setScreen('LIVE_CHAT');
      }
    });
    return () => { actionListener.then(h => h.remove()); };
  }, []);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    if (!checkBreaker('App_ChatRequests')) return;
    const unsubRequests = listenToMyChatRequests(uid, (room: any) => {
      if (room && screen !== 'LIVE_CHAT') {
        LocalNotifications.schedule({
          notifications: [{
            title: t(settings.lang, 'notif_new_request_title'),
            body: t(settings.lang, 'notif_new_request_body').replace('{name}', room.callerName),
            id: 1001,
            extra: { type: 'chat_request', roomId: room.id },
            sound: 'res://public/assets/sounds/match.wav'
          }]
        });
      }
    });
    return () => { unsubRequests(); };
  }, [firebaseUser?.uid, screen, settings.lang]);

  useEffect(() => {
    if (!firebaseUser?.uid || !waitingRoomId) return;
    if (!checkBreaker('App_WaitingStatus')) return;
    const unsubStatus = listenToChatRoomStatus(waitingRoomId, (room: any) => {
      if (room?.status === 'ACCEPTED' && screen !== 'LIVE_CHAT') {
        if (playSound) {
          playSound('alarm');
          setTimeout(() => playSound('alarm'), 600);
        }
        LocalNotifications.schedule({
          notifications: [{
            title: t(settings.lang, 'notif_partner_joined_title'),
            body: t(settings.lang, 'notif_partner_joined_body'),
            id: 1002,
            extra: { type: 'chat_matched', roomId: waitingRoomId }
          }]
        });
      }
      if (room?.status === 'CANCELLED' || room?.status === 'DECLINED' || room?.status === 'FINISHED') {
        setWaitingRoomId(null);
      }
    });
    return () => unsubStatus();
  }, [firebaseUser?.uid, waitingRoomId, screen, settings.lang]);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    if (screen !== 'LIVE_CHAT') setChatLobbyPresence(uid, false);
  }, [screen, firebaseUser?.uid]);

  const [myPhrases, setMyPhrases] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('vq_my_phrases');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [convLevel, setConvLevel] = useState<string>(() => {
    const saved = localStorage.getItem('vq_conv_level');
    if (saved) return saved;
    return 'B1';
  });

  const resetSessionData = () => {
    isSyncActiveRef.current = false;
    setUserPoints(1250); setCurrentLevel(1); setIncorrectNotes([]); setUserInfo(null);
    setEquippedSkin('default'); setPurchasedSkins(['default']); setUnlockedLevels([1]);
    setMyPhrases([]); setAiUsage(0); setIsPremium(false); setWaitingRoomId(null);
    setStreak(0); setStreakMax(0); setTodayDone(false); setConvLevel('B1');
    lastSyncedData.current = ''; if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    Object.keys(localStorage).forEach(key => {
      if ((key.startsWith('vq_') && key !== 'vq_settings') || key.startsWith('voca_')) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: any) => {
      setFirebaseUser(user);
      if (user) {
        isSyncActiveRef.current = false; 
        try {
          const userM = await import('./userService');
          const { available, message } = await userM.checkUserAvailability(user.uid);
          if (!available) {
            alert(message); await auth.signOut(); isSyncActiveRef.current = false; return;
          }
          const profile = await getUserByUid(user.uid);
          if (profile) {
            const enrichedProfile = { ...profile, email: profile.email || user.email, isAdmin: profile.isAdmin || user.email === 'idouhak1@gmail.com', uid: user.uid };
            setUserInfo(enrichedProfile);
            if (profile.points !== undefined) setUserPoints(profile.points);
            if (profile.level !== undefined) setCurrentLevel(profile.level);
            if (profile.skin !== undefined) setEquippedSkin(profile.skin);
            if (profile.streak !== undefined) setStreak(profile.streak);
            if (profile.maxStreak !== undefined) setStreakMax(profile.maxStreak);
            if (profile.isPremium !== undefined) setIsPremium(prev => prev || !!profile.isPremium);
            if (profile.purchasedSkins) setPurchasedSkins(profile.purchasedSkins);
            if (profile.unlockedLevels) setUnlockedLevels(profile.unlockedLevels);
            if (profile.notes) { try { setIncorrectNotes(JSON.parse(profile.notes)); } catch (e) { } }
            if (profile.myPhrases) { try { setMyPhrases(JSON.parse(profile.myPhrases)); } catch (e) { } }
            localStorage.setItem('vq_user', JSON.stringify(enrichedProfile));
            isSyncActiveRef.current = true;
            if (!profile.nickname && screen !== 'SPLASH') setScreen('ONBOARDING');
          } else {
            const localPoints = (() => { const v = localStorage.getItem('vq_points'); const n = v ? parseInt(v) : 0; return isNaN(n) ? 0 : n; })();
            const localLevel = (() => { const v = localStorage.getItem('vq_level'); const n = v ? parseInt(v) : 1; return isNaN(n) ? 1 : n; })();
            setUserInfo({ nickname: '', email: user.email, isAdmin: user.email === 'idouhak1@gmail.com' });
            if (localPoints > 0) setUserPoints(localPoints);
            if (localLevel > 1) setCurrentLevel(localLevel);
            isSyncActiveRef.current = true;
            if (screen !== 'SPLASH') setScreen('ONBOARDING');
          }
        } catch (err) { isSyncActiveRef.current = true; }
      } else { resetSessionData(); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('vq_settings', JSON.stringify(settings));
    setBgmVolume(settings.bgm ? 0.35 : 0);
  }, [settings]);

  useEffect(() => {
    if (screen === 'HOME' && settings.bgm) playMainBGM(); else pauseMainBGM();
  }, [screen, settings.bgm]);

  useEffect(() => { localStorage.setItem('vq_points', userPoints.toString()); }, [userPoints]);
  useEffect(() => {
    localStorage.setItem('vq_level', currentLevel.toString());
    if (!unlockedLevels.includes(currentLevel)) {
      setUnlockedLevels((prev: number[]) => [...new Set([...prev, currentLevel])].sort((a, b) => a - b));
    }
  }, [currentLevel]);
  useEffect(() => { localStorage.setItem('vq_notes', JSON.stringify(incorrectNotes)); }, [incorrectNotes]);
  useEffect(() => { localStorage.setItem('vq_my_phrases', JSON.stringify(myPhrases)); }, [myPhrases]);
  useEffect(() => { localStorage.setItem('vq_skins_purchased', JSON.stringify(purchasedSkins)); }, [purchasedSkins]);
  useEffect(() => { localStorage.setItem('vq_skin', equippedSkin); }, [equippedSkin]);
  useEffect(() => { localStorage.setItem('vq_unlocked_levels', JSON.stringify(unlockedLevels)); }, [unlockedLevels]);
  useEffect(() => { localStorage.setItem('vq_ai_usage', JSON.stringify({ date: new Date().toDateString(), count: aiUsage })); }, [aiUsage]);
  useEffect(() => { 
    localStorage.setItem('vq_premium', isPremium ? 'true' : 'false'); 
    
    // 상태 변경 시 즉각 광고 가리기/보이기 적용 (Race Condition 방어)
    if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.getPlatform() !== 'web') {
      import('./admob').then(m => {
        if (isPremium) {
           m.hideBannerAd();
        } else {
           m.showBannerAd();
        }
      }).catch(e => console.warn('AdMob load error:', e));
    }
  }, [isPremium]);

  const incrementAiUsage = (type: 'general' | 'report' = 'general') => {
    const hasUserKey = !!localStorage.getItem('vq_gemini_key');
    logActivity('ai_usage', { type });
    if (hasUserKey || isPremium) return true;
    if (aiUsage >= AI_DAILY_LIMIT) { setShowQuotaModal(true); return false; }
    setAiUsage((prev: number) => prev + 1);
    return true;
  };

  useEffect(() => {
    initBilling(); initBGM();
    const initializeApp = async () => {
      const premium = await isPremiumUser(); 
      // RevenueCat(Native) 구독이 있는 경우 최우선 병합 적용
      setIsPremium(prev => prev || premium);
      localStorage.setItem('vq_premium', premium ? 'true' : 'false');
      
      const isAdMobReady = await initAdMob();
      if (isAdMobReady) {
        const m = await import('./admob');
        // 초기화 시점 로딩 보장 (useEffect가 먼저 불리고 무시되는 현상 방지)
        if (premium || localStorage.getItem('vq_premium') === 'true') {
            m.hideBannerAd();
        } else {
            m.showBannerAd();
        }
      }
    };
    initializeApp();
    const loadStreakData = async () => {
      const data = await loadStreak(); setStreak(data.streak); setStreakMax(data.streakMax); setTodayDone(await didActivityToday());
    };
    loadStreakData();
    incrementLaunchCount();
    if (shouldShowReview()) setShowReview(true);
  }, []);

  const handleActivityDone = async () => {
    const data = await recordActivity(); setStreak(data.streak); setStreakMax(data.streakMax); setTodayDone(true);
    if (data.isNewStreakDay && data.streak % 7 === 0) {
      alert(t(settings.lang, 'streak_7day_reward')); setUserPoints((prev: any) => prev + 500); grantAdFreePass(24);
    }
    if (isPremium && new Date().getDate() === 1) {
      alert(t(settings.lang, 'premium_monthly_reward')); setUserPoints((prev: any) => prev + 1000);
    }
    const notifSet = await getNotifSettings();
    if (notifSet.on) await scheduleStreakNotification(notifSet.hour, notifSet.min);
  };

  const triggerReviewIfReady = () => { if (shouldShowReview()) setShowReview(true); };

  const syncToFirestore = async (checksum: string) => {
    if (!firebaseUser || !isSyncActiveRef.current) return;
    try {
      lastSyncedData.current = checksum;
      await upsertUser(firebaseUser.uid, {
        ...userInfoRef.current, points: userPoints, level: currentLevel, streak, streakMax,
        notes: JSON.stringify(incorrectNotes), myPhrases: JSON.stringify(myPhrases),
        purchasedSkins, unlockedLevels, skin: equippedSkin, lastActive: new Date().toISOString()
      });
    } catch (e) { lastSyncedData.current = ''; }
  };

  useEffect(() => {
    if (!firebaseUser || !userInfoRef.current || screen === 'ADMIN' || !isSyncActiveRef.current) return;
    const currentData = JSON.stringify({
      points: userPoints, level: currentLevel, streak, streakMax, uid: firebaseUser.uid,
      unlockedCount: unlockedLevels.length, unlockedLast: (unlockedLevels.length > 0) ? unlockedLevels[unlockedLevels.length - 1] : 0,
      phrasesLen: JSON.stringify(myPhrases).length, notesLen: JSON.stringify(incorrectNotes).length
    });
    if (currentData === lastSyncedData.current) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => { syncToFirestore(currentData); }, 1000 * 60 * 10); 
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [userPoints, currentLevel, streak, streakMax, firebaseUser, equippedSkin, purchasedSkins, unlockedLevels, incorrectNotes, myPhrases]);

  useEffect(() => {
    if (syncTimerRef.current && firebaseUser && isSyncActiveRef.current) {
        clearTimeout(syncTimerRef.current);
        const currentData = JSON.stringify({
            points: userPoints, level: currentLevel, streak, streakMax, uid: firebaseUser.uid,
            unlockedCount: unlockedLevels.length, unlockedLast: (unlockedLevels.length > 0) ? unlockedLevels[unlockedLevels.length - 1] : 0,
            phrasesLen: JSON.stringify(myPhrases).length, notesLen: JSON.stringify(incorrectNotes).length
        });
        syncToFirestore(currentData);
    }
  }, [screen]);

  useEffect(() => {
    const handlePause = () => {
      pauseMainBGM();
      if (firebaseUser) { setUserOffline(firebaseUser.uid); if (waitingRoomIdRef.current) cancelChatRequest(waitingRoomIdRef.current).catch(() => { }); }
    };
    const handleResume = () => { if (settings.bgm && screen === 'HOME') playMainBGM(); };
    CapApp.addListener('pause', handlePause);
    CapApp.addListener('resume', handleResume);
    return () => {
      CapApp.removeAllListeners();
      if (firebaseUser) { setUserOffline(firebaseUser.uid); if (waitingRoomIdRef.current) cancelChatRequest(waitingRoomIdRef.current).catch(() => { }); }
    };
  }, [firebaseUser, settings.bgm]);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    if (!checkBreaker('App_UserProfile')) return;
    const unsub = listenToUserByUid(uid, (profile: any, hasPendingWrites: any) => {
      if (profile && !hasPendingWrites) {
        setUserInfo({ ...profile, isAdmin: profile.isAdmin || firebaseUser?.email === 'idouhak1@gmail.com' });
        if (profile.points !== undefined) setUserPoints((prev: number) => Math.max(prev, profile.points));
        if (profile.level !== undefined) setCurrentLevel((prev: number) => Math.max(prev, profile.level));
        if (profile.unlockedLevels) setUnlockedLevels((p: number[]) => [...new Set([...p, ...profile.unlockedLevels])].sort((a,b)=>a-b));
        if (profile.purchasedSkins) setPurchasedSkins(profile.purchasedSkins);
        if (profile.skin) setEquippedSkin(profile.skin);
        if (profile.isPremium !== undefined) setIsPremium(profile.isPremium);
        if (profile.notes) { try { setIncorrectNotes(JSON.parse(profile.notes)); } catch (e) { } }
        if (profile.myPhrases) { try { setMyPhrases(JSON.parse(profile.myPhrases)); } catch (e) { } }
        setIsBanned(profile.status === 'banned');
      }
    });
    return () => unsub();
  }, [firebaseUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const today = new Date().toDateString();
      const last = localStorage.getItem('vq_guide_last_date');
      const count = parseInt(localStorage.getItem('vq_guide_day_count') || '0');
      if (count >= 7 || last === today) return;
      setShowDailyGuide(true);
      localStorage.setItem('vq_guide_last_date', today);
      localStorage.setItem('vq_guide_day_count', String(count + 1));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid || !isSyncActiveRef.current) return;
    import('./userService').then(m => m.updateHeartbeat(firebaseUser.uid));
    const interval = setInterval(() => { import('./userService').then(m => m.updateHeartbeat(firebaseUser.uid)); }, 60000);
    return () => clearInterval(interval);
  }, [firebaseUser?.uid]);

  useEffect(() => {
    const handleForceSync = () => {
      if (firebaseUser?.uid && isSyncActiveRef.current) {
        const data = JSON.stringify({ points: userPoints, level: currentLevel, notes: JSON.stringify(incorrectNotes), phrases: JSON.stringify(myPhrases) });
        syncToFirestore(data);
      }
    };
    window.addEventListener('voca_sync_checkpoint', handleForceSync);
    return () => window.removeEventListener('voca_sync_checkpoint', handleForceSync);
  }, [firebaseUser?.uid, userPoints, currentLevel, unlockedLevels, incorrectNotes, myPhrases]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const unreadCount = userInfo?.unreadCommunityNotif || 0;
      try {
        WidgetPlugin.updateWidgetData({ streak: streak, unreadNotifs: unreadCount }).catch(e => console.log('Widget error:', e));
      } catch (e) {
        console.log('Widget setup error:', e);
      }
    }
  }, [streak, userInfo?.unreadCommunityNotif]);

  useEffect(() => {
    const handleShowWidgetPromo = () => setShowWidgetPromo(true);
    window.addEventListener('vq_show_widget_promo', handleShowWidgetPromo);
    return () => window.removeEventListener('vq_show_widget_promo', handleShowWidgetPromo);
  }, []);

  const renderContent = () => {
    if (isBanned) return <BannedScreen lang={settings.lang} />;

    switch (screen) {
      case 'SPLASH': return <SplashScreen settings={settings} setScreen={setScreen} />;
      case 'LOGIN': return <LoginScreen settings={settings} setScreen={setScreen} />;
      case 'ONBOARDING': return <OnboardingScreen settings={settings} setSettings={setSettings} setScreen={setScreen} userInfo={userInfo} setUserInfo={setUserInfo} setCurrentLevel={setCurrentLevel} setUnlockedLevels={setUnlockedLevels} firebaseUser={firebaseUser} />;
      case 'HOME': return <HomeScreen settings={settings} setScreen={setScreen} userPoints={userPoints} setUserPoints={setUserPoints} streak={streak} streakMax={streakMax} todayDone={todayDone} userInfo={userInfo} currentLevel={currentLevel} equippedSkin={equippedSkin} isPremium={isPremium} setActiveStudyLevel={setActiveStudyLevel} setAiReportMode={setAiReportMode} />;
      case 'STUDY_LEVEL': return <StudyLevelScreen settings={settings} setScreen={setScreen} userPoints={userPoints} setUserPoints={setUserPoints} unlockedLevels={unlockedLevels} setUnlockedLevels={setUnlockedLevels} isPremium={isPremium} setActiveStudyLevel={setActiveStudyLevel} />;
      case 'QUIZ': return (
        <QuizScreen settings={settings} setScreen={setScreen} currentLevel={activeStudyLevel} setCurrentLevel={setCurrentLevel} setUserPoints={setUserPoints} setIncorrectNotes={setIncorrectNotes} userInfo={userInfo} equippedSkin={equippedSkin} onActivityDone={handleActivityDone} triggerReview={triggerReviewIfReady} vocaDB={mergedVocaDB} setCorrectCount={setCorrectCount} setTotalQuestions={setTotalQuestions} setTimeTaken={setTimeTaken} setRecordedVideoUrl={setRecordedVideoUrl} />
      );
      case 'EVAL': return (
        <EvalScreen settings={settings} setScreen={setScreen} correctCount={correctCount} total={totalQuestions} totalTimeTaken={timeTaken} currentLevel={activeStudyLevel} setCurrentLevel={setCurrentLevel} setUnlockedLevels={setUnlockedLevels} setUserPoints={setUserPoints} recordedVideoUrl={recordedVideoUrl} onActivityDone={handleActivityDone} triggerReview={triggerReviewIfReady} setActiveStudyLevel={setActiveStudyLevel} />
      );
      case 'REVIEW': return (
        <ReviewScreen settings={settings} setScreen={setScreen} incorrectNotes={incorrectNotes} setIncorrectNotes={setIncorrectNotes} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('general')} isPremium={isPremium} setShowApiModal={setShowApiModal} />
      );
      case 'STORE': return <StoreScreen settings={settings} setScreen={setScreen} userPoints={userPoints} setUserPoints={setUserPoints} purchasedSkins={purchasedSkins} setPurchasedSkins={setPurchasedSkins} equippedSkin={equippedSkin} setEquippedSkin={setEquippedSkin} setIsPremium={setIsPremium} isPremium={isPremium} />;
      case 'STATS': return <StatsScreen settings={settings} setScreen={setScreen} userInfo={userInfo} />;
      case 'SETTINGS': return <SettingsScreen setScreen={setScreen} settings={settings} setSettings={setSettings} streak={streak} streakMax={streakMax} userInfo={userInfo} />;
      case 'PROFILE': return <ProfileScreen settings={settings} setScreen={setScreen} userPoints={userPoints} currentLevel={currentLevel} equippedSkin={equippedSkin} userInfo={userInfo} firebaseUser={firebaseUser} isPremium={isPremium} setLegalDocInfo={setLegalDocInfo} setFeedbackInfo={setFeedbackInfo} />;
      case 'MASTERY': return <MasteryListScreen settings={settings} setScreen={setScreen} userPoints={userPoints} unlockedLevels={unlockedLevels} currentLevel={currentLevel} setActiveStudyLevel={setActiveStudyLevel} />;
      case 'STUDY': return <StudyModeScreen settings={settings} setScreen={setScreen} activeStudyLevel={activeStudyLevel} words={mergedVocaDB.find(v => v.level === activeStudyLevel)?.words || []} />;
      case 'ARCADE':
      case 'MINIGAME': return <ArcadeScreen settings={settings} setScreen={setScreen} userPoints={userPoints} setUserPoints={setUserPoints} onActivityDone={handleActivityDone} vocaDB={mergedVocaDB} playSound={playSound} />;
      case 'DICTIONARY': return <DictionaryScreen settings={settings} setScreen={setScreen} setIncorrectNotes={setIncorrectNotes} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('general')} isPremium={isPremium} setShowApiModal={setShowApiModal} setShowQuotaModal={setShowQuotaModal} />;
      case 'BIBLE': return <BibleScreen settings={settings} setScreen={setScreen} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('general')} isPremium={isPremium} setShowApiModal={setShowApiModal} />;
      case 'MY_PHRASES': return <MyPhraseScreen settings={settings} setScreen={setScreen} phrases={myPhrases} setPhrases={setMyPhrases} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('general')} isPremium={isPremium} setShowApiModal={setShowApiModal} setShowQuotaModal={setShowQuotaModal} />;
      case 'AI_REPORT': return <AiReportScreen settings={settings} setScreen={setScreen} prevScreen={prevScreen} userInfo={userInfo} incorrectNotes={incorrectNotes} setIncorrectNotes={setIncorrectNotes} setMyPhrases={setMyPhrases} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('report')} commitReportUsage={commitReportUsage} reportUsage={reportUsage} activeScenario={activeScenario} convLevel={convLevel} mode={aiReportMode} setShowApiModal={setShowApiModal} />;
      case 'CONVERSATION_LIST': return <ConversationListScreen settings={settings} setScreen={setScreen} setActiveScenario={setActiveScenario} convLevel={convLevel} setConvLevel={setConvLevel} setAiReportMode={setAiReportMode} />;
      case 'CONVERSATION': return activeScenario ? (
        <ConversationScreen settings={settings} setScreen={setScreen} activeScenario={activeScenario} convLevel={convLevel} incrementAiUsage={() => incrementAiUsage('general')} aiUsage={aiUsage} isPremium={isPremium} myPhrases={myPhrases} setMyPhrases={setMyPhrases} incorrectNotes={incorrectNotes} setIncorrectNotes={setIncorrectNotes} setAiReportMode={setAiReportMode} setShowApiModal={setShowApiModal} />
      ) : null;
      case 'BATTLE': return (
        <BattleScreen settings={settings} setScreen={setScreen} userLevel={currentLevel} userPoints={userPoints} setUserPoints={setUserPoints} equippedSkin={equippedSkin} userInfo={userInfo} firebaseUser={firebaseUser} vocaDB={mergedVocaDB || []} playSound={playSound} logActivity={logActivity} isPremium={isPremium} />
      );
      case 'LEVEL_TEST': return <LevelTestContainer settings={settings} setScreen={setScreen} />;
      case 'LIVE_CHAT': return (
        <LiveChatScreen settings={settings} setScreen={setScreen} userInfo={userInfo} firebaseUser={firebaseUser} equippedSkin={equippedSkin} setMyPhrases={setMyPhrases} aiUsage={aiUsage} incrementAiUsage={() => incrementAiUsage('general')} isPremium={isPremium} onRoomCreated={(roomId: string | null) => setWaitingRoomId(roomId)} waitingRoomId={waitingRoomId} playSound={playSound} setLegalDocInfo={setLegalDocInfo} setShowApiModal={setShowApiModal} />
      );
      case 'LEGAL': return legalDocInfo ? <LegalDocumentScreen docId={legalDocInfo.id} title={legalDocInfo.title} settings={settings} onBack={() => setScreen('PROFILE')} /> : null;
      case 'FEEDBACK': return <FeedbackScreen settings={settings} userInfo={userInfo} onBack={() => setScreen('PROFILE')} initialType={feedbackInfo?.type} />;
      case 'ABOUT': return <AboutScreen lang={settings.lang} setScreen={setScreen} />;
      case 'COMMUNITY': return <CommunityScreen lang={settings.lang} firebaseUser={firebaseUser} setScreen={setScreen} />;
      case 'SUCCESS': return <SuccessStoriesScreen lang={settings.lang} setScreen={setScreen} />;
      case 'CAREERS': return <CareersScreen lang={settings.lang} setScreen={setScreen} />;
      case 'CONTENTS': return <ContentIntroScreen lang={settings.lang} setScreen={setScreen} setAiReportMode={setAiReportMode} setActiveStudyLevel={setActiveStudyLevel} currentLevel={currentLevel} />;
      case 'EXPERT': return <ExpertConsultationScreen lang={settings.lang} setScreen={setScreen} />;
      case 'ADMIN': return <AdminDashboardScreen setScreen={setScreen} />;
      default: return null;
    }
  };

  if (isPcView && !['LOGIN', 'SPLASH', 'ONBOARDING'].includes(screen)) {
    return (
      <div className="w-full min-h-screen bg-slate-50 font-sans flex flex-col">
        <PcHeader screen={screen} setScreen={setScreen} lang={settings.lang} userPoints={userPoints} />
        <main className="flex-1 relative pt-16 w-full">
          {screen === 'HOME' ? (
            <div className="animate-fade-in w-full">
              <PcHero lang={settings.lang} onStart={() => setScreen('CONVERSATION_LIST')} />
              <PcFeaturesDetailed lang={settings.lang} />
              <PcStats lang={settings.lang} />
              <div className="max-w-[1400px] mx-auto w-full px-8 py-20 flex flex-col xl:flex-row gap-12 justify-center">
                {/* Sidebar - desktop only */}
                <aside className="hidden xl:block w-80 shrink-0 space-y-10">
                  <PcLeaderboard lang={settings.lang} />
                  <PcAdSlot className="h-[600px]" />
                </aside>

                <div className="flex-1 flex flex-col gap-10">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 space-y-6">
                      <h3 className="text-4xl font-black leading-tight">{t(settings.lang, 'today_recommend_label')}</h3>
                      <p className="text-indigo-100 text-lg font-medium max-w-xl">{t(settings.lang, 'today_recommend_desc')}</p>
                      <button onClick={() => setScreen('MASTERY')} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center gap-2">
                        {t(settings.lang, 'start_mastery_btn')} <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                  <PcModuleGrid setScreen={setScreen} lang={settings.lang} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PcAdSlot className="h-40" />
                    <PcAdSlot className="h-40" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="max-w-[1400px] mx-auto w-full px-8 py-20 flex flex-col xl:flex-row gap-12">
                <aside className="hidden xl:block w-80 shrink-0 space-y-10">
                  <PcLeaderboard lang={settings.lang} />
                  <PcAdSlot className="h-[600px]" />
                </aside>
                <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-xl p-10 min-h-[70vh] flex flex-col relative overflow-hidden">
                  {renderContent()}
                </div>
              </div>
              <div className="max-w-[1400px] mx-auto w-full px-8 pb-20">
                <PcAdSlot variant="horizontal" />
              </div>
            </>
          )}
          <PcFooter 
            lang={settings.lang} 
            onNavigateLegal={(id, title) => { setLegalDocInfo({ id, title }); setScreen('LEGAL'); }} 
            setScreen={setScreen}
          />
        </main>
        {showQuotaModal && <AiQuotaModal settings={settings} onClose={() => setShowQuotaModal(false)} onGoPremium={() => { setShowQuotaModal(false); setShowPaywall(true); }} onEnterKey={() => { setShowQuotaModal(false); setShowApiModal(true); }} onPressGuide={() => { setShowQuotaModal(false); setShowApiModal(true); }} />}
        {showApiModal && <ApiKeyModal settings={settings} onClose={() => setShowApiModal(false)} isPremium={isPremium} />}
        {showReview && <ReviewPrompt lang={settings.lang} onClose={() => setShowReview(false)} onNavigateFeedback={() => setScreen('FEEDBACK')} isPremium={isPremium} />}
      </div>
    );
  }

  const platform = Capacitor.getPlatform();
  const isIOS = platform === 'ios';
  const showAds = platform !== 'web' && !isPremium;

  return (
    <div className={`app-container ${isIOS ? 'ios-safe-area' : ''}`}>
      <OfflineBanner />
      {screen === 'HOME' && <NoticeBanner lang={settings.lang} setScreen={setScreen} />}
      <div 
        className="content-area flex flex-col" 
        style={{ 
          flex: 1, 
          position: 'relative', 
          overflowY: 'auto',
          paddingBottom: ['HOME', 'STATS', 'PROFILE', 'STORE', 'SETTINGS', 'CONVERSATION_LIST', 'BIBLE', 'EVAL', 'STUDY_LEVEL'].includes(screen) ? 'var(--nav-height)' : '0px', 
          marginBottom: showAds ? 'calc(var(--ad-height) + var(--safe-area-bottom))' : '0px'
        }}
      >
        {renderContent()}
      </div>
      {['HOME', 'STATS', 'PROFILE', 'STORE', 'SETTINGS', 'CONVERSATION_LIST', 'BIBLE'].includes(screen) && (platform !== 'web' || screen === 'HOME') && (
          <div style={{ bottom: showAds ? 'calc(var(--ad-height) + var(--safe-area-bottom))' : 'var(--safe-area-bottom)', position: 'absolute', width: '100%', left: 0, zIndex: 50 }}>
            <BottomNav screen={screen} setScreen={setScreen} settings={settings} setAiReportMode={setAiReportMode} />
          </div>
        )
      }
      <PaywallPopup isVisible={showPaywall} onClose={() => setShowPaywall(false)} setIsPremium={setIsPremium} settings={settings} />
      <WidgetInstallPopup isVisible={showWidgetPromo} onClose={() => setShowWidgetPromo(false)} settings={settings} />
      {showDailyGuide && <DailyGuidePopup onClose={() => setShowDailyGuide(false)} setScreen={setScreen} settings={settings} streak={streak} />}
      {showReview && <ReviewPrompt lang={settings.lang} onClose={() => setShowReview(false)} onNavigateFeedback={() => setScreen('FEEDBACK')} isPremium={isPremium} />}
      {showQuotaModal && <AiQuotaModal settings={settings} onClose={() => setShowQuotaModal(false)} onGoPremium={() => { setShowQuotaModal(false); setShowPaywall(true); }} onEnterKey={() => { setShowQuotaModal(false); setShowApiModal(true); }} onPressGuide={() => { setShowQuotaModal(false); setShowApiModal(true); }} />}
      {showApiModal && <ApiKeyModal settings={settings} onClose={() => setShowApiModal(false)} isPremium={isPremium} />}
    </div>
  );
}

function BannedScreen({ lang }: { lang: string }) {
    return (
        <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center p-10 text-center space-y-8">
            <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-red-500/40 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3Z"/><path d="m18 13-1.5-7.5L4 2l3.5 11.5L11 15l7-2Z"/><path d="m8 14 3-3"/></svg>
            </div>
            <div className="space-y-4">
                <h1 className="text-4xl font-black text-white italic tracking-tighter">{t(lang, 'banned_title')}</h1>
                <p className="text-slate-400 font-bold leading-relaxed max-w-xs mx-auto">{t(lang, 'banned_desc')}<br/><br/><span className="text-xs uppercase tracking-widest text-slate-500">{t(lang, 'banned_support')}</span></p>
            </div>
            <button onClick={() => window.location.reload()} className="px-10 py-5 bg-white text-slate-900 rounded-[28px] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">{t(lang, 'banned_recheck')}</button>
        </div>
    );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <MainApp />
    </GlobalErrorBoundary>
  );
}
