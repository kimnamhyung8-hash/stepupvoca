import { 
  Layers, ShoppingBag as Store, BarChart2, Settings, User, ArrowRight
} from 'lucide-react';
import { t } from '../i18n';

interface TabletSideNavProps {
    screen: string;
    setScreen: (screen: string) => void;
    settings: any;
    setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
    userPoints: number;
}

export const TabletSideNav = ({ screen, setScreen, settings, setAiReportMode, userPoints }: TabletSideNavProps) => {
    const tabs = [
        { id: 'HOME', icon: Layers, label: 'nav_home' },
        { id: 'STORE', icon: Store, label: 'fixed_shop' },
        { id: 'STATS', icon: BarChart2, label: 'nav_stats' },
        { id: 'PROFILE', icon: User, label: 'profile' },
        { id: 'SETTINGS', icon: Settings, label: 'settings' }
    ];

    const lang = settings?.lang || 'ko';

    return (
        <aside className="w-64 h-full bg-white/95 backdrop-blur-3xl border-r border-slate-100 flex flex-col p-6 z-50">
            {/* App Branding */}
            <div className="flex items-center gap-3 mb-12 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Layers className="text-white" size={24} />
                </div>
                <span className="text-2xl font-black text-slate-800 tracking-tight">VocaQuest</span>
            </div>

            {/* Profile Brief */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex items-center justify-between border border-slate-100 shrink-0 cursor-pointer hover:border-indigo-100 transition-colors" onClick={() => setScreen('PROFILE')}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                        <img src="https://i.pravatar.cc/150?img=11" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-800 line-clamp-1">Learner</div>
                        <div className="text-xs font-bold text-indigo-600">{userPoints.toLocaleString()}P</div>
                    </div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                {tabs.map((tab) => {
                    const isActive = screen === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'HOME') setAiReportMode('VOCAB');
                                setScreen(tab.id);
                            }}
                            className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 font-black text-[15px] group active:scale-95 ${
                                isActive 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
                            {t(lang, tab.label)}
                        </button>
                    );
                })}
            </nav>
            
            {/* Footer space reserved for ads or settings */}
            <div className="pt-6 shrink-0 border-t border-slate-100 mt-6">
                 <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 rounded-2xl border border-amber-200/50">
                    <div className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">{t(lang, 'premium')}</div>
                    <div className="text-xs text-amber-900 font-medium">Enjoy unlimited AI features</div>
                 </div>
            </div>
        </aside>
    );
};
