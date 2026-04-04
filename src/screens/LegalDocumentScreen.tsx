
import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import { t } from '../i18n';

interface LegalDocumentScreenProps {
    docId: string;
    title: string;
    settings: any;
    onBack: () => void;
}

export const LegalDocumentScreen: React.FC<LegalDocumentScreenProps> = ({ docId, title, settings, onBack }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'legal', docId);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().content) {
                    setContent(snap.data().content);
                } else {
                    // Fallback to i18n
                    const fallback = t(settings.lang, `legal_${docId}_text`);
                    if (fallback && fallback.length > 50) {
                        setContent(fallback);
                    } else {
                        setContent('내용이 아직 등록되지 않았습니다.');
                    }
                }
            } catch (err) {
                console.error("Error fetching doc:", err);
                // Try fallback on error too
                const fallback = t(settings.lang, `legal_${docId}_text`);
                if (fallback && fallback.length > 50) {
                    setContent(fallback);
                } else {
                    setContent('데이터를 불러오는데 실패했습니다. 네트워크 상태를 확인해 주세요.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoc();
    }, [docId]);

    return (
        <div className="screen animate-fade-in bg-white flex flex-col font-sans h-full">
            <header className="flex items-center justify-between px-4 py-4 bg-slate-900 text-white z-20 shrink-0">
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 active:scale-90 transition-all backdrop-blur-md">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-sm font-black tracking-tight italic uppercase truncate px-2">{title}</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pb-20 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 py-20">
                        <RefreshCw size={32} className="animate-spin text-indigo-500" />
                        <p className="font-black italic uppercase tracking-widest text-[10px]">Syncing Data...</p>
                    </div>
                ) : (
                    <div className="max-w-none whitespace-pre-wrap font-bold text-slate-700 leading-[1.8] text-sm italic">
                        {content}
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
                <div className="h-10"></div>
            </div>
        </div>
    );
};
