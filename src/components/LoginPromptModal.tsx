import { Lock, Sparkles, X, UserPlus } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  lang?: string;
}

export function LoginPromptModal({ isOpen, onClose, onLogin, lang = 'ko' }: LoginPromptModalProps) {
  if (!isOpen) return null;

  const isKo = lang === 'ko';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in touch-none select-none">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-900/20 w-full max-w-sm overflow-hidden animate-slide-up relative">
        
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-purple-50" />
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-200/50 rounded-full blur-2xl" />
        <div className="absolute top-10 -left-10 w-24 h-24 bg-indigo-200/50 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center pt-8 pb-6 px-6 text-center">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative mb-5">
            <div className="w-20 h-20 bg-indigo-600 rounded-[28px] rotate-3 shadow-lg flex items-center justify-center text-white">
              <Lock size={36} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl -rotate-12 shadow-sm flex items-center justify-center text-white">
              <Sparkles size={22} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3">
            {isKo ? '로그인이 필요한' : 'Login Required'}<br />
            <span className="text-indigo-600">{isKo ? '프리미엄 기능' : 'Premium Feature'}</span>{isKo ? '입니다' : ''}
          </h3>
          
          <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-8 px-2">
            {isKo 
              ? '가입 후 진단 테스트, 퀴즈, 실시간 대화 등 놀라운 기능들을 평생 무료로 활용해보세요!' 
              : 'Sign up to unblock evaluation tests, quizzes, live chats and much more for free!'}
          </p>

          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={onLogin}
              className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
            >
              <UserPlus size={20} />
              {isKo ? '1초 만에 무료 시작하기' : 'Start for free in 1 sec'}
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-transparent text-slate-500 hover:bg-slate-50 h-12 rounded-2xl font-bold text-[15px]"
            >
              {isKo ? '조금 더 둘러볼게요' : 'Maybe later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
