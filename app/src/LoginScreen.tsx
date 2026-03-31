import { useState } from 'react';
import { ChevronLeft, Sparkles, ShieldCheck, Globe, Zap } from 'lucide-react';
import { t } from './i18n';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export function LoginScreen({ settings, setScreen }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const lang = settings.lang || 'ko';
    const isNative = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.getPlatform() !== 'web';

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            if (isNative) {
                console.log("Native Firebase Login starting...");
                try {
                    const result = await FirebaseAuthentication.signInWithGoogle();
                    console.log("Native Firebase Login result received:", result);

                    if (!result || !result.credential || !result.credential.idToken) {
                        alert("구글 인증 정보(Token)가 누락되었습니다. 에러 리포트: " + JSON.stringify(result).substring(0, 100));
                        setIsLoading(false);
                        return;
                    }

                    // accessToken이 undefined일 경우 웹 SDK가 뻗는 증상을 방지하기 위해 idToken만 명시적 전달
                    const credential = GoogleAuthProvider.credential(result.credential.idToken);
                    await signInWithCredential(auth, credential);
                    setScreen('HOME');
                } catch (err: any) {
                    setIsLoading(false);
                    console.error("FirebaseAuthentication plugin error:", err);
                    const errMsg = String(err.message || '').toLowerCase();
                    if (errMsg.includes('canceled') || errMsg.includes('cancelled') || String(err.code) === '12501') {
                        return;
                    }
                    alert(`구글 로그인 오류: ${err.message || '알 수 없는 오류'}`);
                }
            } else {
                console.log("Web Login starting...");

                // 인앱 브라우저(카카오톡 등) 구글 로그인 차단 방어 로직
                const ua = navigator.userAgent.toLowerCase();
                const isKakaotalk = ua.includes('kakaotalk');
                const isInstagram = ua.includes('instagram');
                const isFacebook = ua.includes('fbav') || ua.includes('fban');
                const isLine = ua.includes('line');

                if (isKakaotalk || isInstagram || isFacebook || isLine) {
                    alert("현재 카카오톡 등 앱 내부 브라우저를 사용중입니다.\n\n구글의 보안 정책상 여기서는 로그인이 불가능합니다.\n오른쪽 아래(또는 위)의 [︙] 버튼을 눌러 '다른 브라우저로 열기(크롬/사파리)'를 선택해주세요!");
                    if (isKakaotalk) {
                        window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
                    }
                    setIsLoading(false);
                    return;
                }
                
                // 항상 계정 선택창이 뜨도록 설정
                googleProvider.setCustomParameters({
                    prompt: 'select_account'
                });

                await signInWithPopup(auth, googleProvider);
                setScreen('HOME');
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            
            // auth/popup-closed-by-user: 사용자가 팝업창을 닫은 경우
            // auth/cancelled-popup-request: 이전 팝업 요청이 취소된 경우
            const errorCode = error.code || '';
            if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
                console.log("Login popup closed or cancelled by user.");
                return;
            }

            if (errorCode === 'auth/network-request-failed') {
                alert(lang === 'ko' 
                    ? "네트워크 연결이 불안정합니다.\n인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요! (AdBlock 등이 로그인 도메인을 차단하고 있을 수도 있습니다.)" 
                    : "Network connection failed.\nPlease check your internet and try again in a few seconds.");
                return;
            }

            alert(`로그인 실패: ${error.message}\n(에러 코드: ${errorCode})`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="screen bg-[#0A0A0E] flex flex-col text-white animate-fade-in overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <header className="p-6 flex items-center justify-between relative z-10">
                <button onClick={() => setScreen('HOME')}
 className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-black tracking-[0.3em] uppercase text-indigo-400">VocaQuest Account</span>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-8 animate-float">
                    <Sparkles size={48} className="text-white" />
                </div>

                <h1 className="text-4xl font-black tracking-tighter mb-4 leading-tight whitespace-pre-line">
                    {t(lang, 'login_title_main')}
                </h1>

                <p className="text-slate-400 font-medium mb-12 max-w-[280px] leading-relaxed">
                    {t(lang, 'login_desc_main')}
                </p>

                <div className="w-full max-w-sm space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white text-slate-900 py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Globe size={24} className="text-indigo-600" />
                                {t(lang, 'continue_google')}
                            </>
                        )}
                    </button>

                    {!isNative && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                            Membership Only Access on Web
                        </p>
                    )}

                    {isNative && (
                        <button
                            onClick={() => setScreen('HOME')}
                            className="w-full bg-white/5 text-slate-400 py-5 rounded-[24px] font-black text-sm border border-white/5 hover:bg-white/10 transition-all"
                        >
                            {t(lang, 'maybe_later')}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-sm">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-2">
                        <Zap size={20} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t(lang, 'fast_payment')}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t(lang, 'secure_sync')}</span>
                    </div>
                </div>
            </main>

            <footer className="p-10 text-center relative z-10">
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                    {t(lang, 'login_footer_tos')}
                </p>
            </footer>
        </div>
    );
}
