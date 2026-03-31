
import React from 'react';
import { X, Layers } from 'lucide-react';
import { t } from '../i18n';

interface WidgetInstallPopupProps {
    isVisible: boolean;
    onClose: () => void;
    settings: any;
}

export const WidgetInstallPopup: React.FC<WidgetInstallPopupProps> = ({
    isVisible,
    onClose,
    settings
}) => {
    if (!isVisible) return null;
    const lang = settings.lang || 'ko';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative animate-slide-up">
                <button onClick={onClose}
 className="absolute top-6 right-6 p-2 text-slate-300">
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-6">
                    <Layers size={32} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 italic">{t(lang, 'install_widget')}</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">
                    {t(lang, 'widget_promo_desc')}
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg"
                >
                    {t(lang, 'confirm_ok')}
                </button>
            </div>
        </div>
    );
};
