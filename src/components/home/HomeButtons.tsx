import React from 'react';
import {
    Zap,
    MessageSquare,
    BookOpen,
    BookMarked,
    Sparkles,
    BarChart3,
    Swords,
    Target,
    ArrowRight,
    Globe
} from 'lucide-react';
import { t } from '../../i18n';
import { tComm } from '../../i18n/communityTranslations';

// Common interfaces
interface ButtonProps {
    lang: string;
    setScreen: (s: string) => void;
}

export const MasteryBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button
        onClick={() => setScreen('MASTERY')}
        className="w-full mt-2 bg-[#4F46E5] py-6 rounded-[32px] text-white flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all group"
    >
        <Zap size={28} className="fill-white" />
        <span className="text-2xl font-black">{t(lang, 'start_challenge')}</span>
    </button>
);

export const CommunityBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('COMMUNITY')} className="w-full mt-2 bg-[#EEF2FF] p-6 rounded-[40px] border border-[#E0E7FF] shadow-xl hover:shadow-indigo-100 active:scale-[0.98] transition-all text-left relative overflow-hidden group">
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
);

export const LiveChatBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
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
);

export const AiConversationCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('CONVERSATION_LIST')} className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-95 transition-all text-left relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#F5F7FF] text-[#6366F1] rounded-2xl flex items-center justify-center border border-indigo-50/50 shrink-0 relative">
            <MessageSquare size={28} />
            <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
        </div>
        <div className="flex-1 z-10">
            <h4 className="font-bold text-[15px] text-slate-800 leading-tight">{t(lang, 'ai_conversation_title')}</h4>
        </div>
    </button>
);

export const AiConversationMiniCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('CONVERSATION_LIST')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left relative">
        <div className="w-14 h-14 bg-[#F5F7FF] text-[#6366F1] rounded-2xl flex items-center justify-center border border-indigo-50/50 relative">
            <MessageSquare size={28} />
            <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
        </div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'ai_conversation_title')}</span>
    </button>
);

export const StudyLevelCard: React.FC<ButtonProps & { currentLevel: number; setActiveStudyLevel: (lvl: number) => void }> = ({ lang, setScreen, currentLevel, setActiveStudyLevel }) => (
    <button onClick={() => { setActiveStudyLevel(currentLevel); setScreen('STUDY_LEVEL'); }} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
        <div className="w-14 h-14 bg-[#F0FDF4] text-[#22C55E] rounded-2xl flex items-center justify-center border border-emerald-50/50">
            <BookOpen size={28} />
        </div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'study_tab')}</span>
    </button>
);

export const PhraseBibleBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('MY_PHRASES')} className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 active:scale-95 transition-all text-left relative">
        <div className="w-14 h-14 bg-[#FFF7ED] text-[#F97316] rounded-2xl flex items-center justify-center border border-orange-50/50 shrink-0 relative">
            <BookMarked size={28} />
            <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
        </div>
        <div className="flex-1"><h4 className="font-bold text-[15px] text-slate-800 leading-tight">{t(lang, 'phrase_bible_title')}</h4></div>
        <div className="px-3 py-1 bg-[#FFEDD5] text-[#9A3412] text-[9px] font-bold rounded-xl shadow-sm italic tracking-tighter">{t(lang, 'new_label')}</div>
    </button>
);

export const BibleCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
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
);

export const ReviewCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('REVIEW')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
        <div className="w-14 h-14 bg-[#FAF5FF] text-[#A855F7] rounded-2xl flex items-center justify-center border border-purple-50/50 relative">
            <BookOpen size={28} />
            <div className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg shadow-md border border-white">AI</div>
        </div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'review')}</span>
    </button>
);

export const DictionaryCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('DICTIONARY')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
        <div className="relative">
            <div className="w-14 h-14 bg-[#ECFEFF] text-[#0891B2] rounded-2xl flex items-center justify-center border border-cyan-50/50"><Sparkles size={28} /></div>
            <div className="absolute -top-1 -right-2 bg-[#22D3EE] text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg tracking-tighter whitespace-nowrap shadow-sm">{t(lang, 'ai_new_label')}</div>
        </div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'ai_dictionary')}</span>
    </button>
);

export const AiReportCard: React.FC<ButtonProps & { setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void }> = ({ lang, setScreen, setAiReportMode }) => (
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
);

export const BattleCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('BATTLE')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
        <div className="relative">
            <div className="w-14 h-14 bg-[#FFF1F2] text-[#E11D48] rounded-2xl flex items-center justify-center border border-rose-50/50"><Swords size={28} /></div>
            <div className="absolute top-0 -right-2 bg-[#F43F5E] text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg tracking-tighter shadow-sm">{t(lang, 'live_label')}</div>
        </div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'battle_title')}</span>
    </button>
);

export const MinigameCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('MINIGAME')} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all text-left">
        <div className="w-14 h-14 bg-[#FFFBEB] text-[#D97706] rounded-2xl flex items-center justify-center border border-amber-50/50"><Target size={28} /></div>
        <span className="font-bold text-[13px] text-slate-800 leading-tight">{t(lang, 'defender_title')}</span>
    </button>
);

export const LevelTestBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('LEVEL_TEST')} className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-1 rounded-[40px] shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all mt-4 mb-4">
        <div className="flex items-center gap-5 pr-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center m-1 shadow-inner outline outline-1 outline-white/20"><BarChart3 size={28} className="text-white" /></div>
            <div className="flex-1 text-center">
                <h4 className="text-white font-bold text-lg tracking-tight">{t(lang, 'level_test_title')}</h4>
                <p className="text-white/70 font-bold text-[10px] mt-0.5 tracking-wider uppercase italic">{t(lang, 'level_test_desc_short')}</p>
            </div>
        </div>
    </button>
);
