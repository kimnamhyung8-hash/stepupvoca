import { X, ChevronLeft, Trophy, Coins, Info } from 'lucide-react';
import { useState } from 'react';
import { vocaDBJson } from '../data/vocaData';
import { t } from '../i18n';
import { PcAdSlot } from '../components/PcComponents';

interface StudyLevelScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    userPoints: number;
    setUserPoints: any;
    unlockedLevels: number[];
    setUnlockedLevels: any;
    isPremium?: boolean;
    setActiveStudyLevel: (lvl: number) => void;
}

import { CEFR_CONFIG } from '../constants/appConstants';

const getLevelCost = (lvl: number) => {
    if (lvl <= 10) return 0;
    if (lvl <= 30) return 2000;
    if (lvl <= 70) return 5000;
    if (lvl <= 130) return 10000;
    if (lvl <= 210) return 15000;
    if (lvl <= 290) return 20000;
    return 25000;
};

export const StudyLevelScreen = ({
    settings,
    setScreen,
    userPoints,
    setUserPoints,
    unlockedLevels,
    setUnlockedLevels,
    isPremium,
    setActiveStudyLevel
}: StudyLevelScreenProps) => {
    const [selectedTab, setSelectedTab] = useState('A1');
    const maxUnlockedLevel = Math.max(...unlockedLevels, 1);

    const currentConfig = CEFR_CONFIG.find(c => c.id === selectedTab) || CEFR_CONFIG[0];
    const filteredLevels = vocaDBJson.filter((l: any) => 
        l.level >= currentConfig.range[0] && l.level <= currentConfig.range[1]
    );

    const handleUnlock = (lvl: number, cost: number) => {
        if (userPoints >= cost) {
            if (confirm(t(settings.lang, "unlock_confirm")?.replace('P', `${cost}P`))) {
                setUserPoints((p: number) => p - cost);
                setUnlockedLevels((prev: number[]) => [...prev, lvl]);
            }
        } else {
            alert(t(settings.lang, "points_shortage"));
        }
    };

    const handleStartStudy = (level: number) => {
        setActiveStudyLevel(level);
        setScreen('STUDY');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-indigo-600 text-white px-6 pt-12 pb-6 shrink-0 shadow-lg relative z-20">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setScreen('HOME')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">{t(settings.lang, 'study_mode')}</h1>
                    <button onClick={() => setScreen('HOME')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-md border border-white/10">
                    <div className="flex items-center gap-2">
                        <Coins size={20} className="text-yellow-400" />
                        <span className="font-black text-lg">{userPoints.toLocaleString()}</span>
                    </div>
                    <div className="text-xs font-bold opacity-80 uppercase tracking-widest text-indigo-100">
                        {t(settings.lang, 'mastery_title')}
                    </div>
                </div>
            </header>

            {/* CEFR Tabs */}
            <div className="flex overflow-x-auto bg-white border-b border-slate-200 shrink-0 scrollbar-hide px-4 py-3 gap-2 relative z-10">
                {CEFR_CONFIG.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedTab(c.id)}
                        className={`whitespace-nowrap px-6 py-2 rounded-xl text-sm font-black transition-all border-2 ${
                            selectedTab === c.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                    >
                        {t(settings.lang, 'target_cefr').replace('{cefr}', c.id)}
                    </button>
                ))}
            </div>

            {/* Level List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
                <PcAdSlot variant="horizontal" className="mb-6" />
                {filteredLevels.map((levelData: any) => {
                    const cost = getLevelCost(levelData.level);
                    const isActuallyUnlocked = isPremium || cost === 0 || unlockedLevels.includes(levelData.level);
                    const isLocked = !isPremium && levelData.level > 10 && !unlockedLevels.includes(levelData.level) && levelData.level > (maxUnlockedLevel + 1);
                    
                    return (
                        <div 
                            key={levelData.level} 
                            className={`bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group transition-all ${isLocked ? 'opacity-60 grayscale' : ''}`}
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">{t(settings.lang, 'level')} {levelData.level}</span>
                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className="text-slate-400 font-bold text-xs">{t(settings.lang, 'unit_word')} {levelData.words.length}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                                        {levelData.description || t(settings.lang, "level_basic_desc").replace('{n}', levelData.level.toString())}
                                    </h3>
                                </div>
                                <div className="flex flex-col items-center bg-indigo-50 p-2 rounded-2xl border border-indigo-100 min-w-[60px]">
                                    {isActuallyUnlocked ? (
                                        <Trophy size={20} className="text-indigo-600 mb-1" />
                                    ) : (
                                        <Coins size={20} className="text-amber-500 mb-1" />
                                    )}
                                    <span className="text-[10px] font-black text-indigo-600">
                                        {isActuallyUnlocked ? `${levelData.words.length} ${t(settings.lang, "unit_word")}` : `${cost.toLocaleString()}P`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 relative z-10">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Info size={16} />
                                    <span className="text-xs font-bold">{isActuallyUnlocked ? t(settings.lang, 'status_ready') : isLocked ? t(settings.lang, 'clear_previous_first') : t(settings.lang, 'status_need_points')}</span>
                                </div>
                                
                                {isActuallyUnlocked ? (
                                    <button
                                        onClick={() => handleStartStudy(levelData.level)}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-[0_8px_15px_rgba(79,70,229,0.25)] active:translate-y-1 active:shadow-none transition-all"
                                    >
                                        {t(settings.lang, 'start_training')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUnlock(levelData.level, cost)}
                                        className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-[0_8px_15px_rgba(245,158,11,0.25)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                                    >
                                        <Coins size={16} />
                                        {t(settings.lang, 'unlock_btn')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                <PcAdSlot variant="horizontal" className="mt-8" />

                {filteredLevels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <Info size={32} />
                        </div>
                        <p className="font-bold">{t(settings.lang, "no_level_data")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
