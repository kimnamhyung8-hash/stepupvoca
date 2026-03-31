
import React, { useState } from 'react';
import { ChevronLeft, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { t } from '../i18n';

interface FeedbackScreenProps {
    settings: any;
    userInfo: any;
    onBack: () => void;
    initialType?: 'praise' | 'suggest' | 'bug';
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ settings, userInfo, onBack, initialType = 'suggest' }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState(initialType);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const lang = settings.lang || 'ko';

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSending(true);
        try {
            await addDoc(collection(db, 'feedbacks'), {
                userId: userInfo?.uid || 'anonymous',
                userName: userInfo?.nickname || 'Anonymous User',
                userEmail: userInfo?.email || '',
                type,
                content,
                status: 'open',
                createdAt: serverTimestamp(),
                deviceInfo: navigator.userAgent
            });
            setIsSent(true);
            setTimeout(() => {
                onBack();
            }, 2000);
        } catch (err) {
            console.error("Feedback error:", err);
            alert(t(lang, "feedback_send_error"));
        } finally {
            setIsSending(false);
        }
    };

    if (isSent) {
        return (
            <div className="screen bg-white flex flex-col items-center justify-center p-10 animate-fade-in text-center font-sans">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 italic tracking-tighter mb-2 italic">THANK YOU!</h2>
                <p className="text-slate-400 font-bold leading-relaxed">{t(lang, "feedback_success")}</p>
            </div>
        );
    }

    return (
        <div className="screen bg-slate-50 flex flex-col font-sans animate-fade-in">
            <header className="flex items-center justify-between px-4 py-4 bg-slate-900 text-white z-20 shrink-0">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 active:scale-90 transition-all backdrop-blur-md">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-sm font-black tracking-tight italic uppercase">{t(lang, "feedback_title")}</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="bg-white rounded-[40px] p-8 space-y-8 border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all"></div>
                    
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t(lang, "feedback_type")}</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'praise', label: '😍', text: t(lang, "praise_btn") },
                                { id: 'suggest', label: '🤔', text: t(lang, "suggest_btn") },
                                { id: 'bug', label: '🐛', text: t(lang, "report_bug_btn") }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setType(item.id as any)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 p-4 rounded-3xl transition-all border-2 ${
                                        type === item.id 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-lg shadow-indigo-500/5' 
                                        : 'bg-slate-50 border-transparent text-slate-400'
                                    }`}
                                >
                                    <span className={`text-2xl transition-transform ${type === item.id ? 'scale-125' : ''}`}>{item.label}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{item.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t(lang, "feedback_content")}</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-[32px] p-6 font-bold text-slate-700 leading-relaxed outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                            placeholder={t(lang, "feedback_placeholder")}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSending || !content.trim()}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-[32px] py-6 font-black text-lg shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSending ? <RefreshCw size={24} className="animate-spin" /> : <Send size={24} />}
                        {t(lang, "feedback_submit")}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 mt-2 italic px-4">
                        {t(lang, "feedback_footer_msg")}
                    </p>
                </div>
            </div>
        </div>
    );
};
