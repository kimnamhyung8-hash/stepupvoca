import React, { useState } from 'react';
import {
    Flame,
    Coins,
    Zap,
    BookOpen,
    MessageSquare,
    BookMarked,
    Bot,
    CheckCircle2,
    Trophy,
    Sparkles,
    BarChart3,
    Swords,
    Target,
    Globe,
    Crown,
    ArrowRight,
    PlayCircle,
    Ban
} from 'lucide-react';
import { t } from '../i18n';
import { tComm } from '../i18n/communityTranslations';
import { Capacitor } from '@capacitor/core';
import { showRewardedInterstitialAd, grantAdFreePass } from '../admob';


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
    setAiReportMode
}) => {
    const lang = settings.lang || 'ko';
    const [isRolling, setIsRolling] = useState(false);

    const collectedWords = 20; 
    const unmemorizedWords = 0;

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
                <div className="mt-4 bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 relative">
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

                <div className="flex flex-col items-center pt-4 animate-fade-in transition-all">
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

                    <button
                        onClick={() => setScreen('MASTERY')}
                        className="w-full mt-8 bg-[#4F46E5] py-6 rounded-[32px] text-white flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all group"
                    >
                        <Zap size={28} className="fill-white" />
                        <span className="text-2xl font-black">{t(lang, 'start_challenge')}</span>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Monetization / Reward Quick Actions */}
                    {Capacitor.isNativePlatform() && !isPremium && (
                        <div className="grid grid-cols-2 gap-4">
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

                    {/* Moved Community Banner to top */}
                    <button onClick={() => setScreen('COMMUNITY')} className="w-full bg-[#EEF2FF] p-6 rounded-[40px] border border-[#E0E7FF] shadow-xl hover:shadow-indigo-100 active:scale-[0.98] transition-all text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-white text-indigo-600 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg border border-indigo-50 relative group-hover:scale-110 transition-transform">
                                <Globe size={32} />
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-md border-2 border-white animate-bounce">HOT</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-xl text-indigo-900 leading-tight">{tComm(lang, 'hero_title')}</h4>
                                <p className="text-indigo-600/70 text-xs font-bold mt-1 tracking-tight">{tComm(lang, 'hero_desc')}</p>
                            </div>
                            <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </button>

                    {/* Live Chat Banner */}
                    <button onClick={() => setScreen('LIVE_CHAT')} className="w-full bg-teal-50 p-6 rounded-[32px] shadow-sm border border-teal-100 flex items-center gap-4 active:scale-95 transition-all text-left relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/10 group-hover:opacity-100 opacity-0 transition-opacity" />
                        <div className="w-14 h-14 bg-white text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-teal-50 relative">
                            <Globe size={28} />
                            <div className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
                        </div>
                        <div className="flex-1 z-10">
                            <h4 className="font-bold text-[15px] text-slate-800 leading-tight">{tComm(lang, 'live_chat_title')}</h4>
                            <p className="text-teal-600/80 text-xs font-bold mt-1 tracking-tight">{tComm(lang, 'live_chat_desc')}</p>
                        </div>
                        <div className="bg-teal-100/50 text-teal-600 p-2.5 rounded-2xl shadow-sm z-10">
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-5">
                        <button onClick={() => setScreen('CONVERSATION_LIST')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left relative">
                            <div className="w-14 h-14 bg-[#F5F7FF] text-[#6366F1] rounded-2xl flex items-center justify-center border border-indigo-50/50 relative">
                                <MessageSquare size={28} />
                                <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'ai_conversation_title')}</span>
                        </button>
                        <button onClick={() => { setActiveStudyLevel(currentLevel); setScreen('STUDY_LEVEL'); }} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="w-14 h-14 bg-[#F0FDF4] text-[#22C55E] rounded-2xl flex items-center justify-center border border-emerald-50/50">
                                <BookOpen size={28} />
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'study_tab')}</span>
                        </button>
                    </div>

                    <button onClick={() => setScreen('MY_PHRASES')} className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 active:scale-95 transition-all text-left relative">
                        <div className="w-14 h-14 bg-[#FFF7ED] text-[#F97316] rounded-2xl flex items-center justify-center border border-orange-50/50 shrink-0 relative">
                            <BookMarked size={28} />
                            <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
                        </div>
                        <div className="flex-1"><h4 className="font-bold text-[15px] text-slate-800 leading-tight">{t(lang, 'phrase_bible_title')}</h4></div>
                        <div className="px-3 py-1 bg-[#FFEDD5] text-[#9A3412] text-[9px] font-bold rounded-xl shadow-sm italic tracking-tighter">{t(lang, 'new_label')}</div>
                    </button>

                    <div className="grid grid-cols-2 gap-5">
                        <button onClick={() => setScreen('BIBLE')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-[#EFF6FF] text-[#3B82F6] rounded-2xl flex items-center justify-center border border-blue-50/50 relative">
                                    <BookOpen size={28} />
                                    <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
                                </div>
                                <span className="bg-[#3B82F6] text-white text-[8px] font-black px-2 py-1 rounded-full tracking-wider shadow-sm uppercase whitespace-nowrap">CORE 50</span>
                            </div>
                            <h4 className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'bible_title')}</h4>
                        </button>
                        <button onClick={() => setScreen('REVIEW')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="w-14 h-14 bg-[#FAF5FF] text-[#A855F7] rounded-2xl flex items-center justify-center border border-purple-50/50 relative">
                                <BookOpen size={28} />
                                <div className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'review')}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <button onClick={() => setScreen('DICTIONARY')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="relative">
                                <div className="w-14 h-14 bg-[#ECFEFF] text-[#0891B2] rounded-2xl flex items-center justify-center border border-cyan-50/50"><Sparkles size={28} /></div>
                                <div className="absolute -top-1 -right-2 bg-[#22D3EE] text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg tracking-tighter whitespace-nowrap shadow-sm">{t(lang, 'ai_new_label')}</div>
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'ai_dictionary')}</span>
                        </button>
                        <button onClick={() => { setAiReportMode('VOCAB'); setScreen('AI_REPORT'); }} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="relative">
                                <div className="w-14 h-14 bg-[#F5F3FF] text-[#8B5CF6] rounded-2xl flex items-center justify-center border border-purple-50/50 relative">
                                    <BarChart3 size={28} />
                                    <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
                                </div>
                                <div className="absolute -top-2 -left-2 bg-[#FBBF24] text-[#78350F] text-[7px] font-black px-1.5 py-0.5 rounded-lg tracking-tighter shadow-sm border border-white">PRO</div>
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'ai_report_title')}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <button onClick={() => setScreen('BATTLE')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="relative">
                                <div className="w-14 h-14 bg-[#FFF1F2] text-[#E11D48] rounded-2xl flex items-center justify-center border border-rose-50/50"><Swords size={28} /></div>
                                <div className="absolute top-0 -right-2 bg-[#F43F5E] text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg tracking-tighter shadow-sm">{t(lang, 'live_label')}</div>
                            </div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'battle_title')}</span>
                        </button>
                        <button onClick={() => setScreen('MINIGAME')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
                            <div className="w-14 h-14 bg-[#FFFBEB] text-[#D97706] rounded-2xl flex items-center justify-center border border-amber-50/50"><Target size={28} /></div>
                            <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'defender_title')}</span>
                        </button>
                    </div>



                    <button onClick={() => setScreen('LEVEL_TEST')} className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-1 rounded-[40px] shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-5 pr-8">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center m-1 shadow-inner outline outline-1 outline-white/20"><BarChart3 size={28} className="text-white" /></div>
                            <div className="flex-1 text-center">
                                <h4 className="text-white font-bold text-lg tracking-tight">{t(lang, 'level_test_title')}</h4>
                                <p className="text-white/70 font-bold text-[10px] mt-0.5 tracking-wider uppercase italic">{t(lang, 'level_test_desc_short')}</p>
                            </div>
                        </div>
                    </button>


                </div>
            </div>

        </div>
    );
};
