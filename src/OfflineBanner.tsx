import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Reconnected flash banner
    if (showReconnected) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest animate-fade-in shadow-lg">
                <Wifi size={14} />
                <span>인터넷 연결됨 · Online</span>
            </div>
        );
    }

    // Offline banner
    if (!isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9998] animate-fade-in">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm text-white text-[11px] font-black shadow-lg">
                    <WifiOff size={13} className="text-orange-400 shrink-0" />
                    <span className="text-orange-300">오프라인 모드</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-300 font-medium text-[10px]">퀴즈 · 배틀 · 요격게임 정상 작동 중 🎯</span>
                </div>
            </div>
        );
    }

    return null;
}
