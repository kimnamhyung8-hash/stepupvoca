import { useState } from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { t } from '../i18n';
import { encryptApiKey, decryptApiKey } from '../apiUtils';

interface ApiKeyModalProps {
    settings: any;
    onClose: () => void;
    onSave?: (newKey: string) => void;
    isPremium?: boolean;
}

export function ApiKeyModal({ settings, onClose, onSave, isPremium }: ApiKeyModalProps) {
    const lang = settings?.lang || 'ko';
    // Get current key for display in input
    const [tempApiKey, setTempApiKey] = useState(() => decryptApiKey(localStorage.getItem('vq_gemini_key') || ''));

    const handleSaveApiKey = () => {
        if (!tempApiKey.trim()) return;
        const encrypted = encryptApiKey(tempApiKey.trim());
        localStorage.setItem('vq_gemini_key', encrypted);
        if (onSave) onSave(tempApiKey.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in" style={{ zIndex: 99999 }}>
            <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                <div className="relative mb-6">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2 italic uppercase">
                        <Sparkles className="text-indigo-400" size={24} />
                        {t(lang, 'api_key_required_title')}
                    </h3>
                    {!isPremium && (
                        <div className="absolute -top-6 -right-2 bg-yellow-400 rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow-lg border-2 border-[#161B22] animate-pulse">PRO</div>
                    )}
                </div>

                <div className="space-y-5 text-sm">
                    <p className="text-slate-400 font-bold leading-relaxed px-1">
                        {t(lang, 'api_key_missing')}
                    </p>

                    {/* Step 1: Get Key */}
                    <div className="bg-white/5 rounded-[24px] p-5 border border-white/10 shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-black">1</div>
                            <h4 className="text-indigo-300 font-black uppercase tracking-tight">{t(lang, 'api_key_guide_method')}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-4 font-medium leading-relaxed">
                            {t(lang, 'api_key_guide_method_desc')}
                        </p>
                        <button
                            onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                            className="text-xs font-black bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-4 py-3 rounded-xl active:scale-95 transition flex items-center justify-center w-full gap-2 hover:bg-indigo-600/30"
                        >
                            {t(lang, 'goto_ai_studio')} <Globe size={14} />
                        </button>
                    </div>

                    {/* Step 2: Input Key */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-[24px] p-5 border border-emerald-500/20 shadow-inner">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">2</div>
                            <h4 className="text-emerald-300 font-black uppercase tracking-tight">{t(lang, 'api_key_guide_apply')}</h4>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="password"
                                value={tempApiKey}
                                onChange={(e) => setTempApiKey(e.target.value)}
                                placeholder="Paste Gemini API Key here..."
                                className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-emerald-400 focus:bg-black/60 outline-none transition-all placeholder:text-slate-600"
                            />
                            <button
                                onClick={handleSaveApiKey}
                                className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black text-sm active:translate-y-0.5 active:shadow-none transition shadow-[0_4px_0_#065F46] hover:bg-emerald-500"
                            >
                                {t(lang, 'save') || 'APPLY KEY'}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 text-slate-500 py-2 font-black transition active:scale-95 text-[11px] uppercase tracking-widest"
                >
                    {t(lang, 'close')}
                </button>
            </div>
        </div>
    );
}
