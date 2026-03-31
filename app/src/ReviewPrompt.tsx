import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Star, MessageSquare, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { markNeverAsk, markPromptShown, requestNativeReview } from './review';

interface ReviewPromptProps {
    lang: string;
    onClose: () => void;
    onNavigateFeedback?: () => void;
    isPremium?: boolean;
}

const copy: Record<string, any> = {
    ko: {
        step1_q: 'VocaQuest와 함께하는\n단어 학습이 도움이 되고 있나요?',
        step1_yes: '네, 아주 좋아요! 👍',
        step1_no: '아직 아쉬운 점이 있어요',
        step2_pos_title: '응원해 주셔서 감사해요! 🎉',
        step2_pos_desc: '별점 하나가 저희에게 큰 힘이 됩니다.\n스토어에 평가를 남겨주시겠어요?',
        step2_pos_cta: '⭐ 별점 남기기',
        step2_pos_skip: '다음에 할게요',
        step2_neg_title: '소중한 의견 감사해요 🙏',
        step2_neg_desc: '어떤 점이 불편하셨는지 알려주시면\n더 좋은 앱으로 개선하겠습니다!',
        step2_neg_cta: '💬 개선 의견 보내기',
        step2_neg_skip: '괜찮아요',
        never: '다시 묻지 않기',
    },
    en: {
        step1_q: 'Is VocaQuest helping\nyou learn English?',
        step1_yes: "Yes, I love it! 👍",
        step1_no: "Not quite yet",
        step2_pos_title: 'Thanks for your support! 🎉',
        step2_pos_desc: 'A quick rating helps us grow.\nWould you leave us a review?',
        step2_pos_cta: '⭐ Rate on Play Store',
        step2_pos_skip: 'Maybe later',
        step2_neg_title: 'We appreciate your honesty 🙏',
        step2_neg_desc: "Tell us what's not working\nand we'll make it better!",
        step2_neg_cta: '💬 Send Feedback',
        step2_neg_skip: "I'm okay",
        never: "Don't ask again",
    },
};

function getC(lang: string) {
    return copy[lang] || copy['en'];
}

export function ReviewPrompt({ lang, onClose, onNavigateFeedback, isPremium = false }: ReviewPromptProps) {
    const [step, setStep] = useState<'q' | 'pos' | 'neg'>('q');
    const c = getC(lang);

    const handleYes = () => setStep('pos');
    const handleNo = () => setStep('neg');

    const handleRateStore = async () => {
        markPromptShown();
        await requestNativeReview();
        onClose();
    };

    const handleFeedback = () => {
        markPromptShown();
        if (onNavigateFeedback) onNavigateFeedback();
        onClose();
    };

    const handleSkip = () => {
        markPromptShown();
        onClose();
    };

    const handleNeverAsk = () => {
        markNeverAsk();
        onClose();
    };

    const showAds = Capacitor.getPlatform() !== 'web' && !isPremium;

    return (
        <div 
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in"
            style={{ paddingBottom: showAds ? 'calc(var(--ad-height) + 2rem)' : '2rem' }}
        >
            <div className="w-full max-w-sm bg-white rounded-[32px] p-7 shadow-2xl flex flex-col items-center text-center gap-5">

                {step === 'q' && (
                    <>
                        <div className="w-16 h-16 bg-yellow-100 rounded-[22px] flex items-center justify-center text-3xl shadow-inner">
                            ⭐
                        </div>
                        <div>
                            <h2 className="text-[17px] font-black text-slate-900 leading-snug whitespace-pre-line">
                                {c.step1_q}
                            </h2>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={handleYes}
                                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-indigo-500/30"
                            >
                                <ThumbsUp size={18} />
                                {c.step1_yes}
                            </button>
                            <button
                                onClick={handleNo}
                                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition"
                            >
                                <ThumbsDown size={16} />
                                {c.step1_no}
                            </button>
                        </div>
                        <button onClick={handleNeverAsk}
 className="text-slate-300 text-xs font-bold underline">
                            {c.never}
                        </button>
                    </>
                )}

                {step === 'pos' && (
                    <>
                        <div className="text-5xl animate-bounce-slow">🎉</div>
                        <div>
                            <h2 className="text-[17px] font-black text-slate-900 mb-1">{c.step2_pos_title}</h2>
                            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{c.step2_pos_desc}</p>
                        </div>
                        <div className="flex w-full gap-3">
                            {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n}
 size={28} className="text-yellow-400 fill-yellow-400 flex-1" />
                            ))}
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={handleRateStore}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-[15px] active:scale-95 transition shadow-lg shadow-orange-500/30"
                            >
                                {c.step2_pos_cta}
                            </button>
                            <button onClick={handleSkip}
 className="text-slate-400 text-sm font-bold">
                                {c.step2_pos_skip}
                            </button>
                        </div>
                    </>
                )}

                {step === 'neg' && (
                    <>
                        <div className="text-5xl">🙏</div>
                        <div>
                            <h2 className="text-[17px] font-black text-slate-900 mb-1">{c.step2_neg_title}</h2>
                            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{c.step2_neg_desc}</p>
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={handleFeedback}
                                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[15px] flex items-center justify-center gap-2 active:scale-95 transition"
                            >
                                <MessageSquare size={18} />
                                {c.step2_neg_cta}
                            </button>
                            <button onClick={handleSkip}
 className="text-slate-400 text-sm font-bold">
                                {c.step2_neg_skip}
                            </button>
                        </div>
                    </>
                )}

                <button onClick={onClose}
 className="absolute top-5 right-5 text-slate-300 active:scale-90 transition">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
