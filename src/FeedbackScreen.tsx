import { useState, useRef } from 'react';
import { Send, AlertCircle, Sparkles, MessageSquare, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { t } from './i18n';

interface FeedbackScreenProps {
    settings: any;
    setScreen: (s: string) => void;
    userInfo: any;
}

export function FeedbackScreen({ settings, setScreen, userInfo }: FeedbackScreenProps) {
    const [type, setType] = useState<'bug' | 'suggest' | 'other'>('suggest');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles).map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setIsSubmitting(true);

        try {
            // Save to Firebase
            await addDoc(collection(db, 'feedbacks'), {
                userId: userInfo?.uid || 'anonymous',
                userName: userInfo?.nickname || 'Anonymous',
                type,
                message,
                deviceInfo: navigator.userAgent,
                status: 'open',
                createdAt: serverTimestamp(),
                dateDetails: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to save feedback", e);
        }

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-28 h-28 bg-green-50 rounded-[40px] flex items-center justify-center mb-8 border border-green-100 shadow-xl shadow-green-500/10">
                    <CheckCircle2 size={56} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter">{t(settings.lang, 'feedback_success_title')}</h2>
                <p className="text-slate-500 font-bold text-sm mb-12 leading-relaxed px-6">
                    {t(settings.lang, 'feedback_success')}
                </p>
                <button
                    onClick={() => setScreen('PROFILE')}
                    className="w-full max-w-sm bg-slate-100 text-slate-600 py-5 rounded-3xl font-black active:scale-95 transition-all border border-slate-200"
                >
                    {t(settings.lang, 'back_to_profile')}
                </button>
            </div>
        );
    }

    return (
        <div className="screen bg-[#F8FAFC] flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <button onClick={() => setScreen('PROFILE')}
 className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">{t(settings.lang, 'send_feedback')}</h2>
                <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto p-6 pb-40 space-y-8">
                {/* Intro */}
                <div className="flex items-start gap-4 p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8"></div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-50 relative z-10 shrink-0">
                        <Sparkles size={24} className="text-primary" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-800 font-black text-sm mb-1.5">{t(settings.lang, 'feedback_desc')}</h3>
                        <p className="text-slate-500 font-bold text-[11px] leading-relaxed">
                            We read every single message. Help us build the best vocabulary app together!
                        </p>
                    </div>
                </div>

                {/* Type Selection */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {t(settings.lang, 'feedback_type')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'bug', label: t(settings.lang, 'feedback_bug'), icon: <AlertCircle size={16} />, color: 'red' },
                            { id: 'suggest', label: t(settings.lang, 'feedback_suggest'), icon: <Sparkles size={16} />, color: 'indigo' },
                            { id: 'other', label: t(settings.lang, 'feedback_other'), icon: <MessageSquare size={16} />, color: 'slate' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setType(btn.id as any)}
                                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-3xl border-2 transition-all active:scale-95 ${type === btn.id
                                    ? `bg-slate-800 border-slate-800 text-white shadow-xl`
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                {btn.icon}
                                <span className="text-[11px] font-black">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end ml-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            {t(settings.lang, 'feedback_detail_label')}
                        </label>
                        <span className={`text-[11px] font-black ${message.length > 500 ? 'text-red-500' : 'text-slate-300'}`}>
                            {message.length}/500
                        </span>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                        placeholder={t(settings.lang, 'feedback_msg_placeholder')}
                        rows={6}
                        className="w-full bg-white border-2 border-slate-100 rounded-[32px] p-6 text-slate-800 font-bold placeholder-slate-300 text-sm outline-none focus:border-primary/30 transition-all resize-none leading-relaxed shadow-sm"
                    />
                </div>

                {/* File Attachment */}
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 pl-1">
                        {t(settings.lang, 'feedback_attach_file')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {files.map((file, idx) => (
                            <div key={idx}
 className="relative aspect-square rounded-[24px] overflow-hidden border border-slate-100 bg-white group shadow-sm">
                                <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-red-500 rounded-full p-2 text-white active:scale-90 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {files.length < 5 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/50 transition-all active:scale-95 bg-slate-50"
                            >
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100"><ImageIcon size={20} /></div>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{t(settings.lang, 'add_photo')}</span>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 font-bold ml-1">
                        {t(settings.lang, 'feedback_file_limit')} (Up to 5)
                    </p>
                </div>

                {/* Info */}
                <div className="flex items-center gap-3 px-2 py-4 border-t border-slate-100 mt-4">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-glow shadow-indigo-500" />
                    <p className="text-[11px] text-slate-400 font-bold italic tracking-tight">
                        {t(settings.lang, 'feedback_info_footer')} ({userInfo?.nickname || 'Guest'})
                    </p>
                </div>
            </div>

            {/* Footer / Submit */}
            <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-30">
                <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className={`three-d-btn w-full h-16 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 transition-all ${!message.trim() || isSubmitting
                        ? 'bg-slate-100 text-slate-300'
                        : 'bg-primary text-white shadow-[0_8px_0_#3730A3] active:shadow-none'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={20} />
                            {t(settings.lang, 'feedback_submit')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
