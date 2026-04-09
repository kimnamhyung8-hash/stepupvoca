import React, { useState } from 'react';
import {
    Flame,
    Coins,
    Bot,
    CheckCircle2,
    Trophy,
    Sparkles,
    Crown,
    PlayCircle,
    Ban,
    ChevronDown
} from 'lucide-react';
import { t } from '../i18n';
import { Capacitor } from '@capacitor/core';
import { showRewardedInterstitialAd, grantAdFreePass } from '../admob';
import { PurposeSelectionModal } from '../components/PurposeSelectionModal';
import { CommunityBanner } from '../components/home/HomeButtons';
import { LearningHomeView, TravelHomeView, BusinessHomeView, CommHomeView, TestingHomeView } from '../components/home/HomeViews';

interface HomeScreenProps {
    settings: { lang?: string; [key: string]: unknown };
    setScreen: (s: string) => void;
    userPoints: number;
    setUserPoints: React.Dispatch<React.SetStateAction<number>>;
    streak: number;
    streakMax: number;
    todayDone: boolean;
    userInfo: { nickname?: string; [key: string]: unknown } | null;
    currentLevel: number;
    equippedSkin: string;
    isPremium?: boolean;
    setActiveStudyLevel: (idx: number) => void;
    setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
    appPurpose?: string;
    setAppPurpose?: (s: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    settings,
    setScreen,
    userPoints,
    setUserPoints: _setUserPoints,
    streak,
    streakMax,
    todayDone,
    userInfo,
    currentLevel,
    equippedSkin,
    isPremium = false,
    setActiveStudyLevel,
    setAiReportMode,
    appPurpose,
    setAppPurpose
}) => {
    const lang = settings.lang || 'ko';
    const [isRolling, setIsRolling] = useState(false);
    const [showPurposeModal, setShowPurposeModal] = useState(!appPurpose);

    const skins: Record<string, { emoji: string; special?: string }> = {
        default: { emoji: '🐣' },
        ninja: { emoji: '🥷' },
        wizard: { emoji: '🧙‍♂️', special: 'animate-float' },
        king: { emoji: '👑', special: 'animate-float' },
        dragon: { emoji: '🐉', special: 'animate-float premium-shine' },
        alien: { emoji: '👽', special: 'animate-pulse' },
        robot: { emoji: '🤖', special: 'animate-pulse' },
        vampire: { emoji: '🧛', special: 'animate-float' },
        hero: { emoji: '🦸‍♂️', special: 'animate-float' },
        ghost: { emoji: '👻', special: 'animate-float opacity-80' },
        tiger: { emoji: '🐯', special: 'animate-pulse' },
        unicorn: { emoji: '🦄', special: 'animate-float premium-shine' },
        devil: { emoji: '😈', special: 'animate-float' },
        angel: { emoji: '😇', special: 'animate-float premium-shine' },
        cat: { emoji: '🐱' },
        dog: { emoji: '🐶' }
    };

    const skinData = skins[equippedSkin] || skins.default;
    const collectedWords = 20; 
    const unmemorizedWords = 0;

    const handleSelectPurpose = (p: string) => {
        if (setAppPurpose) setAppPurpose(p);
        setShowPurposeModal(false);
    };

    const purposeNameMap: Record<string, string> = {
        LEARNING: '📚 ' + (lang === 'ko' ? '집중 단어 학습' : 'Focused Learning'),
        TRAVEL: '✈️ ' + (lang === 'ko' ? '해외 여행 준비' : 'Travel Prep'),
        BUSINESS: '💼 ' + (lang === 'ko' ? '비즈니스 / 직무' : 'Business / Career'),
        COMMUNICATION: '🗣️ ' + (lang === 'ko' ? '자연스러운 회화' : 'Communication'),
        TESTING: '📊 ' + (lang === 'ko' ? '내 실력 점검' : 'Level Testing')
    };

    const renderSelectedView = () => {
        const pProps = { lang, setScreen, currentLevel, setActiveStudyLevel, setAiReportMode };
        switch(appPurpose) {
            case 'TRAVEL': return <TravelHomeView {...pProps} />;
            case 'BUSINESS': return <BusinessHomeView {...pProps} />;
            case 'COMMUNICATION': return <CommHomeView {...pProps} />;
            case 'TESTING': return <TestingHomeView {...pProps} />;
            case 'LEARNING':
            default:
                return <LearningHomeView {...pProps} />;
        }
    };

    return (
        <div className="screen bg-[#F8FAFF] flex flex-col font-sans select-none overflow-hidden h-full relative">
            <header className="flex items-center justify-between px-4 py-1.5 bg-white sticky top-0 z-20 transition-all border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[#1E293B] tracking-tight">VocaQuest</h1>
                        <span className="text-[8px] font-bold text-slate-400 block -mt-1 opacity-60">v1.8.5</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                    <div className="flex items-center gap-1 bg-[#FFF7ED] px-2 py-1 rounded-xl border border-orange-100 shadow-sm">
                        <Flame size={12} className="text-[#FF6B35]" fill="#FF6B35" />
                        <span className="text-xs font-black text-orange-700">{streak}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FFFBEB] px-2.5 py-1.5 rounded-xl border border-amber-100 shadow-sm font-black">
                        <Coins size={14} className="text-amber-500" />
                        <span className="text-sm font-black text-amber-700">{userPoints.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-24 px-6 space-y-6">
                
                {/* Purpose Switcher */}
                <div 
                    className="mt-4 flex justify-between items-center bg-white p-2 pl-5 pr-2 rounded-[24px] border border-indigo-100 shadow-sm cursor-pointer active:scale-95 transition-all outline outline-4 outline-indigo-50/50" 
                    onClick={() => setShowPurposeModal(true)}
                >
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">{lang === 'ko' ? '현재 모드' : 'MODE'}</span>
                        <span className="text-[15px] font-black text-indigo-900 tracking-tight">{purposeNameMap[appPurpose || 'LEARNING']}</span>
                    </div>
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors">
                        <ChevronDown size={18} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 relative">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Flame size={32} className="text-[#FF6B35]" fill="#FF6B35" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-[15px] leading-tight truncate">
                            {todayDone ? t(lang, 'streak_active', { n: streak }) : t(lang, 'streak_warning', { n: streak })}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold mt-1">
                            {t(lang, 'streak_max_record', { n: streakMax })} <Trophy size={10} className="text-amber-500" />
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${todayDone ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="flex flex-col items-center pt-2 animate-fade-in transition-all">
                    <div className="relative mb-4">
                        <div className={`w-36 h-36 bg-white rounded-full flex items-center justify-center text-8xl shadow-xl shadow-slate-200/50 border-4 border-white overflow-hidden ${skinData.special?.includes('premium-shine') ? 'premium-shine' : ''}`}>
                            <span className={skinData.special || ''}>
                                {skinData.emoji}
                            </span>
                        </div>
                        {isPremium && (
                            <div className="absolute -top-3 -left-3 animate-crown-float z-10">
                                <div className="relative premium-glow">
                                    <div className="bg-amber-400 p-2.5 rounded-2xl shadow-lg border-2 border-white crown-shine-effect">
                                        <Crown size={24} className="text-white fill-white" />
                                    </div>
                                    <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-[#FFD700] border-4 border-white text-[#854D0E] text-[12px] font-black px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1 transform translate-x-3 translate-y-1">
                            <span className="text-[10px] opacity-70">LV</span>
                            <span>{Math.max(0, currentLevel - 1)}</span>
                        </div>
                    </div>

                    <h2 className="text-[32px] font-black text-[#1E293B] tracking-tight leading-tight mb-2">
                        {userInfo?.nickname || t(lang, 'guest')}
                    </h2>
                    <p className="text-slate-400 font-bold text-[13px] tracking-wide">
                        {t(lang, 'home_stats_label', { collected: collectedWords, weak: unmemorizedWords })}
                    </p>
                </div>

                <div className="space-y-5 border-t border-slate-100 pt-6 mt-6">
                    {/* Monetization / Reward Quick Actions */}
                    {Capacitor.isNativePlatform() && !isPremium && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button 
                                onClick={async () => {
                                    if (isRolling) return;
                                    setIsRolling(true);
                                    try {
                                        const reward = await showRewardedInterstitialAd();
                                        if (reward) {
                                            _setUserPoints((p: number) => p + 500);
                                            alert(t(lang, 'ad_complete'));
                                        }
                                    } finally {
                                        setIsRolling(false);
                                    }
                                }}
                                className="bg-indigo-50 border border-indigo-100 p-4 rounded-[28px] flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-center"
                            >
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500">
                                    <PlayCircle size={24} />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-black tracking-tight text-slate-800">{lang === 'ko' ? '광고 보고 500P' : 'Watch Ad'}</span>
                                    <span className="block text-sm font-black text-indigo-600">+500P</span>
                                </div>
                            </button>

                            <button 
                                onClick={() => {
                                    if (userPoints < 2000) {
                                        alert(t(lang, 'not_enough_points'));
                                        return;
                                    }
                                    if (window.confirm(t(lang, 'confirm_buy_ad_free') || 'Spend 2000P to study ad-free for 1 hr?')) {
                                        _setUserPoints(p => p - 2000);
                                        grantAdFreePass(1);
                                        alert(t(lang, 'ad_free_hour_btn') + ' Activated!');
                                    }
                                }}
                                className="bg-rose-50 border border-rose-100 p-4 rounded-[28px] flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-center"
                            >
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500">
                                    <Ban size={24} />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-black tracking-tight text-slate-800">{lang === 'ko' ? '1시간 광고 제거' : '1Hr Ad Free'}</span>
                                    <span className="block text-sm font-black text-rose-600">-2,000P</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Global Community prominently displayed across all Views */}
                    <CommunityBanner lang={lang} setScreen={setScreen} />

                    {/* Dynamic Purpose View */}
                    <div className="pt-2">
                        {renderSelectedView()}
                    </div>
                </div>
            </div>

            {showPurposeModal && (
                <PurposeSelectionModal 
                    lang={lang} 
                    onSelect={handleSelectPurpose} 
                    onClose={() => { if (appPurpose) setShowPurposeModal(false); }} 
                    canClose={!!appPurpose} 
                />
            )}
        </div>
    );
};
