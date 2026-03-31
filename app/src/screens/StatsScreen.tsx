
import React from 'react';
import {
    X,
    Target,
    BarChart2,
    Flame,
    Sword,
    Rocket,
    Crown
} from 'lucide-react';
import { t } from '../i18n';

interface StatsScreenProps {
    settings: any;
    setScreen: (s: string) => void;
    userInfo?: any;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ settings, setScreen, userInfo }) => {
    const lang = settings.lang || 'ko';

    // Mock Data (Should ideally come from props/backend)
    const accuracyData = [75, 76, 75, 76, 75, 76, 50]; // Matches the chart in image
    const days = ['13', '14', '15', '16', '17', '18', '19'];
    const currentAccuracy = "64.3%";

    return (
        <div className="screen animate-fade-in bg-[#F8FAFC] flex flex-col font-sans h-full overflow-y-auto pb-32">
            {/* Dark Header Section */}
            <div className="bg-[#0F172A] pt-12 pb-20 px-6 relative rounded-b-[48px] shadow-2xl flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => setScreen('HOME')} 
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-all"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-white font-black italic tracking-tight text-lg">
                        {t(lang, "learning_stats")}
                    </h2>
                    <div className="w-10"></div>
                </div>

                <div className="flex flex-col items-center">
                    {/* Mastery Rank Indicator */}
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[32px] flex items-center justify-center border border-white/5 shadow-2xl">
                            <BarChart2 size={40} className="text-white/90" />
                        </div>
                        <div className="absolute -top-1 -right-3 bg-[#FFB800] text-[#0F172A] px-3 py-1 rounded-full text-[10px] font-black shadow-[0_4px_20px_rgba(255,184,0,0.4)] border-2 border-[#0F172A] transform rotate-3">
                            RANK A+
                        </div>
                    </div>

                    <p className="text-[#818CF8] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                        {t(lang, "current_mastery_status")}
                    </p>
                    <h1 className="text-white text-3xl font-black italic tracking-tighter mb-10 text-center leading-[1.1] drop-shadow-sm">
                        {t(lang, "legendary_progress").split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i === 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h1>

                    {/* Regional/Global Cards */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[28px] flex flex-col items-center">
                            <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">{t(lang, 'regional_rank')}</span>
                            <span className="text-white text-lg font-black italic">TOP 4.2%</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[28px] flex flex-col items-center">
                            <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">{t(lang, 'global_rank')}</span>
                            <span className="text-white text-lg font-black italic">TOP 8.5%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-6 -mt-10 space-y-6 relative z-10">
                {/* Accuracy Chart Card */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-slate-900 font-black text-lg leading-tight">{t(lang, "accuracy_trend")}</h3>
                            <p className="text-slate-400 text-xs font-bold mt-1">{t(lang, "last_7_days")}</p>
                        </div>
                        <div className="bg-indigo-50 px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-indigo-100">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Target size={12} className="text-white" />
                            </div>
                            <span className="text-indigo-600 font-black text-sm">{currentAccuracy}</span>
                        </div>
                    </div>

                    <div className="relative h-44 w-full">
                        <svg viewBox="0 0 700 300" className="w-full h-full overflow-visible">
                            <line x1="0" y1="0" x2="700" y2="0" stroke="#F1F5F9" strokeWidth="2" />
                            <line x1="0" y1="100" x2="700" y2="100" stroke="#F1F5F9" strokeWidth="2" />
                            <line x1="0" y1="200" x2="700" y2="200" stroke="#F1F5F9" strokeWidth="2" />
                            <line x1="0" y1="300" x2="700" y2="300" stroke="#F1F5F9" strokeWidth="2" />
                            <text x="-15" y="8" className="fill-slate-300 text-[24px] font-bold" textAnchor="end">100</text>
                            <text x="-15" y="108" className="fill-slate-300 text-[24px] font-bold" textAnchor="end">80</text>
                            <text x="-15" y="208" className="fill-slate-300 text-[24px] font-bold" textAnchor="end">60</text>

                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M 50 ${300 - accuracyData[0]*2} L 150 ${300 - accuracyData[1]*2} L 250 ${300 - accuracyData[2]*2} L 350 ${300 - accuracyData[3]*2} L 450 ${300 - accuracyData[4]*2} L 550 ${300 - accuracyData[5]*2} L 650 ${300 - accuracyData[6]*2}`}
                                fill="none"
                                stroke="#6366F1"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d={`M 50 ${300 - accuracyData[0]*2} L 150 ${300 - accuracyData[1]*2} L 250 ${300 - accuracyData[2]*2} L 350 ${300 - accuracyData[3]*2} L 450 ${300 - accuracyData[4]*2} L 550 ${300 - accuracyData[5]*2} L 650 ${300 - accuracyData[6]*2} V 300 H 50 Z`}
                                fill="url(#chartGradient)"
                            />
                            {accuracyData.map((val, i) => (
                                <circle key={i} cx={50 + i * 100} cy={300 - val * 2} r="14" fill="white" stroke="#6366F1" strokeWidth="6" />
                            ))}
                        </svg>
                        <div className="flex justify-between mt-6 px-[5%] text-[11px] font-black text-slate-300">
                            {days.map(day => <span key={day}>{day}</span>)}
                        </div>
                    </div>
                </div>

                {/* Performance Summary Section - Matches image */}
                <div className="space-y-4">
                    <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest px-2">
                        {t(lang, "performance_summary")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-amber-100/50 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-orange-100/50">
                                <Flame size={24} fill="currentColor" fillOpacity={0.1} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-2">{t(lang, "study_participation")}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-slate-900 text-3xl font-black italic">{userInfo?.streak || 0}</span>
                                <span className="text-slate-400 text-xs font-bold">{t(lang, 'unit_days')}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-indigo-100/50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-indigo-100/50">
                                <Crown size={24} fill="currentColor" fillOpacity={0.1} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-2">{t(lang, "level_up_challenges")}</span>
                            <span className="text-slate-900 text-3xl font-black italic">{userInfo?.level || 1}/3</span>
                        </div>
                    </div>
                </div>

                {/* Battle Record Card */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-indigo-600 text-[11px] font-black uppercase tracking-widest">{t(lang, "battle_record")}</span>
                            <div className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-50">
                                <Sword size={24} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-slate-900 text-4xl font-black italic">{userInfo?.battleWins || 0} WINS</span>
                            <span className="text-slate-300 text-2xl font-black">/ {userInfo?.totalBattles || 0}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                                style={{ width: `${userInfo?.totalBattles ? (userInfo.battleWins / userInfo.totalBattles) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Activity Highlights */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{t(lang, "activity_highlight")}</h3>
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            LIVE TRACKING
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-3xl border border-slate-50">
                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <Rocket size={26} className="text-orange-400" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 font-black text-sm">{t(lang, "mastered_words")}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-0.5">{userInfo?.wordsStudied || 0} WORDS EXPLORED</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-3xl border border-slate-50">
                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <Target size={26} className="text-rose-400" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 font-black text-sm">{t(lang, "participation_rate")}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-0.5">29% CONSISTENCY THIS WEEK</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};