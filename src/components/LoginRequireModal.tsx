import React from 'react';
import { t } from '../i18n';
import { Lock, Sparkles, X } from 'lucide-react';

interface LoginRequireModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

export function LoginRequireModal({ onLogin, onCancel }: LoginRequireModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3 whitespace-pre-wrap">
          {t('login_require_title')}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 whitespace-pre-wrap">
          {t('login_require_desc')}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-500/30 transform transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5 text-indigo-100" />
            <span>{t('login_require_btn')}</span>
          </button>
          
          <button
            onClick={onCancel}
            className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          >
            {t('login_require_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
