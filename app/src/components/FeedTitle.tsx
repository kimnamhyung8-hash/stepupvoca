import { useState, useEffect } from 'react';
import { getActiveApiKey } from '../apiUtils';
import { translateContent } from '../communityAiService';
import { type CommunityPost } from '../communityService';

export const FeedTitle = ({ post, lang, isGlobalTranslateOn }: { post: CommunityPost, lang: string, isGlobalTranslateOn: boolean }) => {
    const [translatedTitle, setTranslatedTitle] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (!isGlobalTranslateOn) return;
        if (post.originalLang === lang) return; // No need to translate if it's already their language
        
        const doTranslate = async () => {
            const apiKey = getActiveApiKey(localStorage.getItem('vq_gemini_key'), false, 0);
            if (!apiKey) return;
            setIsTranslating(true);
            try {
                // translate from english version or original
                const sourceText = post.title_en || post.title;
                const result = await translateContent(sourceText, lang, apiKey, false);
                setTranslatedTitle(result);
            } catch (e) {
                console.warn('Feed title translation failed');
            } finally {
                setIsTranslating(false);
            }
        };
        doTranslate();
    }, [isGlobalTranslateOn, lang, post.id, post.originalLang, post.title, post.title_en]);

    if (!isGlobalTranslateOn) {
        return <>{post.title_en || post.title}</>;
    }

    if (post.originalLang === lang) {
        return <>{post.title}</>;
    }

    return (
        <span className="relative">
            {isTranslating ? (
                <span className="animate-pulse bg-slate-100 text-slate-400 rounded-md px-2 text-sm">Translating...</span>
            ) : (
                translatedTitle || post.title_en || post.title
            )}
        </span>
    );
};
