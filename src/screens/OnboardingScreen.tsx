import React, { useState, useEffect } from 'react';
import {
    Target,
    User,
    ChevronRight,
    Sparkles
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

const slides = [
    {
        image: '/onboarding/slide1.jpg',
        title: "언제까지 통째로 외우시겠어요?",
        desc: "찍어낸 교재, 나와 무관한 단어 암기는 이제 그만두세요."
    },
    {
        image: '/onboarding/slide2.jpg',
        title: "내가 하고 싶은 말, 바로 지금",
        desc: "초 개인화! 내가 필요한 문장만 실시간으로 대화하고 확인해보세요."
    },
    {
        image: '/onboarding/slide3.jpg',
        title: "무한 반복으로 자연스럽게",
        desc: "자기 전, 저장된 나만의 문장들을 수면 학습하듯 무한 반복 플레이하세요."
    },
    {
        image: '/onboarding/slide4.jpg',
        title: "3개월 후, 당신의 삶",
        desc: "외국인 앞에서도 당당하게 미소 지으며 대화하는 내 모습을 발견하게 될 것입니다."
    }
];

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

    // phase: 'story' (슬라이드쇼) -> 'setup' (폼입력)
    const [phase, setPhase] = useState<'story' | 'setup'>('story');
    const [activeSlide, setActiveSlide] = useState(0);

    // Setup 상태
    const [setupStep, setSetupStep] = useState(0); 
    const [nickname, setNickname] = useState(userInfo?.nickname || '');
    const [isSyncing, setIsSyncing] = useState(false);

    // 자동 슬라이더 기능
    useEffect(() => {
        if (phase !== 'story') return;
        const timer = setInterval(() => {
            setActiveSlide(prev => {
                if (prev === slides.length - 1) return prev; // 마지막에선 멈춤
                return prev + 1;
            });
        }, 3500);
        return () => clearInterval(timer);
    }, [phase]);

    const handleNextSlide = () => {
        if (activeSlide < slides.length - 1) {
            setActiveSlide(prev => prev + 1);
        } else {
            setPhase('setup');
        }
    };

    const handleLanguageSelect = (code: string) => {
        setSettings({ ...settings, lang: code });
        setTimeout(() => setSetupStep(1), 300);
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

    // ──────────────────────── STORY PHASE ──────────────────────── //
    if (phase === 'story') {
        const slide = slides[activeSlide];
        return (
            <div className="relative w-full h-screen bg-[#0F172A] flex flex-col overflow-hidden text-white" onClick={handleNextSlide}>
                {/* 배경 이미지 애니메이션 래퍼 */}
                {slides.map((s, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000"
                            style={{ 
                                backgroundImage: `url(${s.image})`,
                                transform: activeSlide === idx ? 'scale(1.05)' : 'scale(1)',
                            }} 
                        />
                        {/* 그라데이션 오버레이 (텍스트 가독성용) */}
                        <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                    </div>
                ))}

                {/* 텍스트 및 UI 컨테이너 */}
                <div className="relative z-20 flex-1 flex flex-col justify-end p-8 pb-12">
                    {/* 타이포그래피 영역 */}
                    <div className="space-y-4 mb-10 max-w-sm">
                        {/* Title Animation */}
                        <h1 
                            key={`title-${activeSlide}`}
                            className="text-3xl font-black leading-tight tracking-tighter animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300"
                        >
                            {slide.title}
                        </h1>
                        {/* Desc Animation */}
                        <p 
                            key={`desc-${activeSlide}`}
                            className="text-slate-300 font-medium text-[15px] leading-relaxed animate-fade-in-up delay-100"
                        >
                            {slide.desc}
                        </p>
                    </div>

                    {/* Progress Bar & Next Button */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-2">
                            {slides.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`} 
                                />
                            ))}
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-full font-black text-sm transition-all"
                        >
                            {activeSlide === slides.length - 1 ? '시작하기' : '다음'} 
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                `}} />
            </div>
        );
    }

    // ──────────────────────── SETUP PHASE (기존 구조를 빠르고 깔끔하게) ──────────────────────── //
    return (
        <div className="screen bg-slate-50 flex flex-col overflow-hidden select-none">
            {/* 상단 프로그레스 바 영역 */}
            <div className="px-5 pt-[calc(env(safe-area-inset-top,16px)+12px)] pb-2 shrink-0">
                 <div className="flex items-center justify-between px-2 mb-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${setupStep >= 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{t('onboarding_language')}</span>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${setupStep >= 1 ? 'text-indigo-600' : 'text-slate-300'}`}>{t('onboarding_personal')}</span>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${setupStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`}>{t('onboarding_profile')}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(setupStep / 2) * 100}%` }}
                    />
                </div>
            </div>

            {setupStep === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8 animate-fade-in">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🌍</div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Welcome!</h1>
                        <p className="text-slate-400 font-bold text-sm">Select your language</p>
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
                                className="flex items-center gap-3 p-5 rounded-2xl border-2 bg-white border-slate-100 text-slate-700 hover:border-indigo-200 font-black text-sm transition-all active:scale-95 shadow-sm"
                            >
                                <span className="text-2xl">{l.flag}</span>
                                <span>{l.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {setupStep === 1 && (
                <div className="flex-1 flex flex-col p-6 animate-fade-in overflow-y-auto pb-12 max-w-md mx-auto w-full">
                    <div className="text-left mb-8 mt-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                            나에게 딱 맞는<br/>커리큘럼 설계 🎯
                        </h2>
                        <p className="text-slate-500 text-sm font-bold">
                            더 정확한 개인화 문장을 제공하기 위한 단계입니다.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-indigo-500" /> 연령대
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[ "Under 20s", "20s", "30s", "40s", "50s+" ].map(a => (
                                    <button
                                        key={a}
                                        onClick={() => setUserInfo({ ...(userInfo || {}), age: a })}
                                        className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border-2 
                                            ${userInfo?.age === a ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} className="text-emerald-500" /> 주 목적
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "Travel & Daily", label: "여행 및 일상" },
                                    { id: "Business", label: "비즈니스 회화" },
                                    { id: "Exams", label: "시험 (토익/오픽)" },
                                    { id: "Hobby", label: "취미 및 자기계발" }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setUserInfo({ ...(userInfo || {}), purpose: p.id })}
                                        className={`px-4 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border-2 text-left
                                            ${userInfo?.purpose === p.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSetupStep(2)}
                        disabled={!userInfo?.age || !userInfo?.purpose}
                        className="w-full mt-12 py-5 rounded-[24px] bg-slate-900 text-white font-black text-lg shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-[rgba(0,0,0,0.9)] px-8 py-2 bg-[#000] rounded-md transition duration-200 ease-in-out disabled:opacity-30 disabled:scale-100 active:scale-95"
                    >
                        다음으로
                    </button>
                </div>
            )}

            {setupStep === 2 && (
                <div className="flex-1 flex flex-col p-6 animate-fade-in text-center justify-center max-w-sm mx-auto w-full">
                    <div className={`w-32 h-32 bg-gradient-to-br ${getInitialLevel().color} rounded-[40px] flex items-center justify-center text-6xl shadow-2xl mx-auto mb-8 relative`}>
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-[40px] animate-pulse" />
                        <span className="relative z-10">{getInitialLevel().emoji}</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                        준비가 끝났습니다!
                    </h2>
                    <p className="text-slate-400 font-bold mb-8">
                        앱에서 부를 닉네임을 설정해 주세요.
                    </p>

                    <div className="space-y-4 text-left w-full">
                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nickname</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                placeholder="예: 영어마스터"
                                className="w-full font-black text-xl text-slate-800 outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={isSyncing || !nickname.trim()}
                        className="w-full mt-8 py-5 flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg shadow-[0_0_40px_rgba(79,70,229,0.4)] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSyncing ? '처리 중...' : <>내 여정 시작하기 <Sparkles size={18} /></>}
                    </button>
                </div>
            )}
        </div>
    );
};