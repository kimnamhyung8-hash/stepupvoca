import { useEffect } from 'react';
import { t } from '../i18n';

interface SplashScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
}

export const SplashScreen = ({ settings, setScreen }: SplashScreenProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            const saved = localStorage.getItem('vq_user');
            const u = saved ? JSON.parse(saved) : null;

            if (u && u.nickname) {
                const resumeScreen = localStorage.getItem('vq_current_screen');
                if (resumeScreen && ['HOME', 'LEVEL_TEST', 'STATS', 'PROFILE', 'STORE', 'SETTINGS', 'MASTERY', 'BIBLE', 'MY_PHRASES'].includes(resumeScreen)) {
                    setScreen(resumeScreen);
                } else {
                    setScreen('HOME');
                }
            } else {
                setScreen('LOGIN');
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, [setScreen]);

    return (
        <div className="screen justify-center items-center relative overflow-hidden bg-white animate-fade-in flex flex-col">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-80 h-80 bg-[var(--color-primary)]/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-50/50 rounded-full blur-[100px]"></div>
            <div className="z-10 flex flex-col items-center">
                <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-black tracking-tighter text-slate-800 mb-2 animate-float">VocaQuest</h1>
                <p className="text-slate-400 tracking-[0.4em] font-black text-[clamp(9px,1.5vh,11px)] uppercase animate-slide-up delay-300">{t(settings.lang, "mastery")}</p>
            </div>
            <div className="absolute bottom-24 flex flex-col items-center gap-4">
                <div className="w-1.5 h-12 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full bg-[var(--color-primary)] animate-[loading_1.5s_infinite] h-1/2 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
