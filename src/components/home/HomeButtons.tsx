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
    <button onClick={() => setScreen('MASTERY')} className="w-full bg-[#EEF2FF] p-5 rounded-[36px] border border-[#E0E7FF] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-indigo-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-indigo-50 relative group-hover:scale-105 transition-transform">
                <Zap size={28} className="fill-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-indigo-900 leading-tight truncate">{t(lang, 'start_challenge')}</h4>
                <p className="text-indigo-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '단어 암기 챌린지 시작하기' : 'Start Vocabulary Challenge'}</p>
            </div>
            <div className="bg-indigo-600/10 text-indigo-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const StudyLevelCard: React.FC<ButtonProps & { currentLevel: number; setActiveStudyLevel: (lvl: number) => void }> = ({ lang, setScreen, currentLevel, setActiveStudyLevel }) => (
    <button onClick={() => { setActiveStudyLevel(currentLevel); setScreen('STUDY_LEVEL'); }} className="w-full bg-[#ECFDF5] p-5 rounded-[36px] border border-[#D1FAE5] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-emerald-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-emerald-50 relative group-hover:scale-105 transition-transform">
                <BookOpen size={28} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-emerald-900 leading-tight truncate">{t(lang, 'study_tab')}</h4>
                <p className="text-emerald-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '레벨별 맞춤 단어 학습장' : 'Level-based Vocabulary Study'}</p>
            </div>
            <div className="bg-emerald-600/10 text-emerald-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const ReviewCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('REVIEW')} className="w-full bg-[#FDF4FF] p-5 rounded-[36px] border border-[#FAE8FF] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-fuchsia-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-fuchsia-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-fuchsia-50 relative group-hover:scale-105 transition-transform">
                <BookOpen size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-fuchsia-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-fuchsia-900 leading-tight truncate">{t(lang, 'review')}</h4>
                <p className="text-fuchsia-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '틀린 단어들을 AI로 복습' : 'Review incorrect words with AI'}</p>
            </div>
            <div className="bg-fuchsia-600/10 text-fuchsia-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const DictionaryCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('DICTIONARY')} className="w-full bg-[#ECFEFF] p-5 rounded-[36px] border border-[#CFFAFE] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-cyan-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-cyan-50 relative group-hover:scale-105 transition-transform">
                <Sparkles size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-cyan-900 leading-tight truncate">{t(lang, 'ai_dictionary')}</h4>
                <p className="text-cyan-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? 'AI 문맥 학습 영한사전' : 'AI Contextual Dictionary'}</p>
            </div>
            <div className="bg-cyan-600/10 text-cyan-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const BattleCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('BATTLE')} className="w-full bg-[#FFF1F2] p-5 rounded-[36px] border border-[#FFE4E6] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-rose-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-rose-50 relative group-hover:scale-105 transition-transform">
                <Swords size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">LIVE</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-rose-900 leading-tight truncate">{t(lang, 'battle_title')}</h4>
                <p className="text-rose-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '글로벌 유저와 1:1 보카 대결' : '1:1 Global Voca Battle'}</p>
            </div>
            <div className="bg-rose-600/10 text-rose-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const MinigameCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('MINIGAME')} className="w-full bg-[#FFFBEB] p-5 rounded-[36px] border border-[#FEF3C7] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-amber-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-amber-50 relative group-hover:scale-105 transition-transform">
                <Target size={28} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-amber-900 leading-tight truncate">{t(lang, 'defender_title')}</h4>
                <p className="text-amber-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '긴장감 넘치는 단어 요격 게임' : 'Action-packed words game'}</p>
            </div>
            <div className="bg-amber-600/10 text-amber-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const AiReportCard: React.FC<ButtonProps & { setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void }> = ({ lang, setScreen, setAiReportMode }) => (
    <button onClick={() => { setAiReportMode('VOCAB'); setScreen('AI_REPORT'); }} className="w-full bg-[#F5F3FF] p-5 rounded-[36px] border border-[#EDE9FE] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-violet-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-violet-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-violet-50 relative group-hover:scale-105 transition-transform">
                <BarChart3 size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">PRO</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-violet-900 leading-tight truncate">{t(lang, 'ai_report_title')}</h4>
                <p className="text-violet-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? 'AI 종합 분석 및 취약점 리포트' : 'Comprehensive AI Analysis'}</p>
            </div>
            <div className="bg-violet-600/10 text-violet-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const PhraseBibleBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('MY_PHRASES')} className="w-full bg-[#FFF7ED] p-5 rounded-[36px] border border-[#FFEDD5] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-orange-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-orange-50 relative group-hover:scale-105 transition-transform">
                <BookMarked size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-orange-900 leading-tight truncate">{t(lang, 'phrase_bible_title')}</h4>
                <p className="text-orange-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? 'AI 회화에서 배운 나만의 표현장' : 'Your saved expressions'}</p>
            </div>
            <div className="bg-orange-600/10 text-orange-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const AiConversationCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('CONVERSATION_LIST')} className="w-full bg-[#F0FDF4] p-5 rounded-[36px] border border-[#D1FAE5] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-emerald-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-emerald-50 relative group-hover:scale-105 transition-transform">
                <MessageSquare size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-emerald-900 leading-tight truncate">{t(lang, 'ai_conversation_title')}</h4>
                <p className="text-emerald-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '상황별 리얼 AI 롤플레잉' : 'Situational AI Roleplay'}</p>
            </div>
            <div className="bg-emerald-600/10 text-emerald-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const BibleCard: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('BIBLE')} className="w-full bg-[#EFF6FF] p-5 rounded-[36px] border border-[#DBEAFE] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-blue-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-blue-50 relative group-hover:scale-105 transition-transform">
                <BookOpen size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">AI</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-blue-900 leading-tight truncate">{t(lang, 'bible_title')}</h4>
                <p className="text-blue-600/70 text-xs font-bold mt-1 tracking-tight truncate">{lang === 'ko' ? '핵심 영어 패턴 50개 마스터하기' : 'Master 50 Core Patterns'}</p>
            </div>
            <div className="bg-blue-600/10 text-blue-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const LiveChatBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('LIVE_CHAT')} className="w-full bg-[#F0FDF4] p-5 rounded-[36px] border border-[#DCFCE7] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-green-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-green-50 relative group-hover:scale-105 transition-transform">
                <Globe size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">LIVE</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-green-900 leading-tight truncate">{tComm(lang, 'live_chat_title')}</h4>
                <p className="text-green-600/70 text-xs font-bold mt-1 tracking-tight truncate">{tComm(lang, 'live_chat_desc')}</p>
            </div>
            <div className="bg-green-600/10 text-green-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const LevelTestBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('LEVEL_TEST')} className="w-full bg-[#FAFAF9] p-5 rounded-[36px] border border-[#E7E5E4] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-yellow-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-yellow-50 relative group-hover:scale-105 transition-transform">
                <BarChart3 size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">TEST</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-yellow-900 leading-tight truncate">{t(lang, 'level_test_title')}</h4>
                <p className="text-yellow-600/70 text-xs font-bold mt-1 tracking-tight truncate">{t(lang, 'level_test_desc_short')}</p>
            </div>
            <div className="bg-yellow-600/10 text-yellow-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);

export const CommunityBanner: React.FC<ButtonProps> = ({ lang, setScreen }) => (
    <button onClick={() => setScreen('COMMUNITY')} className="w-full bg-[#EEF2FF] p-5 rounded-[36px] border border-[#E0E7FF] shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white text-indigo-600 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-indigo-50 relative group-hover:scale-105 transition-transform">
                <Globe size={28} />
                <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-lg border border-white">HOT</div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-black text-lg text-indigo-900 leading-tight truncate">{tComm(lang, 'hero_title')}</h4>
                <p className="text-indigo-600/70 text-xs font-bold mt-1 tracking-tight truncate">{tComm(lang, 'hero_desc')}</p>
            </div>
            <div className="bg-indigo-600/10 text-indigo-600 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
            </div>
        </div>
    </button>
);
