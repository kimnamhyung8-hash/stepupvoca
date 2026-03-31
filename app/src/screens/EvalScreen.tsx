import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Play, Video, Download, Target, Zap, Coins, 
    Instagram, Youtube, Facebook, Mail, Sparkles, 
    BookOpen, ChevronRight
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { t } from '../i18n';
import { showAdIfFree } from '../admob';
import { logActivity, loadStreak } from '../streak';
import { CEFR_MAPPING } from '../constants/appConstants';
import { getCefrFromLevel } from '../utils/wordUtils';

interface EvalScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    correctCount: number;
    total: number;
    totalTimeTaken: number;
    currentLevel: number;
    setCurrentLevel: any;
    setUnlockedLevels: any;
    setUserPoints: any;
    recordedVideoUrl: string | null;
    onActivityDone?: () => void;
    triggerReview?: () => void;
    setActiveStudyLevel: (lvl: number) => void;
}

export const EvalScreen = ({
    settings,
    setScreen,
    correctCount,
    total,
    totalTimeTaken,
    currentLevel,
    setCurrentLevel,
    setUnlockedLevels,
    setUserPoints,
    recordedVideoUrl,
    onActivityDone,
    triggerReview,
    setActiveStudyLevel
}: EvalScreenProps) => {
    const [fullscreenVideo, setFullscreenVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const accuracy = Math.round((correctCount / total) * 100);
    const isPassed = accuracy >= 90;
    const avgTime = (totalTimeTaken / total).toFixed(1);
    const nextLvl = currentLevel + 1;

    const getCefrCode = (lvl: number) => getCefrFromLevel(lvl);

    const cefrCode = getCefrCode(isPassed ? nextLvl : currentLevel);
    const cefr = CEFR_MAPPING[cefrCode];
    const levelsEnum = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentIndex = levelsEnum.indexOf(cefr.level);

    const getStageReward = (lvl: number) => {
        const stage = lvl / 10;
        return 2000 + (Math.max(0, stage - 1) * 500);
    };

    const isStageClear = currentLevel > 0 && currentLevel % 10 === 0 && isPassed;

    useEffect(() => {
        logActivity('QUIZ', { accuracy, isPassed, level: currentLevel });
        if (isPassed) {
            import('canvas-confetti').then(confetti => {
                confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            });
            setCurrentLevel(nextLvl);
            setUnlockedLevels((prev: number[]) => [...new Set([...prev, nextLvl])].sort((a, b) => a - b));
            
            // [NEW] Stage-based rewards
            if (isStageClear) {
                const reward = getStageReward(currentLevel);
                setUserPoints((p: number) => p + reward);
            }

            if (onActivityDone) onActivityDone();
            setTimeout(() => { if (triggerReview) triggerReview(); }, 2000);

            const widgetInstalled = localStorage.getItem('vq_widget_installed') === 'true';
            const lastWidgetPromo = localStorage.getItem('vq_last_widget_promo') || '0';
            const now = Date.now();
            const threeDaysAfter = parseInt(lastWidgetPromo) + (1000 * 60 * 60 * 24 * 3);

            if (loadStreak().streak >= 3 && !widgetInstalled && now > threeDaysAfter) {
                setTimeout(() => {
                    // @ts-ignore
                    window.dispatchEvent(new CustomEvent('vq_show_widget_promo'));
                    localStorage.setItem('vq_last_widget_promo', now.toString());
                }, 4000);
            }
        }
    }, []);

    const handleShare = async () => {
        try {
            let text = t(settings.lang, "accuracy_share_msg")?.replace("{lvl}", nextLvl.toString()).replace("{cefr}", cefr.level).replace("{acc}", accuracy.toString()) || "";
            if (text === "accuracy_share_msg") {
                text = `I just reached Level ${nextLvl} (${cefr.level}) in VocaQuest with ${accuracy}% accuracy! 🚀`;
            }
            if (navigator.share) {
                await navigator.share({ title: 'VocaQuest Level Up!', text, url: 'https://vocaquest.app' });
            } else {
                navigator.clipboard.writeText(text);
                alert("Copied to clipboard!");
            }
        } catch (e) { }
    };

    const handleNextLevel = () => {
        const targetLevel = isPassed ? nextLvl : currentLevel;
        setActiveStudyLevel(targetLevel);
        setScreen('MASTERY');
    };

    const handleGoLobby = () => {
        setScreen('MASTERY');
    };

    return (
        <>
        <div className="screen bg-[#FAFAFE] flex flex-col overflow-hidden">
            <header className="flex items-center justify-between p-6 pb-4 border-b border-indigo-50 bg-white/80 backdrop-blur-xl z-20 shrink-0">
                <button onClick={async () => { await showAdIfFree(); setScreen('MASTERY'); }}
                 className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">{t(settings.lang, "session_results")}</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Achievement Card */}
                <section className={`relative overflow-hidden p-8 rounded-[40px] text-center shadow-2xl shadow-indigo-500/10 bg-gradient-to-br ${isPassed ? 'bg-white' : 'bg-slate-50 border-2 border-slate-100'} ${isStageClear ? 'ring-8 ring-yellow-400/20' : ''}`}>
                    {isPassed && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>}
                    {isStageClear && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-amber-500/5"></div>}

                    <div className="relative z-10 space-y-4">
                        <div className={`mx-auto w-24 h-24 rounded-[30px] flex items-center justify-center text-white font-black text-3xl shadow-xl bg-gradient-to-br ${cefr.themeColor} ${isStageClear ? 'scale-125 -translate-y-2' : ''}`}>
                            {isStageClear ? "🏆" : cefr.level}
                        </div>

                        <div>
                            <h1 className="text-[clamp(1.5rem,5.5vw,2rem)] font-black text-slate-900 tracking-tighter leading-tight mb-2">
                                {isStageClear ? t(settings.lang, 'stage_clear_title')?.replace('{n}', '1') : (isPassed ? t(settings.lang, 'eval_well_done') : t(settings.lang, "eval_nice_try"))}
                            </h1>
                            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">
                                {isStageClear ? t(settings.lang, 'stage_clear_desc') : (isPassed ? t(settings.lang, 'eval_growth_msg') : t(settings.lang, "eval_keep_pushing"))}
                            </p>
                            <p className="text-slate-400 text-[13px] font-medium mt-3 px-4 leading-relaxed">
                                {isStageClear ? t(settings.lang, "eval_congrats_desc")?.replace("{n}", "10").replace("{m}", "11") : (isPassed ? t(settings.lang, "eval_congrats_desc")?.replace("{n}", currentLevel.toString()).replace("{m}", nextLvl.toString()) : (t(settings.lang, "cefr_" + cefr.level.toLowerCase() + "_desc") || cefr.subtitle))}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Video Preview Session - STUDIO RECORDING */}
                {recordedVideoUrl && (
                    <section className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-lg overflow-hidden space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t(settings.lang, "eval_studio")}</h3>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 rounded-full shadow-md">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">{t(settings.lang, "eval_rec_complete")}</span>
                            </div>
                        </div>
                        {/* thumbnail — no autoPlay, user taps to play */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-100 shadow-inner group cursor-pointer"
                            onClick={() => {
                                setFullscreenVideo(true);
                                // pause thumbnail if playing
                                if (videoRef.current) videoRef.current.pause();
                            }}
                        >
                            <video
                                ref={videoRef}
                                src={recordedVideoUrl}
                                playsInline
                                muted
                                preload="metadata"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <Play size={28} fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute top-4 left-4 z-10">
                                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                                    <Video size={14} className="text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-1 flex justify-end">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(recordedVideoUrl);
                                        const blob = await response.blob();
                                        const reader = new FileReader();
                                        reader.onloadend = async () => {
                                            try {
                                                const base64data = (reader.result as string).split(',')[1];
                                                const fileName = `vocaquest_${Date.now()}.webm`;
                                                await Filesystem.writeFile({
                                                    path: fileName,
                                                    data: base64data,
                                                    directory: Directory.Documents
                                                });
                                                alert(t(settings.lang, "saved_to_device") + "\nLocation: Documents/" + fileName);
                                            } catch (innerErr: any) {
                                                alert("File write failed: " + innerErr.message);
                                            }
                                        };
                                        reader.onerror = () => alert("FileReader Error");
                                        reader.readAsDataURL(blob);
                                    } catch (e: any) {
                                        alert("Download Error: " + e.message);
                                    }
                                }}
                                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-2xl font-black text-[11px] hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm active:scale-95"
                            >
                                <Download size={16} /> {t(settings.lang, "save_video_btn")}
                            </button>
                        </div>
                    </section>
                )}


                {/* Progress Journey (A1 to C2) */}
                <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t(settings.lang, "eval_journey")}</h3>
                    <div className="relative pt-6 pb-2">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full flex justify-between relative">
                            {levelsEnum.map((lvl, i) => {
                                const isActive = i <= currentIndex;
                                const isCurrent = i === currentIndex;
                                return (
                                    <div key={lvl} className="relative flex flex-col items-center">
                                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white shadow-md transition-all duration-700 ${isActive ? 'bg-indigo-600' : 'bg-slate-300'} ${isCurrent ? 'scale-150 ring-4 ring-indigo-100' : ''}`}></div>
                                        <span className={`mt-5 text-[10px] font-black ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>{lvl}</span>
                                    </div>
                                );
                            })}
                            <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${(currentIndex / (levelsEnum.length - 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </section>

                {/* Equivalency Score Card */}
                <section className="bg-slate-900 overflow-hidden rounded-[32px] p-6 text-white relative group shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">{t(settings.lang, "eval_equivalency")}</h3>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{t(settings.lang, "eval_ielts")}</span>
                            <p className="text-xl font-black italic">{cefr.ielts}</p>
                        </div>
                        <div className="space-y-1 border-x border-white/10 px-3">
                            <span className="text-[9px] font-black text-sky-400 uppercase tracking-tighter">{t(settings.lang, "eval_toeic")}</span>
                            <p className="text-xl font-black italic">{cefr.toeic}</p>
                        </div>
                        <div className="space-y-1 pl-2">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{t(settings.lang, "eval_lexile")}</span>
                            <p className="text-xl font-black italic">{cefr.lexile}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white/30">{t(settings.lang, "eval_estimate_note")}</span>
                        <Sparkles size={14} className="text-yellow-400 opacity-50" />
                    </div>
                </section>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 text-center shadow-sm hover:border-indigo-100 transition-colors">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3"><Target size={20} /></div>
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(settings.lang, "accuracy")}</span>
                            <span className="text-[clamp(1.5rem,4.5vw,2.25rem)] font-black text-slate-800 italic">{accuracy}%</span>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 text-center shadow-sm hover:border-amber-100 transition-colors">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-3"><Zap size={20} /></div>
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(settings.lang, "avg_time")}</span>
                            <span className="text-[clamp(1.5rem,4.5vw,2.25rem)] font-black text-slate-800 italic">{avgTime}s</span>
                        </div>
                    </div>
                </div>

                {/* Reward Section (Only if passed) */}
                {isPassed && isStageClear && (
                    <div className="bg-amber-100/50 border-2 border-yellow-200/50 rounded-[40px] p-8 flex items-center justify-between shadow-sm animate-slide-up">
                        <div className="space-y-1">
                            <h3 className="text-yellow-900 font-black text-lg leading-none">{t(settings.lang, "reward_points")}</h3>
                            <p className="text-yellow-700/70 text-[11px] font-black uppercase tracking-tighter">{t(settings.lang, "eval_level_award") || "Stage Clear Bonus"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins size={36} className="text-yellow-600 drop-shadow-sm" />
                            <span className="text-5xl font-black text-yellow-700 italic">+{getStageReward(currentLevel)}</span>
                        </div>
                    </div>
                )}

                {/* Sharing options */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">{t(settings.lang, "eval_share_to")}</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'Insta', icon: Instagram, color: 'text-pink-500 bg-pink-50' },
                            { id: 'Youtube', icon: Youtube, color: 'text-red-500 bg-red-50' },
                            { id: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50' },
                            { id: 'Email', icon: Mail, color: 'text-slate-400 bg-slate-50' }
                        ].map((p) => (
                            <button key={p.id}
                                onClick={() => handleShare()}
                                className={`${p.color} p-5 rounded-[24px] flex items-center justify-center transition-all active:scale-95 shadow-sm border-2 border-transparent hover:border-white`}>
                                <p.icon size={24} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons - Fixed Footer */}
            <footer className="p-6 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] border-t border-slate-50 space-y-3">
                <button
                    onClick={handleNextLevel}
                    className={`w-full ${isStageClear ? 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500' : 'bg-slate-800'} text-white py-5 rounded-[24px] font-black text-xl shadow-[0_6px_0_#000000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2`}
                >
                    {isStageClear ? t(settings.lang, 'enter_next_world') : t(settings.lang, 'eval_next_level_btn')} <ChevronRight size={20} />
                </button>
                <button
                    onClick={handleGoLobby}
                    className="w-full bg-white border-2 border-slate-100 py-4 rounded-[24px] text-slate-400 font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <BookOpen size={18} /> {t(settings.lang, 'back_to_lobby')}
                </button>
            </footer>
        </div>

        {fullscreenVideo && recordedVideoUrl && createPortal(
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setFullscreenVideo(false)}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); setFullscreenVideo(false); }}
                    style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top, 24px))', right: '24px', zIndex: 10000, width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                    <X size={24} strokeWidth={3} />
                </button>
                <video
                    src={recordedVideoUrl!}
                    autoPlay
                    controls
                    playsInline
                    style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', objectFit: 'contain' }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>,
            document.body
        )}
        </>
    );
};
