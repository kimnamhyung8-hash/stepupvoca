import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { t } from '../i18n';

export interface NoticeDoc {
    id: string;
    title_ko: string;
    content_ko: string;
    translations?: Record<string, { title: string; content: string }>;
    createdAt: any;
    pinned?: boolean;
}

interface NoticeBannerProps {
    lang: string;
    setScreen: (s: string) => void;
}

export const NoticeBanner = ({ lang, setScreen }: NoticeBannerProps) => {
    const [notices, setNotices] = useState<NoticeDoc[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        let unsubscribe = () => { };
        const load = async () => {
            try {
                const { db } = await import('../firebase');
                const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
                // We fetch a few notices to rotate
                const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(3));
                unsubscribe = onSnapshot(q, (snap) => {
                    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NoticeDoc));
                    if (data.length === 0) {
                        // Fallback notice if DB is empty
                        setNotices([{
                            id: 'default',
                            title_ko: 'AI 보안 및 무료 사용 안내',
                            content_ko: '서비스를 안심하고 이용하세요.',
                            createdAt: new Date()
                        }]);
                    } else {
                        setNotices(data);
                    }
                }, (err) => {
                    console.warn('Notice snapshot listener failed:', err);
                    setNotices([{
                        id: 'error',
                        title_ko: 'AI 보안 및 무료 사용 안내',
                        content_ko: '',
                        createdAt: new Date()
                    }]);
                });
            } catch (e) { 
                console.warn('Notice fetch failed', e);
                setNotices([{
                    id: 'fallback',
                    title_ko: 'AI 보안 및 무료 사용 안내',
                    content_ko: '',
                    createdAt: new Date()
                }]);
            }
        };
        load();
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (notices.length <= 1) return;
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % notices.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [notices]);

    const getTitle = (n: NoticeDoc) => n.translations?.[lang]?.title || n.title_ko || '';

    if (notices.length === 0) return null;

    return (
        <div
            onClick={() => setScreen('SETTINGS')}
            style={{ paddingTop: 'var(--status-bar-height)' }}
            className="w-full bg-[#EEF2FF]/80 backdrop-blur-sm px-4 py-1.5 flex items-center gap-3 border-b border-indigo-100/50 animate-fade-in cursor-pointer hover:bg-white transition-colors"
        >
            <div className="flex items-center gap-1.5 bg-indigo-600 px-3 py-1 rounded-full shadow-lg shadow-indigo-600/20 shrink-0">
                <Bell size={12} className="text-white fill-white/20" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{t(lang, 'notice') || 'NOTICE'}</span>
            </div>
            <div className="flex-1 h-5 relative overflow-hidden">
                {notices.map((n, i) => (
                    <div
                        key={n.id}
                        className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${i === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        <span className="text-[12px] font-black text-indigo-900/80 truncate truncate-2-lines leading-tight">{getTitle(n)}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-1.5 shrink-0 items-center">
                {notices.length > 1 && notices.map((_, i) => (
                    <div key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-indigo-500 w-4' : 'bg-slate-300'}`} 
                    />
                ))}
            </div>
        </div>
    );
};
