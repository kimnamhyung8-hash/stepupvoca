import React, { useState } from 'react';
import {
    Target,
    User
} from 'lucide-react';
import { t as globalT } from '../i18n';
import { upsertUser } from '../userService';

interface OnboardingScreenProps {
    settings: any;
    setSettings: (s: any) => void;
    setScreen: (s: string) => void;
    userInfo: any;
    setUserInfo: (u: any) => void;
    setCurrentLevel: (l: number) => void;
    setUnlockedLevels: (l: any) => void;
    firebaseUser: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    settings,
    setSettings,
    setScreen,
    userInfo,
    setUserInfo,
    setCurrentLevel,
    setUnlockedLevels,
    firebaseUser }) => {
    const lang = settings.lang || 'ko';
    const t = (key: string) => globalT(lang, key) || key;

    const [step, setStep] = useState(0);
    const [nickname, setNickname] = useState(userInfo?.nickname || '');
    const [isSyncing, setIsSyncing] = useState(false);

    const steps = [
        'onboarding_language',
        'onboarding_personal',
        'onboarding_profile'
    ];

    const goToProfileStep = () => {
        setStep(2);
    };

    const handleLanguageSelect = (code: string) => {
        setSettings({ ...settings, lang: code });
        setTimeout(() => setStep(1), 300);
    };


    const getInitialLevel = () => {
        return { level: "A1", label: t('level_beginner'), emoji: "🌱", color: "from-blue-400 to-blue-600", startLvl: 1 };
    };

    const handleComplete = async () => {
        setIsSyncing(true);
        const result = getInitialLevel();
        const finalNickname = nickname.trim() || `VocaUser${Math.floor(Math.random() * 9999)}`;
        const finalUserInfo = { ...(userInfo || {}), nickname: finalNickname, engLevel: result.level };

        try {
            setUserInfo(finalUserInfo);
            setCurrentLevel(result.startLvl);
            setUnlockedLevels([result.startLvl]);

            localStorage.setItem('vq_user', JSON.stringify(finalUserInfo));
            localStorage.setItem('vq_level', result.startLvl.toString());
            localStorage.setItem('vq_unlocked_levels', JSON.stringify([result.startLvl]));

            // ── Firestore Sync ──
            if (firebaseUser?.uid) {
                await upsertUser(firebaseUser.uid, {
                    nickname: finalNickname,
                    level: result.startLvl,
                    engLevel: result.level,
                    age: userInfo?.age || '',
                    purpose: userInfo?.purpose || '',
                    lang: settings.lang,
                    lastActive: new Date().toISOString()
                });
            }

            setScreen('HOME');
        } catch (e) {
            console.error(e);
            setScreen('HOME');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="screen bg-[#F8FAFF] flex flex-col overflow-hidden select-none">
            {step > 0 && (
                <div className="px-5 pt-[calc(env(safe-area-inset-top,16px)+12px)] pb-2 shrink-0">
                     <div className="flex items-center gap-2 mb-2">
                        {steps.map((key, i) => (
                            <div key={i} className={`flex-1 text-center text-[9px] font-black uppercase tracking-widest transition-colors ${i <= step ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {t(key)}
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {step === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8 animate-fade-in">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-float">🚀</div>
                        <h1 className="text-[2rem] font-black text-slate-900 tracking-tighter leading-tight mb-2">VocaQuest</h1>
                        <p className="text-slate-400 font-bold text-sm">Select your language / 언어 선택</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        {[
                            { code: 'ko', label: '한국어', flag: '🇰🇷' },
                            { code: 'ja', label: '日本語', flag: '🇯🇵' },
                            { code: 'zh', label: '简体中文', flag: '🇨🇳' },
                            { code: 'tw', label: '繁體中文', flag: '🇹🇼' },
                            { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
                            { code: 'en', label: 'English', flag: '🇺🇸' }
                        ].map(l => (
                            <button
                                key={l.code}
                                onClick={() => handleLanguageSelect(l.code)}
                                className={`flex items-center gap-3 p-5 rounded-[24px] border-2 font-black text-sm transition-all active:scale-95 shadow-sm hover:shadow-md
                  ${lang === l.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'}`}
                            >
                                <span className="text-2xl">{l.flag}</span>
                                <span>{l.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-12">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🎯</div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            {t('onboarding_intro_title')}
                        </h2>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed">
                            {t('onboarding_intro_desc')}
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-indigo-500" /> {t('age')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: "Under 20s", labelKey: "age_under_20s" },
                                    { id: "20s", labelKey: "age_20s" },
                                    { id: "30s", labelKey: "age_30s" },
                                    { id: "40s", labelKey: "age_40s" },
                                    { id: "50s+", labelKey: "age_50s_plus" }
                                ].map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setUserInfo({ ...(userInfo || {}), age: a.id })}
                                        className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border-2 
                                            ${userInfo?.age === a.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'}`}
                                    >
                                        {t(a.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} className="text-emerald-500" /> {t('purpose')}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "Travel & Daily", labelKey: "purpose_travel" },
                                    { id: "Business", labelKey: "purpose_business" },
                                    { id: "Exams", labelKey: "purpose_exams" },
                                    { id: "Hobby", labelKey: "purpose_hobby" }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setUserInfo({ ...(userInfo || {}), purpose: p.id })}
                                        className={`px-4 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border-2 
                                            ${userInfo?.purpose === p.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'}`}
                                    >
                                        {t(p.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={goToProfileStep}
                        disabled={!userInfo?.age || !userInfo?.purpose}
                        className="w-full mt-10 py-5 rounded-[28px] bg-slate-900 text-white font-black text-lg shadow-[0_6px_0_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-30"
                    >
                        {t('continue_to_nickname') || 'Continue'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="flex-1 flex flex-col p-6 animate-fade-in text-center justify-center">
                    <div className={`w-32 h-32 bg-gradient-to-br ${getInitialLevel().color} rounded-[40px] flex items-center justify-center text-6xl shadow-2xl mx-auto mb-8 animate-bounce`}>
                        {getInitialLevel().emoji}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                        {t('almost_there') || 'Almost There!'}
                    </h2>
                    <p className="text-slate-400 font-bold mb-8">
                        {t('onboarding_final_desc') || 'Enter your nickname to start the quest.'}
                    </p>

                    <div className="space-y-4 text-left max-w-xs mx-auto w-full">
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nickname</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                placeholder={t('placeholder_nickname')}
                                className="w-full font-black text-lg text-slate-800 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={isSyncing}
                        className="w-full mt-10 py-5 rounded-[28px] bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
                    >
                        {isSyncing ? t('syncing') : t('get_started')}
                    </button>
                </div>
            )}
        </div>
    );
};