import React from 'react';
import { BookOpen, Plane, Briefcase, MessageCircle, BarChart, X } from 'lucide-react';
import { t } from '../i18n';

interface PurposeSelectionModalProps {
    lang: string;
    onSelect: (purpose: string) => void;
    onClose?: () => void;
    canClose?: boolean;
}

export const PurposeSelectionModal: React.FC<PurposeSelectionModalProps> = ({ lang, onSelect, onClose, canClose = true }) => {
    const isKo = lang === 'ko';

    const purposes = [
        { 
            id: 'LEARNING', 
            icon: BookOpen, 
            title: t(lang, 'purpose_learning_title'), 
            desc: t(lang, 'purpose_learning_desc'),
            gradient: 'from-indigo-500 to-indigo-600',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600'
        },
        { 
            id: 'TRAVEL', 
            icon: Plane, 
            title: t(lang, 'purpose_travel_title'), 
            desc: t(lang, 'purpose_travel_desc'),
            gradient: 'from-sky-500 to-sky-600',
            bg: 'bg-sky-50',
            text: 'text-sky-600'
        },
        { 
            id: 'BUSINESS', 
            icon: Briefcase, 
            title: t(lang, 'purpose_business_title'), 
            desc: t(lang, 'purpose_business_desc'),
            gradient: 'from-slate-700 to-slate-800',
            bg: 'bg-slate-100',
            text: 'text-slate-800'
        },
        { 
            id: 'COMMUNICATION', 
            icon: MessageCircle, 
            title: t(lang, 'purpose_comm_title'), 
            desc: t(lang, 'purpose_comm_desc'),
            gradient: 'from-rose-500 to-rose-600',
            bg: 'bg-rose-50',
            text: 'text-rose-600'
        },
        { 
            id: 'TESTING', 
            icon: BarChart, 
            title: t(lang, 'purpose_test_title'), 
            desc: t(lang, 'purpose_test_desc'),
            gradient: 'from-fuchsia-500 to-fuchsia-600',
            bg: 'bg-fuchsia-50',
            text: 'text-fuchsia-600'
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 relative">
                    {canClose && onClose && (
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                        {isKo ? '어떤 목적으로' : 'What is your primary'} <br/>
                        <span className="text-indigo-600">{isKo ? 'VocaQuest' : 'purpose'}</span> {isKo ? '를 이용하시나요?' : 'here?'}
                    </h2>
                    <p className="text-slate-500 text-sm font-bold mt-2">
                        {isKo ? '선택하신 목적에 맞게 메인 화면이 최적화됩니다. (언제든 변경 가능)' : 'We will optimize your home screen based on your choice. (Can be changed anytime)'}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                    {purposes.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => onSelect(p.id)}
                                className="w-full relative overflow-hidden bg-white border border-slate-100 rounded-[24px] p-4 flex items-center gap-4 text-left shadow-sm active:scale-95 transition-all group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${p.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className={`w-14 h-14 rounded-2xl ${p.bg} ${p.text} flex items-center justify-center shrink-0`}>
                                    <Icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-800 text-[15px]">{p.title}</h3>
                                    <p className="text-slate-500 text-[11px] font-bold mt-0.5">{p.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
