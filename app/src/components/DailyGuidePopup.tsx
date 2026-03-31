
import React, { useState } from 'react';
import {
    X,
    ChevronDown,
    BookOpen,
    MessageCircle,
    Book,
    Search,
    Swords,
    BarChart2,
    Play,
    Sparkles,
    Trophy,
    Target
} from 'lucide-react';
import { t } from '../i18n';

interface DailyGuidePopupProps {
    onClose: () => void;
    setScreen: (s: string) => void;
    settings: any;
    streak?: number;
}

export const DailyGuidePopup: React.FC<DailyGuidePopupProps> = ({
    onClose,
    setScreen,
    settings,
    streak = 0
}) => {
    const lang = settings.lang || 'ko';
    const day = (streak % 7) + 1;
    const [expandedId, setExpandedId] = useState<string | null>('guide1');

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const guideItems = [
        { id: 'guide1', screen: 'REVIEW', icon: <BookOpen />, color: 'rose', title: t(lang, "guide1_title") },
        { id: 'guide2', screen: 'CONVERSATION_LIST', icon: <MessageCircle />, color: 'amber', title: t(lang, "guide2_title") },
        { id: 'guide3', screen: 'BIBLE', icon: <Book />, color: 'emerald', title: t(lang, "guide3_title") },
        { id: 'guide4', screen: 'DICTIONARY', icon: <Search />, color: 'sky', title: t(lang, "guide4_title") },
        { id: 'guide5', screen: 'BATTLE', icon: <Swords />, color: 'indigo', title: t(lang, "guide5_title") },
        { id: 'guide6', screen: 'LEVEL_TEST', icon: <BarChart2 />, color: 'slate', title: t(lang, "guide6_title") },
        { id: 'guide7', screen: 'STORE', icon: <Sparkles />, color: 'purple', title: t(lang, "guide7_title") },
    ];

    const getColorClasses = (color: string) => {
        const maps: Record<string, string> = {
            rose: 'bg-rose-50 text-rose-500 border-rose-100',
            amber: 'bg-amber-50 text-amber-500 border-amber-100',
            emerald: 'bg-emerald-50 text-emerald-500 border-emerald-100',
            sky: 'bg-sky-50 text-sky-500 border-sky-100',
            indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100',
            slate: 'bg-slate-50 text-slate-500 border-slate-100',
            purple: 'bg-purple-50 text-purple-500 border-purple-100',
        };
        return maps[color] || maps.slate;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4 md:p-0">
            <div className="bg-white w-full max-w-lg h-[85vh] md:h-[90vh] rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] relative animate-slide-up flex flex-col overflow-hidden">
                <div className="shrink-0 pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
                </div>

                <div className="px-5 flex flex-col flex-1 overflow-hidden pt-4">
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-indigo-600 font-black text-xs tracking-[0.1em] uppercase">
                                    {t(lang, "guide_title")?.replace("{n}", day.toString()) || `DAY ${day} · 7-DAY GUIDE`}
                                </span>
                                <div className="flex gap-1.5">
                                    {[...Array(7)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-2 h-2 rounded-full transition-all duration-500 shadow-sm ${i < day ? 'bg-indigo-600 scale-110' : 'bg-slate-100 scale-100'}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <h2 className="text-[20px] font-black text-slate-900 leading-tight italic flex items-center gap-2">
                                {t(lang, "guide_header")}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90 border border-slate-100"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-20">
                        {guideItems.map((item) => {
                            const isExpanded = expandedId === item.id;
                            const colorClass = getColorClasses(item.color);
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={`rounded-[32px] border-2 transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/5 translate-p-2' : 'bg-white border-slate-100 hover:border-slate-200 active:scale-[0.99] shadow-sm'}`}
                                >
                                    <button 
                                        onClick={() => toggleExpand(item.id)}
                                        className="w-full flex items-center gap-3 p-4 text-left transition-all"
                                    >
                                        <div className={`w-11 h-11 ${colorClass} rounded-2xl flex items-center justify-center shrink-0 border transition-transform ${isExpanded ? 'scale-110' : 'scale-100'}`}>
                                            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 })}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-black text-base tracking-tight transition-colors ${isExpanded ? 'text-indigo-600 italic' : 'text-slate-800'}`}>
                                                {item.title}
                                            </h4>
                                            {!isExpanded && (
                                                <p className="text-slate-400 text-xs font-bold truncate pr-4">
                                                    {t(lang, `${item.id}_desc`)}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-500 rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 animate-fade-in-up">
                                            <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 mb-4">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <Sparkles size={12} className="text-indigo-400" />
                                                    {t(lang, "guide_subheader") || "SHALL WE STUDY?"}
                                                </h5>
                                                
                                                <div className="space-y-4">
                                                    {[1, 2, 3].map(stepNum => (
                                                        <div key={stepNum} className="flex items-start gap-4 group">
                                                            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                                                                {stepNum}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-600 leading-tight pt-0.5">
                                                                {t(lang, `${item.id}_step${stepNum}`)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <button 
                                                    onClick={() => { setScreen(item.screen); onClose(); }}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Play size={18} fill="currentColor" />
                                                    {t(lang, `${item.id}_primary`)}
                                                </button>
                                                {t(lang, `${item.id}_secondary`) && (
                                                    <button 
                                                        onClick={() => { setScreen('LEVEL_TEST'); onClose(); }}
                                                        className="w-full bg-white border-2 border-slate-100 hover:border-indigo-100 text-slate-500 hover:text-indigo-600 py-4 rounded-2xl font-black text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Target size={18} />
                                                        {t(lang, `${item.id}_secondary`)}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/100 to-transparent pt-12 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 'calc(2.5rem + var(--safe-area-bottom))' }}>
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto active:scale-95 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <Trophy size={18} />
                        </div>
                        <div className="pr-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t(lang, 'weekly_goal_progress')}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(day / 7) * 100}%` }} />
                                </div>
                                <span className="text-xs font-black text-slate-800 italic">{Math.round((day / 7) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
