
import React from 'react';
import {
    X,
    Crown,
    Zap,
    Sparkles,
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import { PRODUCTS, purchaseProduct, getProducts, type ProductInfo } from '../billing';

interface PaywallPopupProps {
    isVisible: boolean;
    onClose: () => void;
    setIsPremium: (v: boolean) => void;
    settings: any;
}

export const PaywallPopup: React.FC<PaywallPopupProps> = ({
    isVisible,
    onClose,
    setIsPremium,
    settings
}) => {
    const [dbProducts, setDbProducts] = React.useState<ProductInfo[]>([]);
    
    React.useEffect(() => {
        if (isVisible) {
            getProducts(settings.lang || 'ko').then(setDbProducts);
        }
    }, [isVisible, settings.lang]);

    const getPrice = (id: string, fallback: string) => {
        const found = dbProducts.find(p => p.id === id);
        return found ? found.price : fallback;
    };

    if (!isVisible) return null;

    const lang = settings.lang || 'ko';

    const benefits = [
        { icon: <Zap className="text-amber-500" />, title: lang === 'ko' ? "무제한 AI 학습" : "Unlimited AI Study", desc: lang === 'ko' ? "일일 AI 사용 제한이 완전히 해제됩니다." : "No daily limits on AI features." },
        { icon: <ShieldCheck className="text-emerald-500" />, title: lang === 'ko' ? "광고 제거" : "No More Ads", desc: lang === 'ko' ? "쾌적한 학습을 위해 모든 광고를 제거합니다." : "Remove all distracting banner & interstitial ads." },
        { icon: <Sparkles className="text-purple-500" />, title: lang === 'ko' ? "AI 프리미엄 보고서" : "Premium AI Reports", desc: lang === 'ko' ? "나의 학습 약점을 AI가 정밀 분석해줍니다." : "Get deep insights into your learning weaknesses." },
        { icon: <MessageSquare className="text-blue-500" />, title: lang === 'ko' ? "전용 커뮤니티" : "Exclusive Benefits", desc: lang === 'ko' ? "매년 추가되는 모든 프리미엄 기능을 누리세요." : "Enjoy all upcoming premium features first." }
    ];

    const handlePurchase = async (productId: string) => {
        const res = await purchaseProduct(productId);
        if (res.success) {
            setIsPremium(true);
            alert(lang === 'ko' ? "PRO 업그레이드가 완료되었습니다! 감사합니다." : "Upgrade successful! Welcome to PRO.");
            onClose();
        } else if (res.message) {
            alert(res.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up">
                {/* Header/Banner */}
                <div className="bg-slate-900 p-8 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white shadow-xl mx-auto mb-4 rotate-3">
                        <Crown size={40} />
                    </div>
                    <h2 className="text-3xl font-black italic text-white tracking-tighter mb-1 uppercase">VocaQuest PRO</h2>
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Unlimited Memory Power</p>
                </div>

                {/* Benefits List */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                    {React.cloneElement(b.icon as React.ReactElement<any>, { size: 16 })}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm">{b.title}</h4>
                                    <p className="text-slate-400 text-[10px] font-medium leading-tight mt-0.5">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={() => handlePurchase(PRODUCTS.PREMIUM_MONTHLY)}
                            className="w-full py-4 bg-slate-100 text-slate-900 rounded-[24px] font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-between px-6 border border-slate-200"
                        >
                            <span>Monthly Plan</span>
                            <span className="font-mono">{getPrice(PRODUCTS.PREMIUM_MONTHLY, '₩3,300')}</span>
                        </button>
                        
                        <button
                            onClick={() => handlePurchase(PRODUCTS.PREMIUM_YEARLY)}
                            className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-lg shadow-xl shadow-indigo-600/30 active:scale-95 transition-all border-2 border-indigo-400 flex items-center justify-between px-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-12 bg-amber-400 text-[9px] text-slate-900 px-2 py-0.5 rounded-b-md font-black">SAVE 40%</div>
                            <span>Yearly Plan</span>
                            <span className="font-mono">{getPrice(PRODUCTS.PREMIUM_YEARLY, '₩19,900')}</span>
                        </button>
                        
                        <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2">
                            Secure payment via Google Play / App Store
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
