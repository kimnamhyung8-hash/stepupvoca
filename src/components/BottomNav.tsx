import {
    Layers, ShoppingBag as Store, BarChart2, Settings, User
} from 'lucide-react';
import { t } from '../i18n';

interface BottomNavProps {
    screen: string;
    setScreen: (screen: string) => void;
    settings: any;
    setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
}

export const BottomNav = ({ screen, setScreen, settings, setAiReportMode }: BottomNavProps) => {
    const tabs = [
        { id: 'HOME', icon: Layers, label: 'nav_home' },
        { id: 'STORE', icon: Store, label: 'fixed_shop' },
        { id: 'STATS', icon: BarChart2, label: 'nav_stats' },
        { id: 'SETTINGS', icon: Settings, label: 'settings' },
        { id: 'PROFILE', icon: User, label: 'profile' }
    ];

    const lang = settings?.lang || 'ko';

    return (
        <nav className="absolute bottom-0 left-0 w-full h-[var(--nav-height)] bg-white/95 backdrop-blur-3xl border-t border-slate-100/60 flex justify-around items-stretch z-50 px-2 group">
            {tabs.map((tab) => {
                const isActive = screen === tab.id;
                const Icon = tab.icon;
                const translatedLabel = t(lang, tab.label);

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.id === 'HOME') setAiReportMode('VOCAB');
                            setScreen(tab.id);
                        }}
                        className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1.5 transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400 opacity-70 hover:opacity-100'} min-w-0 active:scale-90`}
                    >
                        <div className={`p-1.5 rounded-[18px] transition-all duration-300 ${isActive ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}>
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? 'text-indigo-600 drop-shadow-[0_2px_4px_rgba(79,70,229,0.15)]' : ''}`} />
                        </div>
                        <span className={`text-[9px] font-black tracking-tighter whitespace-nowrap text-center leading-none mt-1 transition-all ${isActive ? 'text-indigo-600 translate-y-0 opacity-100' : 'text-slate-500 opacity-60 translate-y-0.5'} truncate w-full px-1`}>
                            {translatedLabel}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};
