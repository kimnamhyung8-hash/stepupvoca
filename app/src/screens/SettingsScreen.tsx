import { useState, useEffect } from 'react';
import {
    Bell, ChevronDown, X, Music, Volume2, Play,
    Zap, Layers, ChevronRight, BellOff
} from 'lucide-react';
import { t, languages } from '../i18n';
import {
    getNotifSettings, saveNotifSettings, scheduleStreakNotification
} from '../streak';
import { showAdIfFree } from '../admob';
import { APP_VERSION } from '../constants/appConstants';
import type { NoticeDoc } from '../components/NoticeBanner';
import { CommunityNotifModal } from '../components/CommunityNotifModal';
import { Capacitor } from '@capacitor/core';
import { WidgetPlugin } from '../utils/WidgetPlugin';

// ------ NOTICES SECTION ------
export function NoticesSection({ lang }: { lang: string }) {
    const [notices, setNotices] = useState<NoticeDoc[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        let unsub = () => { };
        const load = async () => {
            try {
                const { db } = await import('../firebase');
                const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
                const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(5));
                unsub = onSnapshot(q, (snap) => {
                    setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NoticeDoc)));
                }, (err) => {
                    console.warn('[SettingsScreen] Notices load error:', err);
                    setNotices([]);
                });
            } catch (e) { console.warn('Notes load failed', e); }
        };
        load();
        return () => unsub();
    }, []);

    const getTitle = (n: NoticeDoc) => n.translations?.[lang]?.title || n.title_ko || '';
    const getContent = (n: NoticeDoc) => n.translations?.[lang]?.content || n.content_ko || '';

    const formatDate = (ts: any) => {
        if (!ts) return '';
        try {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' });
        } catch { return ''; }
    };

    const renderLinkifiedText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 underline font-black decoration-2 underline-offset-2 hover:text-indigo-800 transition-colors"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
                <Bell size={14} className="text-indigo-500" />
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {t(lang, 'notice')}
                </label>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-50">
                {notices.length > 0 ? (
                    notices.map((n) => (
                        <div key={n.id}
 className="transition-all">
                            <button
                                onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                                className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors flex items-start gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold text-slate-800 leading-snug ${expandedId === n.id ? '' : 'truncate'}`}>{getTitle(n)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                                </div>
                                <div className={`mt-0.5 transition-transform duration-300 ${expandedId === n.id ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={14} className="text-slate-300" />
                                </div>
                            </button>

                            {expandedId === n.id && (
                                <div className="px-4 pb-6 animate-fade-in">
                                    <div className="h-px bg-slate-50 mb-4" />
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                        {renderLinkifiedText(getContent(n))}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-[12px] font-bold text-slate-400 italic">
                            {t(lang, 'no_recent_notices')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ------ SETTINGS SCREEN ------
export function SettingsScreen({ setScreen, settings, setSettings, streak, streakMax, userInfo }: any) {
    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLangChange = (e: any) => {
        setSettings((prev: any) => ({ ...prev, lang: e.target.value }));
    };

    const currentLang = settings.lang;

    const [notifOn, setNotifOn] = useState(() => getNotifSettings().on);
    const [notifHour, setNotifHour] = useState(() => getNotifSettings().hour);
    const [notifMin, setNotifMin] = useState(() => getNotifSettings().min);

    const handleNotifToggle = async () => {
        const next = !notifOn;
        setNotifOn(next);
        saveNotifSettings(next, notifHour, notifMin);
        if (next) {
            const ok = await scheduleStreakNotification(notifHour, notifMin);
            if (!ok) { setNotifOn(false); saveNotifSettings(false, notifHour, notifMin); }
        }
    };

    const handleNotifTimeChange = async (h: number, m: number) => {
        setNotifHour(h); setNotifMin(m);
        saveNotifSettings(notifOn, h, m);
        if (notifOn) await scheduleStreakNotification(h, m);
    };

    const [showNotifModal, setShowNotifModal] = useState(false);
    const unreadCount = userInfo?.unreadCommunityNotif || 0;

    const handleNavigatePost = (postId: string) => {
        setShowNotifModal(false);
        localStorage.setItem('vq_target_post_id', postId);
        setScreen('COMMUNITY');
    };

    return (
        <div className="screen animate-fade-in bg-slate-50 flex flex-col">
            <header className="flex items-center justify-between px-4 py-4 bg-slate-900 text-white z-20 shrink-0">
                <button onClick={() => setScreen('HOME')}
 className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 active:scale-90 transition-all backdrop-blur-md">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-black tracking-tight italic uppercase">{t(currentLang, 'settings')}</h2>
                <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto">
                <div className="bg-slate-900 px-8 pt-4 pb-14 rounded-b-[50px] text-center shrink-0 shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                    <div className="w-20 h-20 bg-white/10 rounded-[30px] flex items-center justify-center text-4xl border-2 border-white/20 shadow-inner mx-auto mb-4 backdrop-blur-md">⚙️</div>
                    <h3 className="text-white text-xl font-black italic tracking-tight mb-2 uppercase">{t(currentLang, 'exp_settings')}</h3>
                    <p className="text-slate-400 text-[11px] font-bold leading-relaxed max-w-[240px] mx-auto">
                        {t(currentLang, 'app_version')}: {APP_VERSION}
                    </p>
                </div>

                <div className="px-4 -mt-8 pb-[calc(var(--nav-height)+20px)] space-y-8">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{t(currentLang, 'language')}</label>
                        <div className="relative">
                            <select
                                value={settings.lang}
                                onChange={handleLangChange}
                                className="w-full bg-white border-2 border-slate-100 rounded-3xl px-6 py-4.5 text-slate-800 font-black appearance-none outline-none focus:border-indigo-400 transition-all shadow-sm text-center"
                                style={{ textAlignLast: 'center' }}
                            >
                                {languages.map((l: any) => (
                                    <option key={l.code}
 value={l.code}>{l.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                <ChevronDown size={20} />
                            </div>
                        </div>
                    </div>

                    <NoticesSection lang={currentLang} />

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{t(currentLang, 'exp_settings')}</label>
                        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-2 overflow-hidden shadow-xl shadow-slate-900/5">
                            {[
                                { id: 'bgm', label: t(currentLang, 'bgm'), icon: <Music size={20} /> },
                                { id: 'sfx', label: t(currentLang, 'sfx'), icon: <Volume2 size={20} /> },
                                { id: 'tts', label: t(currentLang, 'tts'), icon: <Play size={20} /> },
                                { id: 'vibration', label: t(currentLang, 'vibration'), icon: <Zap size={20} /> }
                            ].map((item, idx, arr) => (
                                <div key={item.id}>
                                    <div className="flex items-center justify-between p-5 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-black text-slate-800">{item.label}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting(item.id as any)}
                                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${settings[item.id as keyof typeof settings] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${settings[item.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                    {idx !== arr.length - 1 && <div className="mx-5 h-px bg-slate-100"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{t(currentLang, 'comm_notif_title') || '커뮤니티 알림'}</label>
                        <button
                            onClick={() => setShowNotifModal(true)}
                            className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-[32px] p-6 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 relative">
                                    <Bell size={24} className={unreadCount > 0 ? "animate-bounce-slow" : ""} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-[10px] font-black tracking-tighter flex items-center justify-center shadow-md animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-black text-slate-800">{t(currentLang, 'comm_notif_button') || '내 커뮤니티 알림함'}</span>
                                    <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">
                                        {unreadCount > 0 ? `새로운 댓글 알림이 ${unreadCount}개 있습니다` : '모든 알림을 확인했습니다'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-indigo-200 group-hover:text-indigo-500 transition-colors" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{t(currentLang, 'install_widget')}</label>
                        <button
                            onClick={async () => {
                                if (Capacitor.isNativePlatform()) {
                                    try {
                                        await WidgetPlugin.requestPinWidget();
                                    } catch (e: any) {
                                        alert(t(currentLang, 'install_widget') + ' 실패:\n' + (e.message || JSON.stringify(e)));
                                    }
                                } else {
                                    window.dispatchEvent(new CustomEvent('vq_show_widget_promo'));
                                }
                            }}
                            className="w-full bg-orange-50 border-2 border-orange-100 rounded-[32px] p-6 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                                    <Layers size={24} />
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-black text-slate-800">{t(currentLang, 'install_widget')}</span>
                                    <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">{t(currentLang, 'widget_promo_desc')}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-orange-200 group-hover:text-orange-500 transition-colors" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">{t(currentLang, 'study_reminders')}</label>
                        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[32px] p-6 shadow-sm">
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 bg-white rounded-[24px] p-4 text-center border-2 border-indigo-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t(currentLang, 'current_streak')}</p>
                                    <p className="text-2xl font-black text-slate-800">🔥 {streak || 0}</p>
                                </div>
                                <div className="flex-1 bg-white rounded-[24px] p-4 text-center border-2 border-indigo-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t(currentLang, 'max_streak')}</p>
                                    <p className="text-2xl font-black text-slate-800">🏆 {streakMax || 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${notifOn ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                        {notifOn ? <Bell size={18} /> : <BellOff size={18} />}
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-slate-800">{t(currentLang, 'push_notif')}</span>
                                        <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">{t(currentLang, 'daily_remind_desc')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNotifToggle}
                                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${notifOn ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${notifOn ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {notifOn && (
                                <div className="mt-5 space-y-3">
                                    <p className="text-[11px] font-black text-indigo-400 text-center uppercase tracking-widest leading-none mb-4">{t(currentLang, 'set_remind_time')}</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-black text-slate-300 uppercase">{t(currentLang, 'hour')}</span>
                                            <select
                                                value={notifHour}
                                                onChange={(e) => handleNotifTimeChange(parseInt(e.target.value), notifMin)}
                                                className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-lg font-black text-slate-800 outline-none focus:border-indigo-400 transition-all shadow-sm"
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <option key={i}
 value={i}>{String(i).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="text-2xl font-black text-indigo-200 mt-5">:</span>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[9px] font-black text-slate-300 uppercase">{t(currentLang, 'minute')}</span>
                                            <select
                                                value={notifMin}
                                                onChange={(e) => handleNotifTimeChange(notifHour, parseInt(e.target.value))}
                                                className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-lg font-black text-slate-800 outline-none focus:border-indigo-400 transition-all shadow-sm"
                                            >
                                                {Array.from({ length: 60 }).map((_, i) => (
                                                    <option key={i}
 value={i}>{String(i).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-indigo-300 text-center mt-4">
                                        {t(currentLang, 'reminder_at').replace('{n}', `${String(notifHour).padStart(2, '0')}:${String(notifMin).padStart(2, '0')}`)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button onClick={async () => { await showAdIfFree(); setScreen('HOME'); }}
 className="three-d-btn w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-[0_6px_0_#000000] active:translate-y-1 active:shadow-none">
                            {t(currentLang, 'save')}
                        </button>
                    </div>
                </div>
            </div>

            <CommunityNotifModal
                isVisible={showNotifModal}
                onClose={() => setShowNotifModal(false)}
                settings={settings}
                userId={userInfo?.uid || ''}
                onNavigatePost={handleNavigatePost}
            />
        </div>
    );
}
