import React from 'react';
import * as B from './HomeButtons';

interface ViewProps {
    lang: string;
    setScreen: (s: string) => void;
    currentLevel: number;
    setActiveStudyLevel: (lvl: number) => void;
    setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
}

export const LearningHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-5 animate-fade-in">
        <B.MasteryBanner {...props} />
        <div className="grid grid-cols-2 gap-5">
            <B.StudyLevelCard {...props} />
            <B.ReviewCard {...props} />
        </div>
        <B.PhraseBibleBanner {...props} />
        <div className="grid grid-cols-2 gap-5">
            <B.AiReportCard {...props} />
            <B.DictionaryCard {...props} />
        </div>
        <div className="grid grid-cols-2 gap-5">
            <B.BattleCard {...props} />
            <B.MinigameCard {...props} />
        </div>
    </div>
);

export const TravelHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-5 animate-fade-in">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-3xl p-5 mb-2 shadow-sm">
            <h3 className="font-black text-sky-800 text-lg mb-1">✈️ {props.lang === 'ko' ? '여행 필수 회화' : 'Travel Essentials'}</h3>
            <p className="text-sky-600/80 text-xs font-bold leading-tight">{props.lang === 'ko' ? '공항 입국 심사부터 식당 주문, 응급 상황까지 실전 대비!' : 'From immigration to dining out - practical conversations.'}</p>
        </div>
        
        <B.AiConversationCard {...props} />
        <B.PhraseBibleBanner {...props} />
        
        <div className="grid grid-cols-2 gap-5">
            <B.BibleCard {...props} />
            <B.DictionaryCard {...props} />
        </div>
        <div className="grid grid-cols-2 gap-5">
            <B.ReviewCard {...props} />
            <B.AiReportCard {...props} />
        </div>
    </div>
);

export const BusinessHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-5 animate-fade-in">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-200 rounded-3xl p-5 mb-2 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full flex items-center justify-center -mr-10 -mt-10 blur-xl"></div>
            <h3 className="font-black text-slate-800 text-lg mb-1 relative z-10">💼 {props.lang === 'ko' ? '프로페셔널 비즈니스' : 'Professional Business'}</h3>
            <p className="text-slate-600 text-xs font-bold leading-tight relative z-10">{props.lang === 'ko' ? '영어 회의, 이메일, 그리고 네트워킹을 위한 집중 훈련' : 'Intensive training for meetings, emails, and networking.'}</p>
        </div>

        <B.LiveChatBanner {...props} />
        
        <div className="grid grid-cols-2 gap-5">
            <B.AiConversationMiniCard {...props} />
            <B.DictionaryCard {...props} />
        </div>
        
        <B.PhraseBibleBanner {...props} />
        <B.BibleCard {...props} />
    </div>
);

export const CommHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-5 animate-fade-in">
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-3xl p-5 mb-2 shadow-sm">
            <h3 className="font-black text-rose-800 text-lg mb-1">🗣️ {props.lang === 'ko' ? '자연스러운 프리토킹' : 'Free Talking'}</h3>
            <p className="text-rose-600/80 text-xs font-bold leading-tight">{props.lang === 'ko' ? '언제 어디서든, 누구와든 자연스럽게 대화하세요.' : 'Speak naturally with anyone, anywhere.'}</p>
        </div>

        <B.LiveChatBanner {...props} />
        <B.AiConversationCard {...props} />
        <B.PhraseBibleBanner {...props} />
        
        <div className="grid grid-cols-2 gap-5">
            <B.DictionaryCard {...props} />
            <B.AiReportCard {...props} />
        </div>
    </div>
);

export const TestingHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-5 animate-fade-in">
        <B.LevelTestBanner {...props} />
        
        <div className="grid grid-cols-2 gap-5">
            <B.AiReportCard {...props} />
            <B.DictionaryCard {...props} />
        </div>
        
        <B.AiConversationCard {...props} />
        <B.ReviewCard {...props} />
    </div>
);
