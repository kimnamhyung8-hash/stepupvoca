import React, { useEffect, useState } from 'react';
import { X, Bell, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getCommunityNotifications, markCommunityNotificationsAsRead, type CommunityNotification } from '../communityService';
import { t } from '../i18n';

interface CommunityNotifModalProps {
    isVisible: boolean;
    onClose: () => void;
    settings: any;
    userId: string;
    onNavigatePost: (postId: string) => void;
}

export const CommunityNotifModal: React.FC<CommunityNotifModalProps> = ({
    isVisible,
    onClose,
    settings,
    userId,
    onNavigatePost
}) => {
    const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const lang = settings.lang || 'ko';

    useEffect(() => {
        if (isVisible && userId) {
            fetchNotifs();
        }
    }, [isVisible, userId]);

    const fetchNotifs = async () => {
        setLoading(true);
        try {
            const data = await getCommunityNotifications(userId, 20);
            setNotifications(data);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        if (!userId) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markCommunityNotificationsAsRead(userId);
    };

    const handleNotifClick = async (notif: CommunityNotification) => {
        // If unread, mark local as read (actually we can just mark all read later)
        onNavigatePost(notif.postId);
        onClose();
    };

    if (!isVisible) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl relative animate-slide-up flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <Bell size={20} className={unreadCount > 0 ? 'animate-bounce-slow' : ''} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">
                            {t(lang, 'comm_notif_title') || '커뮤니티 알림'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
                            <p className="font-bold">Loading...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Bell size={48} className="text-slate-200 mb-4" />
                            <p className="font-bold">{t(lang, 'comm_notif_empty') || '새로운 알림이 없습니다.'}</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`flex items-start gap-4 p-5 rounded-3xl transition-all cursor-pointer border-2 ${notif.isRead ? 'border-transparent bg-slate-50 opacity-70' : 'border-indigo-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <MessageCircle size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                            <span className={`font-black uppercase tracking-widest text-[11px] ${notif.isRead ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                New Comment
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">
                                            {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-800 leading-snug mb-1 line-clamp-2">
                                        {(t(lang, 'comm_notif_item_desc') || '{name}님이 회원님의 \'{title}\' 게시글에 댓글을 남겼습니다.')
                                            .replace('{name}', notif.commentAuthorName)
                                            .replace('{title}', notif.postTitle)}
                                    </h4>
                                </div>
                                <div className="self-center flex items-center justify-center w-8 h-8 shrink-0 text-slate-300">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Content */}
                {notifications.length > 0 && unreadCount > 0 && (
                    <div className="p-6 shrink-0 border-t border-slate-100">
                        <button
                            onClick={handleMarkAllRead}
                            className="w-full py-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-[24px] font-black tracking-wide text-sm transition-all"
                        >
                            <CheckCircle2 size={18} />
                            {t(lang, 'comm_notif_mark_read') || '모두 읽음 처리'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
