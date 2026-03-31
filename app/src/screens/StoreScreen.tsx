
import React, { useState, useEffect } from 'react';
import {
    X,
    Coins,
    Sparkles,
    Crown,
    Zap,
    ShoppingBag,
    Dices,
    RefreshCw,
    Gift,
    Check,
    Ban,
    Diamond,
    BookOpen,
    Star
} from 'lucide-react';
import { t } from '../i18n';
import { PRODUCTS, purchaseProduct, getPointsForProduct, restorePurchases, getProducts, type ProductInfo } from '../billing';
import { Capacitor } from '@capacitor/core';
import { showRewardedInterstitialAd } from '../admob';


interface StoreScreenProps {
    settings: any;
    setScreen: (s: string) => void;
    userPoints: number;
    setUserPoints: (p: any) => void;
    purchasedSkins: string[];
    setPurchasedSkins: (s: any) => void;
    equippedSkin: string;
    setEquippedSkin: (s: string) => void;
    setIsPremium: (v: boolean) => void;
    isPremium: boolean;
}

const InfoModal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 shrink-0">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
                    <div className="text-slate-600 font-medium leading-relaxed space-y-6 text-[14px] whitespace-pre-wrap">
                        {children}
                    </div>
                </div>
                <div className="p-6 shrink-0">
                    <button 
                        onClick={onClose}
                        className="w-full bg-[#1E293B] py-5 rounded-[24px] text-white font-black text-lg active:scale-95 transition-all"
                    >
                        {t('confirm_ok')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const StoreScreen: React.FC<StoreScreenProps> = ({
    settings,
    setScreen,
    userPoints,
    setUserPoints,
    purchasedSkins,
    setPurchasedSkins,
    equippedSkin,
    setEquippedSkin,
    setIsPremium,
    isPremium
}) => {
    const lang = settings.lang || 'ko';
    const [currentTab, setCurrentTab] = useState<'store' | 'gacha' | 'recharge'>('gacha'); // Default to gacha as requested
    const [category, setCategory] = useState<'ALL' | 'CHICK' | 'EXPERT' | 'LEGEND'>('ALL');
    const [isRolling, setIsRolling] = useState(false);
    const [gachaResult, setGachaResult] = useState<any>(null);
    
    // Store localized product info
    const [dbProducts, setDbProducts] = useState<ProductInfo[]>([]);

    useEffect(() => {
        const loadProducts = async () => {
            const prods = await getProducts(lang);
            setDbProducts(prods);
        };
        loadProducts();
    }, [lang]);

    // Helper to get dynamic price string
    const getPrice = (id: string, fallback: string) => {
        const found = dbProducts.find(p => p.id === id);
        return found ? found.price : fallback;
    };

    // Modal States
    const [infoTab, setInfoTab] = useState<string | null>(null);

    const skins = [
        { id: 'default', emoji: '🐣', labelKey: 'skin_default', price: 0, tier: 'CHICK' },
        { id: 'ninja', emoji: '🥷', labelKey: 'skin_ninja', price: 1000, tier: 'CHICK' },
        { id: 'wizard', emoji: '🧙‍♂️', labelKey: 'skin_wizard', price: 2000, special: 'animate-float', tier: 'CHICK' },
        { id: 'king', emoji: '👑', labelKey: 'skin_king', price: 5000, special: 'animate-float', tier: 'CHICK' },
        { id: 'dragon', emoji: '🐉', labelKey: 'skin_dragon', price: 10000, special: 'animate-float premium-shine', tier: 'EXPERT' },
        { id: 'alien', emoji: '👽', labelKey: 'skin_alien', price: 15000, special: 'animate-pulse', tier: 'EXPERT' },
        { id: 'robot', emoji: '🤖', labelKey: 'skin_robot', price: 20000, special: 'animate-pulse', tier: 'EXPERT' },
        { id: 'vampire', emoji: '🧛', labelKey: 'skin_vampire', price: 25000, special: 'animate-float', tier: 'EXPERT' },
        { id: 'hero', emoji: '🦸‍♂️', labelKey: 'skin_hero', price: 30000, special: 'animate-float', tier: 'EXPERT' },
        { id: 'ghost', emoji: '👻', labelKey: 'skin_ghost', price: 35000, special: 'animate-float opacity-80', tier: 'EXPERT' },
        { id: 'tiger', emoji: '🐯', labelKey: 'skin_tiger', price: 40000, special: 'animate-pulse', tier: 'EXPERT' },
        { id: 'unicorn', emoji: '🦄', labelKey: 'skin_unicorn', price: 50000, special: 'animate-float premium-shine', tier: 'LEGEND' },
        { id: 'devil', emoji: '😈', labelKey: 'skin_devil', price: 60000, special: 'animate-float', tier: 'LEGEND' },
        { id: 'angel', emoji: '😇', labelKey: 'skin_angel', price: 70000, special: 'animate-float premium-shine', tier: 'LEGEND' },
        { id: 'cat', emoji: '🐱', labelKey: 'skin_cat', price: 80000, tier: 'LEGEND' },
        { id: 'dog', emoji: '🐶', labelKey: 'skin_dog', price: 90000, tier: 'LEGEND' }
    ];

    const filteredSkins = category === 'ALL' ? skins : skins.filter(s => s.tier === category);

    const handleBuySkin = (skin: any) => {
        if (purchasedSkins.includes(skin.id)) {
            setEquippedSkin(skin.id);
            return;
        }

        if (userPoints < skin.price) {
            alert(t(lang, 'points_shortage'));
            return;
        }

        if (confirm(t(lang, 'buy') + '?')) {
            setUserPoints((prev: number) => prev - skin.price);
            setPurchasedSkins((prev: string[]) => [...prev, skin.id]);
            setEquippedSkin(skin.id);
        }
    };

    const handleGachaRoll = () => {
        if (userPoints < 500) {
            alert(t(lang, 'points_shortage'));
            return;
        }
        setIsRolling(true);
        setTimeout(() => {
            const unownedSkins = skins.filter(s => !purchasedSkins.includes(s.id));
            if (unownedSkins.length === 0) {
                alert(t(lang, 'already_owned_all_characters'));
                setIsRolling(false);
                return;
            }
            const randomSkin = unownedSkins[Math.floor(Math.random() * unownedSkins.length)];
            setUserPoints((p: number) => p - 500);
            setPurchasedSkins((prev: string[]) => [...prev, randomSkin.id]);
            setGachaResult(randomSkin);
            setIsRolling(false);
        }, 1500);
    };

    const handleRecharge = async (productId: string) => {
        const res = await purchaseProduct(productId);
        if (res.success) {
            if (productId.includes('premium')) {
                setIsPremium(true);
                alert(t(lang, 'premium_activated'));
            } else if (productId.includes('remove_ads')) {
                // If we had a specific state for ads, we'd set it here. 
                // Currently, Premium includes 'No Ads', but this standalone purchase works too.
                alert(t(lang, 'ad_complete'));
            } else {
                const added = getPointsForProduct(productId);
                if (added > 0) {
                    setUserPoints((p: number) => p + added);
                    alert(t(lang, 'points_recharged').replace('{points}', String(added)));
                } else {
                    // This might be a subscription or other item handled elsewhere
                    alert(t(lang, 'purchase_complete'));
                }
            }
        } else if (res.message) {
            alert(res.message);
        }
    };



    const handleRestore = async () => {
        const success = await restorePurchases();
        if (success) {
            alert(t(lang, 'restore_purchases') + " OK");
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 1000) return (price / 1000) + 'k';
        return price;
    };

    return (
        <div className="screen bg-white flex flex-col font-sans select-none overflow-hidden pb-10">
            <header className="flex items-center justify-between px-6 py-6 bg-[#0F172A] z-20 shrink-0">
                <button onClick={() => setScreen('HOME')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                    {t(lang, 'store')}
                </h2>
                <div className="flex items-center gap-1.5 bg-black/40 border border-amber-500/30 px-4 py-2 rounded-full shadow-inner">
                    <Coins size={16} className="text-amber-500" />
                    <span className="text-sm font-black text-amber-500">{userPoints.toLocaleString()}</span>
                </div>
            </header>

            <div className="bg-white border-b border-slate-50 px-6 flex justify-around shrink-0">
                <button 
                    onClick={() => { setCurrentTab('store'); setGachaResult(null); }}
                    className={`flex flex-col items-center py-4 px-2 gap-1 relative transition-all ${currentTab === 'store' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                >
                    <ShoppingBag size={22} />
                    <span className="text-[11px] font-black">{t(lang, 'store')}</span>
                    {currentTab === 'store' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                </button>
                <button 
                    onClick={() => { setCurrentTab('gacha'); setGachaResult(null); }}
                    className={`flex flex-col items-center py-4 px-2 gap-1 relative transition-all ${currentTab === 'gacha' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                >
                    <Dices size={22} className={currentTab === 'gacha' ? 'text-indigo-600' : 'text-slate-300'} />
                    <span className="text-[11px] font-black">{t(lang, 'lucky_gacha')}</span>
                    {currentTab === 'gacha' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                </button>
                <button 
                    onClick={() => { setCurrentTab('recharge'); setGachaResult(null); }}
                    className={`flex flex-col items-center py-4 px-2 gap-1 relative transition-all ${currentTab === 'recharge' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                >
                    <Zap size={22} />
                    <span className="text-[11px] font-black">{t(lang, 'charge')}</span>
                    {currentTab === 'recharge' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {currentTab === 'store' && (
                    <div className="animate-fade-in px-4 pt-4 pb-24 space-y-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {(['ALL', 'CHICK', 'EXPERT', 'LEGEND'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-6 py-2 rounded-full text-[11px] font-black tracking-widest transition-all whitespace-nowrap border-2
                                        ${category === cat 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                            : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3 pt-2">
                            {filteredSkins.map(skin => {
                                const isOwned = purchasedSkins.includes(skin.id);
                                const isEquipped = equippedSkin === skin.id;
                                return (
                                    <button
                                        key={skin.id}
                                        onClick={() => handleBuySkin(skin)}
                                        className={`relative p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 active:scale-95 aspect-square justify-center overflow-hidden
                                            ${isEquipped ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' :
                                                                    isOwned ? 'bg-white border-slate-200 text-slate-800' : 'bg-white border-slate-100 text-slate-400'}
                                            ${skin.special?.includes('premium-shine') ? 'premium-shine' : ''}`}
                                    >
                                        <div className={`text-3xl ${skin.special || ''}`}>{skin.emoji}</div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{t(lang, skin.labelKey)}</p>
                                            {!isOwned && (
                                                <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-500">
                                                    <Coins size={9} />
                                                    <span className="text-[9px] font-black leading-none">{formatPrice(skin.price)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentTab === 'gacha' && !gachaResult && (
                    <div className="flex flex-col items-center pt-6 pb-32 animate-fade-in relative px-6">
                        {/* Interactive Hero Banner as Gacha Machine */}
                        <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border-4 border-slate-100 group transition-all active:scale-[0.98]">
                            <img 
                                src="/assets/hero_banner.png" 
                                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000" 
                                alt="Secret Library"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                            
                            {/* Magic Book Interaction Area (Targeting the book in the composition) */}
                            <button 
                                onClick={handleGachaRoll}
                                disabled={isRolling}
                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full flex flex-col items-center justify-center group/btn cursor-pointer z-10 ${isRolling ? 'opacity-50' : ''}`}
                            >
                                <div className={`relative w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/30 flex items-center justify-center shadow-2xl transform transition-all group-hover/btn:scale-125 group-hover/btn:rotate-12 ${isRolling ? 'animate-bounce' : 'animate-float'}`}>
                                    <BookOpen size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                                    <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
                                </div>
                                <div className="mt-4 bg-white px-4 py-1.5 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                    <span className="text-[#4F46E5] font-black text-xs uppercase tracking-widest leading-none">{t(lang, 'tap_to_open_magic_book')}</span>
                                </div>
                            </button>

                            {/* Floating Labels */}
                            <div className="absolute bottom-10 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1 rounded-lg w-fit">
                                        <Star size={10} className="text-white fill-white" />
                                        <span className="text-[10px] font-black text-white uppercase">{t(lang, 'secret_summoning')}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{t(lang, 'premium_lucky_box')}</h3>
                                </div>
                                
                                <div className="bg-amber-400 p-1 rounded-2xl shadow-xl transform rotate-3">
                                    <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2">
                                        <Coins size={16} className="text-amber-500" />
                                        <span className="text-lg font-black text-slate-800">500</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center px-10">
                            <p className="text-[#94A3B8] font-black text-[16px] leading-relaxed">
                                {t(lang, 'random_avatar')}
                            </p>
                            <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest mt-2">{t(lang, 'gacha_tap_invitation')}</p>
                        </div>

                        {/* Traditional Button as Backup */}
                        <div className="mt-12 w-full max-w-[300px] perspective-1000">
                             <button 
                                onClick={handleGachaRoll} 
                                disabled={isRolling} 
                                className="w-full bg-[#0F172A] p-1 rounded-[40px] shadow-2xl active:scale-95 transition-all disabled:opacity-50 group overflow-hidden"
                            >
                                <div className="bg-slate-800/50 rounded-[38px] py-6 flex items-center justify-center gap-4 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
                                    <RefreshCw size={24} className={`text-white shrink-0 ${isRolling ? 'animate-spin' : ''}`} />
                                    <span className="text-white text-2xl font-black tracking-tight">{t(lang, 'gacha_cost')}</span>
                                </div>
                            </button>
                        </div>

                        {/* Recent History Hint */}
                        <div className="mt-10 flex items-center gap-2 text-slate-400">
                             <Gift size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{t(lang, 'rare_legendary_skins_inside')}</span>
                        </div>
                    </div>
                )}

                {currentTab === 'gacha' && gachaResult && (
                    <div className="flex flex-col items-center pt-8 pb-32 animate-fade-in px-6 text-center">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-30 animate-pulse rounded-full" />
                            <div className={`w-64 h-64 flex items-center justify-center text-[180px] relative z-10 ${gachaResult.special || ''} ${gachaResult.special?.includes('premium-shine') ? 'premium-shine rounded-full shadow-2xl shadow-indigo-200' : ''}`}>
                                {gachaResult.emoji}
                            </div>
                            <div className="absolute -top-4 -right-4 bg-yellow-400 text-[#78350F] p-4 rounded-3xl shadow-2xl border-4 border-white transform rotate-12 z-20">
                                <Star size={32} className="fill-yellow-600/20" />
                            </div>
                        </div>

                        <div className="w-full max-w-[340px] bg-white border-4 border-indigo-100 rounded-[60px] p-10 shadow-2xl mb-12 relative overflow-hidden">
                             <div className="absolute top-0 inset-x-0 h-2 bg-indigo-500" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4 leading-none">{t(lang, 'new_skin_collected')}</h3>
                            <p className="text-slate-800 text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">{t(lang, gachaResult.labelKey)}</p>
                            <div className="flex justify-center mt-6">
                                <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full uppercase">{t(lang, 'successfully_summoned')}</span>
                            </div>
                        </div>

                        <button onClick={() => setGachaResult(null)} className="w-full max-w-[300px] bg-[#0F172A] py-7 rounded-[40px] flex items-center justify-center shadow-2xl active:scale-95 transition-all">
                            <span className="text-white text-2xl font-black tracking-tight">{t(lang, 'confirm_ok')}</span>
                        </button>
                    </div>
                )}

                {currentTab === 'recharge' && (
                    <div className="px-5 pt-4 pb-24 space-y-8 animate-fade-in no-scrollbar">
                        <section className="space-y-4">
                            <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2 px-1">
                                <Crown size={20} className="text-indigo-600" /> {t(lang, 'premium_benefits_title')}
                            </h3>
                            <div className="bg-[#0F1721] rounded-[48px] p-8 pb-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-[28px] font-black tracking-tight">{t(lang, 'premium_title')}</h4>
                                    <Crown size={32} className="text-yellow-400" />
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        t(lang, 'benefit_ads'), 
                                        t(lang, 'benefit_reports'), 
                                        t(lang, 'benefit_levels'), 
                                        t(lang, 'benefit_unlimited'), 
                                        t(lang, 'benefit_points')
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400/30">
                                                <Check size={14} className="text-white" />
                                            </div>
                                            <span className="text-[16px] font-bold text-slate-200">{text}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="mb-6 text-indigo-300 text-sm font-bold text-center px-2 leading-relaxed opacity-80">
                                    {isPremium ? t(lang, 'premium_already_subscribed') : (t(lang, 'premium_benefits_desc') || "Upgrade to PRO for all features")}
                                </div>

                                {!isPremium && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleRecharge(PRODUCTS.PREMIUM_MONTHLY)} 
                                            className="bg-white/10 hover:bg-white/20 border border-white/20 p-5 rounded-3xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group"
                                        >
                                            <span className="text-white font-black text-[10px] uppercase tracking-wider opacity-60">Monthly</span>
                                            <span className="text-indigo-300 font-mono text-lg font-black">{getPrice(PRODUCTS.PREMIUM_MONTHLY, '₩3,300')}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleRecharge(PRODUCTS.PREMIUM_YEARLY)} 
                                            className="bg-indigo-600 border border-indigo-400 p-5 rounded-3xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all group relative overflow-hidden shadow-lg shadow-indigo-600/20"
                                        >
                                            <div className="absolute top-0 right-0 bg-amber-400 text-[8px] text-slate-900 px-2 py-0.5 rounded-bl-lg font-black tracking-tighter shadow-sm animate-pulse">BEST!</div>
                                            <span className="text-white font-black text-[10px] uppercase tracking-wider opacity-70">Yearly</span>
                                            <span className="text-white font-mono text-lg font-black">{getPrice(PRODUCTS.PREMIUM_YEARLY, '₩19,900')}</span>
                                        </button>
                                    </div>
                                )}
                                
                                {isPremium && (
                                    <div className="bg-indigo-600/30 border border-indigo-500/30 p-5 rounded-3xl flex items-center justify-center gap-3">
                                        <Crown size={20} className="text-yellow-400 animate-pulse" />
                                        <span className="text-indigo-100 font-black text-sm uppercase tracking-widest">{t(lang, 'premium_already_subscribed')}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2 px-1">
                                <Diamond size={18} className="text-emerald-500" /> {t(lang, 'charge_points_title')}
                            </h3>
                            <div className="space-y-4">
                                {/* 1. 1000 Points */}
                                <div className="bg-white border-2 border-slate-100 p-5 rounded-[36px] flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
                                            <Coins size={36} className="text-amber-500" />
                                        </div>
                                        <h4 className="text-slate-800 text-2xl font-black italic tracking-tighter">1,000 P</h4>
                                    </div>
                                    <button onClick={() => handleRecharge(PRODUCTS.POINTS_1000)} className="bg-[#059669] px-6 py-3 rounded-2xl text-white font-black text-lg shadow-lg active:scale-90 transition-all font-mono">{getPrice(PRODUCTS.POINTS_1000, '₩1,100')}</button>
                                </div>

                                {/* Watch Ad for 500P (App Only) */}
                                {Capacitor.isNativePlatform() && (
                                    <div 
                                        onClick={async () => {
                                            if (isRolling) return;
                                            setIsRolling(true);
                                            try {
                                                const reward = await showRewardedInterstitialAd();
                                                if (reward) {
                                                    setUserPoints((p: number) => p + 500);
                                                    alert(t(lang, 'ad_complete'));
                                                }
                                            } finally {
                                                setIsRolling(false);
                                            }
                                        }}
                                        className="bg-white border-2 border-indigo-100 p-5 rounded-[36px] flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-300 transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                                                <Zap size={36} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800">{t(lang, 'ad_title')}</h4>
                                                <p className="text-xs font-bold text-slate-400 mt-0.5">{t(lang, 'ad_desc')}</p>
                                            </div>
                                        </div>
                                        <div className="text-xl font-black text-indigo-500 italic group-hover:text-indigo-600 transition-colors tracking-tighter pr-2">+500P</div>
                                    </div>
                                )}

                                {/* 2. Remove Ads (Lifetime) */}
                                <div className="bg-[#0F1721] p-5 rounded-[36px] flex items-center justify-between shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/10">
                                            <Ban size={36} className="text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white text-[18px] font-black leading-tight">{t(lang, 'remove_ads_title')}</h4>
                                            <p className="text-slate-400 text-xs font-bold mt-0.5">{t(lang, 'remove_ads_desc')}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRecharge(PRODUCTS.AD_REMOVE)} className="bg-[#1E293B] px-6 py-3 rounded-2xl text-white font-black text-lg shadow-lg active:scale-90 transition-all font-mono border border-white/5">{getPrice(PRODUCTS.AD_REMOVE, '₩14,000')}</button>
                                </div>


                            </div>
                        </section>

                        <div className="flex flex-col items-center gap-6 pt-8 pb-10">
                            <button onClick={handleRestore} className="px-8 py-3 rounded-full border-2 border-slate-100 text-slate-400 font-black text-sm hover:bg-slate-50 transition-all">{t(lang, 'restore_purchases')}</button>
                            <div className="text-center space-y-2">
                                <p className="text-[12px] font-bold text-slate-300 leading-relaxed max-w-[320px]">
                                    {t(lang, 'subscription_auto_renew')} <span className="underline cursor-pointer text-slate-400" onClick={() => setInfoTab('CANCEL')}>{t(lang, 'view_cancel_method')}</span>
                                </p>
                                <p className="text-[12px] font-bold text-slate-300 leading-relaxed max-w-[320px]">
                                    {t(lang, 'purchase_agree_terms')} <span className="underline cursor-pointer text-slate-400" onClick={() => setInfoTab('TERMS')}>{t(lang, 'legal_tos_title')}</span> {t(lang, 'and')} <span className="underline cursor-pointer text-slate-400" onClick={() => setInfoTab('PRIVACY')}>{t(lang, 'legal_privacy_title')}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InfoModal 
                isOpen={infoTab === 'CANCEL'} 
                onClose={() => setInfoTab(null)}
                title={t(lang, 'legal_cancel_title')}
            >
                {t(lang, 'legal_cancel_text')}
            </InfoModal>

            <InfoModal 
                isOpen={infoTab === 'TERMS'} 
                onClose={() => setInfoTab(null)}
                title={t(lang, 'legal_tos_title')}
            >
                {t(lang, 'legal_tos_text')}
            </InfoModal>

            <InfoModal 
                isOpen={infoTab === 'PRIVACY'} 
                onClose={() => setInfoTab(null)}
                title={t(lang, 'legal_privacy_title')}
            >
                {t(lang, 'legal_privacy_text')}
            </InfoModal>
        </div>
    );
};