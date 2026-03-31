import React from 'react';
import { X, Shield, FileText, CreditCard } from 'lucide-react';
import { t } from '../i18n';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tos' | 'privacy' | 'refund';
  lang: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type, lang }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'tos': return t(lang, 'legal_tos_title');
      case 'privacy': return t(lang, 'legal_privacy_title');
      case 'refund': return t(lang, 'legal_cancel_title');
      default: return '';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'tos': return t(lang, 'legal_tos_v2_text');
      case 'privacy': return t(lang, 'legal_privacy_v2_text');
      case 'refund': return t(lang, 'legal_cancel_v2_text');
      default: return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'tos': return <FileText className="text-indigo-600" size={24} />;
      case 'privacy': return <Shield className="text-emerald-600" size={24} />;
      case 'refund': return <CreditCard className="text-rose-600" size={24} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-scale-up">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{getTitle()}</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t(lang, 'help_center_legal')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="prose prose-slate max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed text-base">
              {getContent()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            {t(lang, 'confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
