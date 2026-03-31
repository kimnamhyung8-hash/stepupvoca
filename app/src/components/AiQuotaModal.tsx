import { Sparkles, Key, Zap, Clock } from 'lucide-react';
import { t } from '../i18n';

interface AiQuotaModalProps {
    settings: any;
    onClose: () => void;
    onGoPremium: () => void;
    onEnterKey: () => void;
    onPressGuide: () => void;
}

export function AiQuotaModal({ settings, onClose, onGoPremium, onEnterKey, onPressGuide }: AiQuotaModalProps) {
    const lang = settings?.lang || 'ko';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-fade-in" style={{ zIndex: 999999 }}>
            <div className="bg-[#0D1117] border-2 border-indigo-500/30 rounded-[32px] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 blur-[80px]" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[80px]" />

                <div className="relative text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4 animate-bounce-slow">
                        <Sparkles className="text-white" size={40} />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                            {t(lang, 'ai_quota_title')}
                        </h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed px-2">
                            {t(lang, 'ai_quota_desc')}
                        </p>
                        <button 
                            onClick={onPressGuide}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors border border-indigo-500/20"
                        >
                            <Sparkles size={12} className="text-indigo-400" />
                            <span className="text-[11px] font-bold text-indigo-300">
                                {t(lang, 'ai_quota_guide')}
                            </span>
                        </button>
                    </div>

                    <div className="space-y-3 pt-4">
                        {/* Option 1: Premium */}
                        <button
                            onClick={onGoPremium}
                            className="w-full group relative flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl active:scale-95 transition shadow-lg hover:shadow-indigo-500/25"
                        >
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Zap className="text-white fill-white" size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-black text-sm uppercase tracking-tighter">
                                    {t(lang, 'premium_subscribe_now')}
                                </div>
                                <div className="text-indigo-100 text-[10px] font-bold opacity-80">
                                    {lang === 'ko' ? '광고 없이 모든 기능을 무제한으로' : 'No ads, unlimited AI access'}
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Enter Key */}
                        <button
                            onClick={onEnterKey}
                            className="w-full group flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl active:scale-95 transition hover:bg-white/10"
                        >
                            <div className="bg-emerald-500/20 p-2 rounded-xl">
                                <Key className="text-emerald-400" size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-emerald-300 font-black text-sm uppercase tracking-tighter">
                                    {t(lang, 'api_key_required_title')}
                                </div>
                                <div className="text-slate-500 text-[10px] font-bold">
                                    {lang === 'ko' ? '내 키를 사용해 무료로 무제한 이용' : 'Unlimited use with your own key'}
                                </div>
                            </div>
                        </button>

                        {/* Option 3: Wait */}
                        <button
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-300 transition"
                        >
                            <Clock size={14} />
                            {t(lang, 'confirm_ok')}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
