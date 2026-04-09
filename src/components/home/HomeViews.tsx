import React from 'react';
import * as B from './HomeButtons';
import { t } from '../../i18n';

interface ViewProps {
    lang: string;
    setScreen: (s: string) => void;
    currentLevel: number;
    setActiveStudyLevel: (lvl: number) => void;
    setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
}

export const LearningHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-4 animate-fade-in pb-4">
        <B.MasteryBanner {...props} />
        <B.StudyLevelCard {...props} />
        <B.ReviewCard {...props} />
        <B.DictionaryCard {...props} />
        <B.BattleCard {...props} />
        <B.MinigameCard {...props} />
        <B.AiReportCard {...props} />
        <B.PhraseBibleBanner {...props} />
        <B.CommunityBanner {...props} />
    </div>
);

export const TravelHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-4 animate-fade-in pb-4">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-[32px] p-5 mb-2 shadow-sm">
            <h3 className="font-black text-sky-800 text-lg mb-1">✈️ {t(props.lang, 'purpose_travel_title')}</h3>
            <p className="text-sky-600/80 text-xs font-bold leading-tight">{t(props.lang, 'purpose_travel_desc')}</p>
        </div>
        <B.PhraseBibleBanner {...props} />
        <B.DictionaryCard {...props} />
        <B.ReviewCard {...props} />
        <B.AiConversationCard {...props} />
        <B.BibleCard {...props} />
        <B.AiReportCard {...props} />
        <B.CommunityBanner {...props} />
    </div>
);

export const BusinessHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-4 animate-fade-in pb-4">
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-200 rounded-[32px] p-5 mb-2 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full flex items-center justify-center -mr-10 -mt-10 blur-xl"></div>
            <h3 className="font-black text-slate-800 text-lg mb-1 relative z-10">💼 {t(props.lang, 'purpose_business_title')}</h3>
            <p className="text-slate-600 text-xs font-bold leading-tight relative z-10">{t(props.lang, 'purpose_business_desc')}</p>
        </div>
        <B.PhraseBibleBanner {...props} />
        <B.AiConversationCard {...props} />
        <B.DictionaryCard {...props} />
        <B.LiveChatBanner {...props} />
        <B.BibleCard {...props} />
        <B.CommunityBanner {...props} />
    </div>
);

export const CommHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-4 animate-fade-in pb-4">
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-[32px] p-5 mb-2 shadow-sm">
            <h3 className="font-black text-rose-800 text-lg mb-1">🗣️ {t(props.lang, 'purpose_comm_title')}</h3>
            <p className="text-rose-600/80 text-xs font-bold leading-tight">{t(props.lang, 'purpose_comm_desc')}</p>
        </div>
        <B.PhraseBibleBanner {...props} />
        <B.DictionaryCard {...props} />
        <B.AiConversationCard {...props} />
        <B.LiveChatBanner {...props} />
        <B.AiReportCard {...props} />
        <B.CommunityBanner {...props} />
    </div>
);

export const TestingHomeView: React.FC<ViewProps> = (props) => (
    <div className="space-y-4 animate-fade-in pb-4">
        <B.LevelTestBanner {...props} />
        <B.AiReportCard {...props} />
        <B.DictionaryCard {...props} />
        <B.ReviewCard {...props} />
        <B.PhraseBibleBanner {...props} />
        <B.AiConversationCard {...props} />
        <B.CommunityBanner {...props} />
    </div>
);
