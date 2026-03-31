
import React from 'react';
import {
    ChevronLeft,
    Trash2,
    Coins,
    ChevronRight,
    Book,
    MessageSquare,
    Shield,
    HelpCircle,
    Globe
} from 'lucide-react';
import { t } from '../i18n';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { decryptApiKey, encryptApiKey } from '../apiUtils';
import { auth } from '../firebase';

interface ProfileScreenProps {
    settings: any;
    setScreen: (s: string) => void;
    userPoints: number;
    currentLevel: number;
    equippedSkin: string;
    userInfo: any;
    firebaseUser: any;
    isPremium: boolean;
    setLegalDocInfo: (info: { id: string, title: string }) => void;
    setFeedbackInfo: (info: { type: 'praise' | 'suggest' | 'bug' }) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    settings,
    setScreen,
    userPoints,
    currentLevel,
    equippedSkin,
    userInfo,
    firebaseUser,
    isPremium,
    setLegalDocInfo,
    setFeedbackInfo
}) => {
    const lang = settings.lang || 'ko';
    
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
    const [apiKey, setApiKey] = React.useState(() => decryptApiKey(localStorage.getItem('vq_gemini_key') || ''));

    const skins: Record<string, { emoji: string; special?: string }> = {
        default: { emoji: '🐣' },
        ninja: { emoji: '🥷' },
        wizard: { emoji: '🧙‍♂️', special: 'animate-float' },
        king: { emoji: '👑', special: 'animate-float' },
        dragon: { emoji: '🐉', special: 'animate-float premium-shine' },
        alien: { emoji: '👽', special: 'animate-pulse' },
        robot: { emoji: '🤖', special: 'animate-pulse' },
        vampire: { emoji: '🧛', special: 'animate-float' },
        hero: { emoji: '🦸‍♂️', special: 'animate-float' },
        ghost: { emoji: '👻', special: 'animate-float opacity-80' },
        tiger: { emoji: '🐯', special: 'animate-pulse' },
        unicorn: { emoji: '🦄', special: 'animate-float premium-shine' },
        devil: { emoji: '😈', special: 'animate-float' },
        angel: { emoji: '😇', special: 'animate-float premium-shine' },
        cat: { emoji: '🐱' },
        dog: { emoji: '🐶' }
    };

    const skinData = skins[equippedSkin] || skins.default;

    const handleLogout = async () => {
        if (!firebaseUser) {
            setScreen('LOGIN');
            return;
        }

        if (!window.confirm(lang === 'ko' ? "정말 로그아웃 하시겠습니까?\n모든 학습 데이터가 서버에 안전하게 저장됩니다." : lang === 'ja' ? "本当にログアウトしますか？\nすべての学習データはサーバー에 안전하게 저장됩니다." : "Are you sure you want to log out?\nYour learning data will be safely stored on the server.")) {
            return;
        }

        try {
            setIsLoggingOut(true);
            
            // 1. Force final sync before logout
            window.dispatchEvent(new CustomEvent('voca_sync_checkpoint'));
            
            // Give a small delay for sync to start/complete and show the message
            await new Promise(r => setTimeout(r, 1500));

            // 2. Mark user as offline in Firestore
            const userM = await import('../userService');
            await userM.setUserOffline(firebaseUser.uid);

            const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.getPlatform() !== 'web';
            
            // 3. Native Google plugin Sign Out
            if (isNative) {
                try {
                    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
                    await FirebaseAuthentication.signOut();
                } catch (e) {
                    console.warn('Native Google sign out failed', e);
                }
            }

            // 4. Firebase Sign Out
            await auth.signOut();
            
            // 5. Always redirect to LOGIN screen
            setScreen('LOGIN');
        } catch (error: any) {
            console.error("Logout Error", error);
            setScreen('LOGIN');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const resetStudyInfo = () => {
        if (window.confirm(t(lang, "reset_confirm"))) {
            const keysToReset = ['vq_user', 'vq_review_done'];
            keysToReset.forEach(key => localStorage.removeItem(key));
            
            alert(lang === 'ko' ? "프로필 설정 초기화를 위해 온보딩 화면으로 이동합니다.\n(포인트와 레벨, 구매 내역은 안전하게 유지됩니다.)" : "Redirecting to onboarding to reset your profile.\n(Points, levels, and purchases are preserved.)");
            setScreen('ONBOARDING');
        }
    };

    return (
        <div className="screen animate-fade-in bg-slate-50 flex flex-col font-sans">
            <header className="flex items-center justify-between px-4 py-4 bg-slate-900 text-white z-20 shrink-0">
                <button onClick={() => setScreen('HOME')} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 active:scale-90 transition-all backdrop-blur-md">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-black tracking-tight italic uppercase">{t(lang, "my_profile")}</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="bg-slate-900 px-8 pt-4 pb-14 rounded-b-[50px] text-center shrink-0 shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                    <div className={`w-28 h-28 bg-white rounded-[32px] flex items-center justify-center text-6xl border-2 border-white/20 shadow-inner mx-auto mb-4 backdrop-blur-md cursor-pointer active:scale-90 transition-transform overflow-hidden ${skinData.special?.includes('premium-shine') ? 'premium-shine' : ''}`}>
                        <span className={skinData.special || ''}>
                            {skinData.emoji}
                        </span>
                    </div>
                    <h3 className="text-white text-xl font-black italic tracking-tight mb-1 uppercase">
                        {userInfo?.nickname || t(lang, "voca_warrior")}
                    </h3>
                    <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-6">
                        LV. {Math.max(0, currentLevel - 1)} • {firebaseUser?.email || t(lang, "unknown")}
                        {isPremium && (
                            <span className="ml-2 bg-indigo-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                Premium
                            </span>
                        )}
                    </p>
                    <div className="flex gap-3 max-w-[280px] mx-auto">
                        <div className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
                            <p className="text-[9px] font-black text-white/40 uppercase mb-1">{t(lang, "owned_points")}</p>
                            <p className="text-sm font-black text-white flex items-center justify-center gap-1.5">
                                <Coins size={14} className="text-yellow-400" /> {userPoints.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
                            <p className="text-[9px] font-black text-white/40 uppercase mb-1">{t(lang, "purpose")}</p>
                            <p className="text-sm font-black text-white truncate px-1">
                                {userInfo?.purpose === 'Travel & Daily' ? t(lang, 'purpose_travel') :
                                 userInfo?.purpose === 'Business' ? t(lang, 'purpose_business') :
                                 userInfo?.purpose === 'Exams' ? t(lang, 'purpose_exams') :
                                 userInfo?.purpose === 'Hobby' ? t(lang, 'purpose_hobby') :
                                 userInfo?.purpose || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-4 -mt-8 pb-32 space-y-8">
                    {/* Study Settings */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                            <h3 className="text-slate-800 font-black text-sm tracking-tight">{t(lang, "my_study_settings")}</h3>
                        </div>

                        <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-slate-50 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center p-5">
                                <span className="text-slate-600 font-bold">{t(lang, "age")}</span>
                                <span className="text-slate-800 font-black bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-sm">
                                    {userInfo?.age === 'Under 20s' ? t(lang, 'age_under_20s') :
                                     userInfo?.age === '20s' ? t(lang, 'age_20s') :
                                     userInfo?.age === '30s' ? t(lang, 'age_30s') :
                                     userInfo?.age === '40s' ? t(lang, 'age_40s') :
                                     userInfo?.age === '50s+' ? t(lang, 'age_50s_plus') :
                                     userInfo?.age || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-5">
                                <span className="text-slate-600 font-bold">{t(lang, "eng_level")}</span>
                                <span className="text-slate-800 font-black bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 text-sm">{userInfo?.engLevel || userInfo?.level || "N/A"}</span>
                            </div>
                            <button onClick={resetStudyInfo} className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all text-left group">
                                <span className="text-indigo-600 font-black">{t(lang, "reset_info")}</span>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </button>
                        </div>
                    </section>

                    {/* AI Settings */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                            <h3 className="text-slate-800 font-black text-sm tracking-tight">{t(lang, "ai_settings")}</h3>
                        </div>
                        <div className="bg-white rounded-[32px] overflow-hidden p-6 space-y-3 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-slate-600 font-bold block text-[10px] uppercase tracking-widest">Gemini API Key</label>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowApiKeyModal(true)}
                                        className="text-[9px] font-black text-indigo-500 hover:underline flex items-center gap-1"
                                    >
                                        <Globe size={10} />
                                        {t(lang, 'get_key_guide')}
                                    </button>
                                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md">AI</span>
                                </div>
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                onBlur={(e) => {
                                    if (e.target.value) {
                                      localStorage.setItem('vq_gemini_key', encryptApiKey(e.target.value));
                                    } else {
                                      localStorage.removeItem('vq_gemini_key');
                                    }
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 outline-none transition-all font-bold"
                                placeholder={t(lang, "ai_key_placeholder")}
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">{t(lang, "ai_key_tip")}</p>
                            {apiKey && (
                                <button
                                    onClick={() => {
                                        if (window.confirm(lang === 'ko' ? 'API Key를 삭제하시겠습니까?' : lang === 'ja' ? 'APIキーを削除しますか？' : 'Delete API Key?')) {
                                            localStorage.removeItem('vq_gemini_key');
                                            setApiKey('');
                                            alert(lang === 'ko' ? 'API Key가 삭제되었습니다.' : lang === 'ja' ? 'API키가 삭제되었습니다.' : 'API Key deleted.');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-100"
                                >
                                    <Trash2 size={14} />
                                    {lang === 'ko' ? 'API Key 삭제' : lang === 'ja' ? 'API키 삭제' : 'Delete API Key'}
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Account & System */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                            <h3 className="text-slate-800 font-black text-sm tracking-tight">{t(lang, "account_system")}</h3>
                        </div>
                        <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-slate-50 border border-slate-100 shadow-sm">
                            <button onClick={() => setScreen('STORE')} className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group">
                                <span className="text-slate-600 font-bold">{t(lang, "subscription_management")}</span>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                            </button>
                            <button 
                                onClick={handleLogout} 
                                disabled={isLoggingOut}
                                className={`w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className={firebaseUser ? "text-red-500 font-black" : "text-indigo-600 font-black"}>
                                    {isLoggingOut ? (lang === 'ko' ? "로그아웃 중..." : lang === 'ja' ? "로그아웃 중..." : "Logging out...") : (firebaseUser ? t(lang, "logout") : t(lang, "login_button"))}
                                </span>
                                <ChevronRight size={18} className={isLoggingOut ? "animate-pulse" : (firebaseUser ? "text-red-200" : "text-indigo-200")} />
                            </button>
                        </div>
                    </section>

                    {/* Support & Legal */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-slate-800 font-black text-sm tracking-tight">{t(lang, "help_center_legal")}</h3>
                        </div>
                        <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-slate-50 border border-slate-100 shadow-sm">
                            <button 
                                onClick={() => { setLegalDocInfo({ id: 'guide', title: t(lang, "app_guide") }); setScreen('LEGAL'); }}
                                className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                                        <Book size={16} />
                                    </div>
                                    <span className="text-slate-600 font-bold">{t(lang, "app_guide")}</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                            <button 
                                onClick={() => window.location.href = 'mailto:idouhak1@gmail.com?subject=[VocaQuest] Support Inquiry'}
                                className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                                        <HelpCircle size={16} />
                                    </div>
                                    <span className="text-slate-600 font-bold">{t(lang, "help_email")}</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                            <button 
                                onClick={() => { setLegalDocInfo({ id: 'terms', title: t(lang, "tos") }); setScreen('LEGAL'); }}
                                className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group"
                            >
                                <span className="text-slate-600 font-bold ml-11">{t(lang, "tos")}</span>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                            <button 
                                onClick={() => { setLegalDocInfo({ id: 'privacy', title: t(lang, "privacy_policy_ugc") }); setScreen('LEGAL'); }}
                                className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group"
                            >
                                <span className="text-slate-600 font-bold ml-11">{t(lang, "privacy_policy_ugc")}</span>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                            <button 
                                onClick={() => { setLegalDocInfo({ id: 'cancellation', title: t(lang, "cancel_info") }); setScreen('LEGAL'); }}
                                className="w-full flex justify-between items-center p-5 hover:bg-slate-50 transition-all group"
                            >
                                <span className="text-slate-600 font-bold ml-11">{t(lang, "cancel_info")}</span>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                        </div>
                    </section>

                    {/* Feedback Section */}
                    <section className="space-y-6 pt-4">
                        <div className="flex justify-center gap-12">
                            <button 
                                onClick={() => { setFeedbackInfo({ type: 'praise' }); setScreen('FEEDBACK'); }}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                            >
                                <div className="text-4xl hover:scale-125 transition-transform cursor-pointer">😍</div>
                                <span className="text-indigo-600 font-black text-xs">{t(lang, "praise_btn")}</span>
                            </button>
                            <button 
                                onClick={() => { setFeedbackInfo({ type: 'suggest' }); setScreen('FEEDBACK'); }}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                            >
                                <div className="text-4xl hover:scale-125 transition-transform cursor-pointer">🤔</div>
                                <span className="text-slate-400 font-black text-xs">{t(lang, "suggest_btn")}</span>
                            </button>
                        </div>
                        <p className="text-center text-slate-400 text-[10px] font-bold px-8 leading-relaxed">
                            {t(lang, "feedback_invite")}
                        </p>

                        <div className="bg-white/40 backdrop-blur-sm rounded-[40px] p-8 border border-white shadow-inner flex flex-col items-center text-center">
                            <h4 className="text-indigo-600 font-black text-lg mb-1">{t(lang, "beta_feedback_title")}</h4>
                            <p className="text-slate-400 text-[11px] font-bold mb-6">{t(lang, "beta_feedback_desc")}</p>
                            <button 
                                onClick={() => { setFeedbackInfo({ type: 'bug' }); setScreen('FEEDBACK'); }}
                                className="w-full bg-white border-2 border-indigo-100 rounded-3xl py-4 flex items-center justify-center gap-2 text-indigo-600 font-black shadow-sm active:scale-95 transition-all"
                            >
                                <MessageSquare size={20} />
                                {t(lang, "report_bug_feedback")}
                            </button>
                        </div>
                    </section>

                    {/* Admin Button */}
                    {userInfo?.isAdmin && (
                        <button 
                            onClick={() => setScreen('ADMIN')}
                            className="w-full bg-slate-800 text-white rounded-[32px] p-6 flex items-center justify-between shadow-xl shadow-slate-900/20 active:scale-95 transition-all border border-white/5 mt-10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Shield size={20} className="text-emerald-400" />
                                </div>
                                <span className="font-black italic tracking-wider">{t(lang, 'admin_panel_title')}</span>
                            </div>
                            <ChevronRight size={20} className="text-white/40" />
                        </button>
                    )}
                </div>
            </div>

            {/* Logout Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[40px] p-10 flex flex-col items-center shadow-2xl scale-110 translate-y-[-20px]">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">
                            {lang === 'ko' ? "로그아웃 중..." : lang === 'ja' ? "로그아웃 중..." : "Logging Out..."}
                        </h3>
                        <p className="text-slate-400 text-xs font-bold text-center leading-relaxed whitespace-pre-line">
                            {lang === 'ko' ? "데이터를 안전하게 서버로 저장 중입니다.\n잠시만 기다려 주세요." : lang === 'ja' ? "データを安全にサーバーに保存しています。\nしばらくお待ちください。" : "Safely saving your data to the server.\nPlease wait a moment."}
                        </p>
                    </div>
                </div>
            )}

            {/* API Key Guide Modal */}
            {showApiKeyModal && (
                <ApiKeyModal 
                    settings={settings} 
                    onClose={() => setShowApiKeyModal(false)}
                    isPremium={isPremium}
                />
            )}
        </div>
    );
};