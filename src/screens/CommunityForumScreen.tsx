import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  MessageSquare,
  Eye,
  PenSquare,
  ArrowLeft,
  Image as ImageIcon,
  Send,
  User,
  TrendingUp,
  Menu,
  Zap,
  Video,
  Smile,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  MoreVertical,
  Trash2,
  Edit3,
  EyeOff,
  Flag,
  Ban
} from 'lucide-react';

// Tiptap 3 Imports (Named Exports)
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { getActiveApiKey } from '../apiUtils';
import { translateContent, useGlobalTranslate } from '../communityAiService';
import { FeedTitle } from '../components/FeedTitle';
import { ApiKeyModal } from '../components/ApiKeyModal';
import {
  getPostsByCategory,
  getPostDetail,
  createPost,
  getCommentsByPost,
  createComment,
  uploadCommunityImage,
  getGlobalPopularPosts,
  deletePost,
  hidePost,
  updatePost,
  deleteComment,
  getPostsByAuthor,
  reportPost,
  reportComment,
  type CommunityPost,
  type CommunityComment
} from '../communityService';
import { blockUser, getUserByUid } from '../userService';
import { getFlagEmoji } from '../utils/langUtils';
import { tComm } from '../i18n/communityTranslations';
import { PcAdSlot } from '../components/PcComponents';
import { type User as FirebaseUser } from 'firebase/auth';


interface CommunityForumProps {
  lang: string;
  firebaseUser: FirebaseUser | null;
  onBack?: () => void;
  externalPostId?: string;
}

const CATEGORY_GROUPS = [
  {
    id: 'MAIN_LOUNGE',
    label_key: 'cat_group_main',
    icon: <Globe size={16} />,
    items: [
      { id: 'ALL', name_key: 'cat_all', icon: '🌐' },
      { id: 'HOT', name_key: 'cat_hot', icon: '🔥' },
      { id: 'FREE', name_key: 'cat_free', icon: '💬' },
      { id: 'STUDY', name_key: 'cat_study', icon: '📝' },
      { id: 'MEDIA', name_key: 'cat_media', icon: '📺' },
      { id: 'EXCHANGE', name_key: 'cat_exchange', icon: '🤝' },
      { id: 'PROMO', name_key: 'cat_promo', icon: '📢' },
      { id: 'MY_POSTS', name_key: 'cat_my_posts', icon: '📂' },
    ]
  }
];

const getCategoryName = (id: string, lang: string) => {
  for (const group of CATEGORY_GROUPS) {
    const item = group.items.find(i => i.id === id);
    if (item) return tComm(lang, item.name_key);
  }
  return id;
};

export const CommunityForumScreen = ({ lang, firebaseUser, externalPostId, onBack }: CommunityForumProps) => {
  const { isGlobalTranslateOn } = useGlobalTranslate();
  const [view, setView] = useState<'LIST' | 'DETAIL' | 'WRITE'>(() => {
    return (localStorage.getItem('vq_forum_view') as 'LIST' | 'DETAIL' | 'WRITE') || 'LIST';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('vq_forum_category') || 'ALL';
  });
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [blockedUids, setBlockedUids] = useState<string[]>([]);

  useEffect(() => {
    if (firebaseUser?.uid) {
      getUserByUid(firebaseUser.uid).then(u => {
         if (u?.blockedUids) setBlockedUids(u.blockedUids);
      });
    }
  }, [firebaseUser?.uid]);

  useEffect(() => {
     const handler = () => setShowApiKeyModal(true);
     window.addEventListener('vq_show_api_key_modal', handler);
     return () => window.removeEventListener('vq_show_api_key_modal', handler);
  }, []);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalPostId) {
      handleExternalPost(externalPostId);
    }
  }, [externalPostId]);

  const handleExternalPost = async (postId: string) => {
    setLoading(true);
    try {
      const detail = await getPostDetail(postId);
      if (detail) {
        setSelectedPost(detail);
        const postComments = await getCommentsByPost(postId);
        setComments(postComments);
        setView('DETAIL');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('vq_forum_view', view);
    localStorage.setItem('vq_forum_category', selectedCategory);
  }, [view, selectedCategory]);

  useEffect(() => {
    if (view === 'LIST') {
      loadPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, view]);


  const loadPosts = async () => {
    setLoading(true);
    try {
      if (selectedCategory === 'MY_POSTS') {
        const fetchedPosts = await getPostsByAuthor(firebaseUser?.uid || 'guest');
        setPosts(fetchedPosts.filter(p => !blockedUids.includes(p.authorId)));
      } else {
        const { posts: fetchedPosts } = await getPostsByCategory(selectedCategory);
        setPosts(fetchedPosts.filter(p => !blockedUids.includes(p.authorId)));
      }
    } catch (e: unknown) {
      console.error(e);
      const err = e as { code?: string };
      if (err.code === 'permission-denied') {
        alert(tComm(lang, 'err_permission'));
      } else {
        alert(tComm(lang, 'err_load_posts'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  };

  const handleReportPost = async (postId: string) => {
    if (!firebaseUser) return;
    try {
      await reportPost(postId, firebaseUser.uid);
      alert(tComm(lang, 'alert_reported'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!firebaseUser) return;
    try {
      await reportComment(commentId, firebaseUser.uid);
      alert(tComm(lang, 'alert_reported'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockUser = async (authorId: string) => {
    if (!firebaseUser) return;
    try {
      await blockUser(firebaseUser.uid, authorId);
      const newBlocked = [...blockedUids, authorId];
      setBlockedUids(newBlocked);
      alert(tComm(lang, 'user_blocked'));
      if (view === 'DETAIL') {
         setView('LIST');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostClick = async (post: CommunityPost) => {
    setLoading(true);
    try {
      const detail = await getPostDetail(post.id!);
      if (detail && !blockedUids.includes(detail.authorId)) {
        setSelectedPost(detail);
        const postComments = await getCommentsByPost(post.id!);
        setComments(postComments.filter(c => !blockedUids.includes(c.authorId)));
        setView('DETAIL');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setView('LIST');
    setSelectedPost(null);
    setEditingPost(null);
    setIsVisible(true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm relative">
      <div className={`absolute top-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 pt-10 pb-4 px-4 md:pt-10 md:pb-6 md:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {(view === 'DETAIL' || view === 'WRITE') ? (
               <button onClick={handleBackToList} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all shrink-0">
                 <ArrowLeft size={24} />
               </button>
            ) : (
               onBack && (
                 <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all shrink-0">
                   <ArrowLeft size={24} />
                 </button>
               )
            )}
            
            <div className="relative">
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                     {view === 'LIST' ? getCategoryName(selectedCategory, lang) : 
                      (view === 'WRITE' ? 
                         (editingPost ? tComm(lang, 'edit_post') : tComm(lang, 'new_post')) : 
                      (selectedPost ? getCategoryName(selectedPost.category, lang) : tComm(lang, 'post_detail')))}
                     {view === 'WRITE' && (
                        <span className="text-[12px] md:text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transform -translate-y-[1px]">
                           {getCategoryName(editingPost ? editingPost.category : selectedCategory, lang)}
                        </span>
                     )}
                  </h2>
                </div>
              </div>

              {isMenuOpen && view === 'LIST' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-2 space-y-1 max-h-[80vh] overflow-y-auto no-scrollbar">
                      {CATEGORY_GROUPS[0].items.map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => {
                             setSelectedCategory(cat.id);
                             setIsMenuOpen(false);
                           }}
                           className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                             selectedCategory === cat.id
                             ? 'bg-indigo-600 text-white shadow-lg'
                             : 'text-slate-600 hover:bg-slate-50 active:scale-95'
                           }`}
                         >
                           <div className="flex items-center gap-3">
                             <span className="text-lg">{cat.icon}</span>
                             <span className="font-bold text-sm">{tComm(lang, String((cat as Record<string, unknown>)[`name_key`]))}</span>
                           </div>
                           {selectedCategory === cat.id && <Zap size={14} className="text-white animate-pulse" />}
                         </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
             {view === 'LIST' && (
               <>
                 <button onClick={() => setView('WRITE')} className="bg-indigo-600 text-white p-2.5 md:px-5 md:py-2.5 rounded-xl font-black text-sm hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                   <PenSquare size={16} />
                   <span className="hidden md:inline">{tComm(lang, 'new_post')}</span>
                 </button>
                 <button
                   onClick={() => setIsMenuOpen(!isMenuOpen)}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-all ${isMenuOpen ? 'bg-slate-800 rotate-90' : 'bg-slate-800 hover:bg-slate-900'}`}
                 >
                    <Menu size={22} />
                 </button>
               </>
             )}
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar pt-24 md:pt-28">
        {view === 'LIST' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 pb-20">
              {loading && posts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                   <MessageSquare size={48} className="mb-4 opacity-10" />
                   <p className="font-bold text-slate-400 capitalize">{tComm(lang, 'no_posts')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {posts.map(post => {
                    const isAdminMode = firebaseUser?.email === 'idouhak1@gmail.com' || firebaseUser?.email === 'kimnamhyung8@gmail.com';
                    const isHiddenVisual = post.isHidden && !isAdminMode;
                    return (
                    <div key={post.id} onClick={() => handlePostClick(post)} className={`p-6 md:p-8 hover:bg-slate-50 cursor-pointer transition-colors group relative flex gap-6 ${post.isHidden ? 'opacity-60 bg-slate-50' : ''}`}>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-6 flex items-center">
                               {post.isHidden && <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-md mr-2 whitespace-nowrap">블라인드</span>}
                               {!isHiddenVisual && <span className="mr-2 text-xl self-start" title={post.originalLang}>{getFlagEmoji(post.originalLang || 'ko')}</span>}
                               {isHiddenVisual ? <span className="text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">🚫 {tComm(lang, 'hidden_post_title')}</span> : <FeedTitle post={post} lang={lang} isGlobalTranslateOn={isGlobalTranslateOn} />}
                            </h4>
                            {post.commentCount > 0 && <span className="bg-rose-50 text-rose-500 text-[10px] font-black px-2 py-0.5 rounded-md self-start">{post.commentCount}</span>}
                         </div>
                         
                         {!isHiddenVisual && (
                         <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                                   {post.authorAvatar ? <img src={post.authorAvatar} alt="av" className="w-full h-full object-cover" /> : <User size={12} />}
                                </div>
                                <span className="text-slate-600">{post.authorName}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto"><Eye size={12} /> {post.viewCount}</div>
                         </div>
                         )}
                      </div>
                      
                      {!isHiddenVisual && post.mediaUrls && post.mediaUrls.length > 0 && (
                         <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <img src={post.mediaUrls[0]} alt="thumb" className="w-full h-full object-cover" />
                         </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
            
            <div className="w-full pb-8 px-4 md:px-8">
               <PcAdSlot variant="horizontal" className="w-full shadow-sm rounded-3xl overflow-hidden border border-slate-100/50" />
            </div>
          </div>
        )}

        {view === 'DETAIL' && selectedPost && (
          <PostDetailView
            post={selectedPost}
            comments={comments}
            firebaseUser={firebaseUser}
            lang={lang}
            onCommentAdded={async () => {
               const updatedComments = await getCommentsByPost(selectedPost.id!);
               setComments(updatedComments);
            }}
            onEditPost={(post) => {
               setEditingPost(post);
               setView('WRITE');
            }}
            onDeletePost={async (postId) => {
               if (window.confirm(tComm(lang, 'confirm_delete_post'))) {
                 await deletePost(postId);
                 setView('LIST');
                 setPosts(prev => prev.filter(p => p.id !== postId));
               }
            }}
            onHidePost={async (postId, isHidden) => {
               await hidePost(postId, isHidden);
               setPosts(prev => prev.map(p => p.id === postId ? { ...p, isHidden } : p));
               if (selectedPost && selectedPost.id === postId) {
                 setSelectedPost({ ...selectedPost, isHidden });
               }
            }}
            onDeleteComment={async (commentId) => {
               if (window.confirm(lang === 'ko' ? '정말로 삭제하시겠습니까?' : 'Delete this comment?')) {
                 await deleteComment(selectedPost.id!, commentId);
                 const updatedComments = await getCommentsByPost(selectedPost.id!);
                 setComments(updatedComments);
                 setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p));
               }
            }}
            onReportPost={handleReportPost}
            onReportComment={handleReportComment}
            onBlockUser={handleBlockUser}
          />
        )}

        {view === 'WRITE' && (
          <PostWriteView
            lang={lang}
            category={selectedCategory}
            firebaseUser={firebaseUser}
            initialPost={editingPost}
            onSuccess={handleBackToList}
          />
        )}
      </div>

      {showApiKeyModal && (
        <ApiKeyModal 
            settings={{ lang }} 
            onClose={() => setShowApiKeyModal(false)}
            onSave={() => setShowApiKeyModal(false)}
        />
      )}
    </div>
  );
};

// VideoEmbedList?????뺥깴???롪퍓???쎄껀??깅뮔??????Tiptap ?リ옇?↑??リ섣???????HTML ??iframe??怨쀬Ŧ ??嶺뚳퐢?筌???덈펲.
const VideoEmbedList = ({ content }: { content: string }) => {
  // If it's Tiptap HTML, don't parse standard text youtube links
  if (content.startsWith('<')) return null;
  
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
  const ytMatches = Array.from(content.matchAll(youtubeRegex));
  if (ytMatches.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      {ytMatches.map((match, i) => (
        <div key={`yt-${i}`} className="aspect-video rounded-[32px] overflow-hidden bg-slate-100 shadow-2xl border border-slate-200">
          <iframe width="100%" height="100%" src={`https://www.youtube-nocookie.com/embed/${match[1]}?playsinline=1&modestbranding=1`} frameBorder="0" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      ))}
    </div>
  );
};

const RichTextRenderer = ({ content, className }: { content: string, className?: string }) => {
  if (!content) return null;
  let html = content;
  
  // Patch youtube embeds to prevent WKWebView 150/153 Error on iOS
  html = html.replace(/src="https:\/\/www\.youtube(-nocookie)?\.com\/embed\/([^"?]+)(\?[^"]*)?"/g, (_match, _nocookie, id, params) => {
     let newParams = params ? params.replace('?', '?playsinline=1&') : '?playsinline=1';
     return `src="https://www.youtube-nocookie.com/embed/${id}${newParams}&modestbranding=1" referrerpolicy="strict-origin-when-cross-origin"`;
  });
  
  // ???뺥깴?????⑸츩???リ옇?↑??곌떠???(??瑜곷쭊 ?筌뤿굞???
  if (!content.startsWith('<')) {
    html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />')
      .replace(/\[B\](.*?)\[\/B\]/gi, '<strong>$1</strong>')
      .replace(/\[COLOR:([#a-zA-Z0-9]+)\](.*?)\[\/COLOR\]/gi, '<span style="color: $1">$2</span>')
      .replace(/\[IMG:(.*?)\]/gi, '<img src="$1" style="width: 100%; border-radius: 40px; margin: 24px 0;" />');
  }

  return (
    <div 
      className={`prose prose-slate max-w-[100vw] overflow-hidden w-full 
                  [&_img]:!max-w-full [&_img]:!h-auto [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:mx-auto [&_img]:my-6
                  [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:aspect-video [&_iframe]:!h-auto [&_iframe]:rounded-2xl [&_iframe]:shadow-md [&_iframe]:mx-auto [&_iframe]:my-6
                  prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed prose-p:break-words
                  prose-a:text-indigo-600 prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl
                  ${className || ''}`} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

const TranslateButton = ({ originalText, targetLang, onTranslate, autoTranslate = false, isHtml = false }: { originalText: string; targetLang: string; onTranslate: (translated: string) => void; autoTranslate?: boolean; isHtml?: boolean }) => {
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);

  const handleTranslate = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (translated) {
        onTranslate(''); 
        setTranslated(false);
        return;
    }

    const userSavedKey = localStorage.getItem('vq_gemini_key');
    if (!userSavedKey) {
        if (e) window.dispatchEvent(new CustomEvent('vq_show_api_key_modal'));
        return;
    }

    setTranslating(true);
    try {
        const result = await translateContent(originalText, targetLang, getActiveApiKey(userSavedKey, false, 0)!, isHtml);
        onTranslate(result);
        setTranslated(true);
    } catch (err: unknown) {
        console.error('Translation error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown translation error occurred';
        if (e) alert(errorMsg);
    } finally {
        setTranslating(false);
    }
  };

  useEffect(() => {
    if (autoTranslate && !translated && !translating) {
        handleTranslate();
    }
  }, [autoTranslate, translated, translating, originalText]);

  return (
    <button 
      onClick={handleTranslate}
      disabled={translating}
      className={`inline-flex items-center gap-1 text-[11px] font-bold transition-all shrink-0 mt-2 hover:underline
        ${translated ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'} 
        ${translating ? 'opacity-50 cursor-wait' : ''}`}
    >
      <Globe size={12} className={translating ? 'animate-spin' : ''} />
      {translating ? (tComm(targetLang, 'translating')) : 
       translated ? (tComm(targetLang, 'show_original')) : 
       (tComm(targetLang, 'ai_translate'))}
    </button>
  );
};

const CommentItem = ({ comment, lang, firebaseUser, isGlobalTranslateOn, onDelete, onReport, onBlock }: { 
  comment: CommunityComment & { authorName?: string; authorAvatar?: string; createdAt?: { toDate?: () => Date } }; 
  lang: string;
  firebaseUser: FirebaseUser | null;
  isGlobalTranslateOn?: boolean;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onBlock?: (authorId: string) => void;
}) => {
  const [translatedContent, setTranslatedContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = firebaseUser?.uid === comment.authorId;
  const isAdmin = firebaseUser?.email === 'idouhak1@gmail.com' || firebaseUser?.email === 'kimnamhyung8@gmail.com';
  const canDelete = isAuthor || isAdmin;

  return (
    <div className="flex gap-3 p-4 bg-slate-50 rounded-[20px]">
      <div className="w-8 h-8 rounded-full bg-white overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 shadow-sm">
        {comment.authorAvatar ? <img src={comment.authorAvatar} alt="av" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-300" />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 block">{comment.authorName}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : ''}
            </span>
          </div>
          {firebaseUser && (
             <div className="relative">
               <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 transition-colors ml-2">
                 <MoreVertical size={14} />
               </button>
               {showMenu && (
                 <>
                   <div className="fixed inset-0 z-[30]" onClick={() => setShowMenu(false)} />
                   <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-[40]">
                     {canDelete && onDelete && <button onClick={() => { setShowMenu(false); onDelete(comment.id!); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-slate-50"><Trash2 size={14}/> {tComm(lang, 'delete')}</button>}
                     {!isAuthor && onReport && <button onClick={() => { setShowMenu(false); window.confirm(tComm(lang, 'report') + '?') && onReport(comment.id!); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-orange-500 hover:bg-orange-50 flex items-center gap-2 border-t border-slate-50"><Flag size={14}/> {tComm(lang, 'report')}</button>}
                     {!isAuthor && onBlock && <button onClick={() => { setShowMenu(false); window.confirm(tComm(lang, 'block_user') + '?') && onBlock(comment.authorId); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"><Ban size={14}/> {tComm(lang, 'block_user')}</button>}
                   </div>
                 </>
               )}
             </div>
          )}
        </div>
        <div className="text-[14px] md:text-[15px] text-slate-700 font-medium leading-[1.6] break-words">
          {translatedContent || comment.content}
        </div>
        <div className="pt-1">
          <TranslateButton 
            originalText={comment.content} 
            targetLang={lang} 
            onTranslate={setTranslatedContent} autoTranslate={isGlobalTranslateOn} 
          />
        </div>
      </div>
    </div>
  );
};

const PostDetailView = ({ post, comments, firebaseUser, lang, isGlobalTranslateOn, onCommentAdded, onEditPost, onDeletePost, onDeleteComment, onHidePost, onReportPost, onReportComment, onBlockUser }: {
  post: CommunityPost;
  comments: CommunityComment[];
  firebaseUser: FirebaseUser | null;
  lang: string;
  isGlobalTranslateOn?: boolean;
  onCommentAdded: () => void;
  onEditPost: (post: CommunityPost) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onHidePost: (postId: string, isHidden: boolean) => void;
  onReportPost: (postId: string) => void;
  onReportComment: (commentId: string) => void;
  onBlockUser: (authorId: string) => void;
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const isAdmin = firebaseUser?.email === 'idouhak1@gmail.com' || firebaseUser?.email === 'kimnamhyung8@gmail.com';
  const isAuthor = firebaseUser?.uid === post.authorId;
  const canDelete = isAuthor || isAdmin;
  const isHiddenVisual = post.isHidden && !isAdmin;

  const handleSubmitComment = async () => {
    if (!firebaseUser || !commentText.trim() || !post.id) return;
    setIsSubmitting(true);
    try {
      let content_en = commentText;
      const userSavedKey = localStorage.getItem('vq_gemini_key');
      const apiKey = userSavedKey ? getActiveApiKey(userSavedKey, false, 0) : null;
      if (apiKey && lang !== 'en') {
         try {
            content_en = await translateContent(commentText, 'en', apiKey, false);
         } catch (err) {
            console.warn('Auto translation failed on comment creation:', err);
         }
      }

      await createComment(post.id, {
        content: commentText,
        content_en,
        originalLang: lang,
        authorId: firebaseUser.uid,
        authorName: firebaseUser.displayName || 'Guest',
        authorAvatar: firebaseUser.photoURL || '',
      });
      setCommentText('');
      onCommentAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 md:p-8 w-full space-y-6 md:space-y-8 pb-32">
        <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                {post.isHidden && <span className="bg-slate-800 text-white text-sm px-2 py-1 rounded-md mr-2 align-middle font-bold shrink-0">블라인드</span>}
                {!isHiddenVisual && <span className="mr-2 text-2xl align-middle" title={post.originalLang}>{getFlagEmoji(post.originalLang || 'ko')}</span>}
                {isHiddenVisual ? `🚫 ${tComm(lang, 'hidden_post_title')}` : (translatedTitle || post.title)}
            </h3>
            {!isHiddenVisual && <TranslateButton 
              originalText={post.title} 
              targetLang={lang} 
              onTranslate={setTranslatedTitle} autoTranslate={isGlobalTranslateOn} 
            />}
        </div>
        {!isHiddenVisual && (
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                  {post.authorAvatar ? <img src={post.authorAvatar} alt="av" className="w-full h-full object-cover" /> : <User size={16} className="text-slate-400" />}
               </div>
               <div>
                 <div className="text-slate-900 font-bold">{post.authorName}</div>
                 <div className="text-[10px] text-slate-400 uppercase">{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : ''}</div>
               </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
               <div className="flex items-center gap-1 text-slate-400 ml-auto"><Eye size={14} /> <span>{post.viewCount}</span></div>
               {firebaseUser && (
                 <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 transition-colors ml-2">
                      <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-[30]" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-[40]">
                          {isAuthor && <button onClick={() => { setShowMenu(false); onEditPost(post); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit3 size={14}/> {tComm(lang, 'edit')}</button>}
                          {isAdmin && <button onClick={() => { setShowMenu(false); onHidePost(post.id!, !post.isHidden); }} className={`w-full text-left px-4 py-2.5 text-[13px] font-bold flex items-center gap-2 border-t border-slate-50 ${post.isHidden ? 'text-indigo-600 hover:bg-indigo-50' : 'text-orange-500 hover:bg-orange-50'}`}>{post.isHidden ? <Eye size={14}/> : <EyeOff size={14}/>} {post.isHidden ? tComm(lang, 'unhide') : tComm(lang, 'hide_post')}</button>}
                          {canDelete && <button onClick={() => { setShowMenu(false); onDeletePost(post.id!); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"><Trash2 size={14}/> {tComm(lang, 'delete')}</button>}
                          {!isAuthor && <button onClick={() => { setShowMenu(false); window.confirm(tComm(lang, 'report') + '?') && onReportPost(post.id!); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-orange-500 hover:bg-orange-50 flex items-center gap-2 border-t border-slate-50"><Flag size={14}/> {tComm(lang, 'report')}</button>}
                          {!isAuthor && <button onClick={() => { setShowMenu(false); window.confirm(tComm(lang, 'block_user') + '?') && onBlockUser(post.authorId); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"><Ban size={14}/> {tComm(lang, 'block_user')}</button>}
                        </div>
                      </>
                    )}
                 </div>
               )}
            </div>
        </div>
        )}
        <div className="text-[15px] md:text-base text-slate-800 font-normal leading-[1.6] space-y-4">
           {isHiddenVisual ? (
              <div className="pt-10 pb-16 bg-slate-50 text-slate-400 text-center rounded-3xl font-medium border border-slate-100/50">
                <EyeOff size={48} className="mx-auto mb-4 opacity-20" />
                {tComm(lang, 'hidden_post_desc')}
              </div>
           ) : (
             <>
                <RichTextRenderer content={translatedContent || post.content} />
                <VideoEmbedList content={post.content} />
                <TranslateButton 
                  originalText={post.content} 
                  targetLang={lang} 
                  onTranslate={setTranslatedContent} autoTranslate={isGlobalTranslateOn} 
                  isHtml={true}
                />
             </>
           )}
        </div>

        {/* AdSense Placement (Single Slot) */}
        {!isHiddenVisual && (
          <div className="w-full pt-8 pb-4">
             <PcAdSlot variant="horizontal" adClient="ca-pub-2942259555786766" adSlot="3363415185" className="w-full shadow-sm rounded-[24px] overflow-hidden border border-slate-100/50" />
          </div>
        )}

        <div className="pt-10 md:pt-16 border-t border-slate-100 space-y-6 md:space-y-8">
           <h4 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" /> {tComm(lang, 'comments')} {comments.length}
           </h4>
           <div className="space-y-3 md:space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment as CommunityComment & { createdAt?: { toDate?: () => Date } }} lang={lang} firebaseUser={firebaseUser} onDelete={onDeleteComment} onReport={onReportComment} onBlock={onBlockUser} />
              ))}
           </div>
           
           <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 pb-[max(env(safe-area-inset-bottom),16px)] z-[100] shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
             <div className="w-full flex gap-3 items-end">
              <textarea
                className="flex-1 bg-slate-50 rounded-[20px] border border-slate-100 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 text-[15px] font-medium placeholder:text-slate-400 resize-none min-h-[44px] max-h-[120px] py-2.5 px-4 transition-all overflow-y-auto"
                placeholder={tComm(lang, 'leave_comment')}
                value={commentText}
                onChange={(e) => {
                   setCommentText(e.target.value);
                   e.target.style.height = 'auto';
                   e.target.style.height = e.target.scrollHeight + 'px';
                }}
                disabled={!firebaseUser}
              />
              <button 
                onClick={handleSubmitComment} 
                disabled={isSubmitting || !commentText.trim() || !firebaseUser} 
                className="bg-indigo-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shrink-0"
              >
                {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={16} />}
              </button>
             </div>
           </div>
        </div>
    </div>
  );
};

const PostWriteView = ({ lang, category, firebaseUser, onSuccess, initialPost }: {
  lang: string;
  category: string;
  firebaseUser: FirebaseUser | null;
  onSuccess: () => void;
  initialPost?: CommunityPost | null;
}) => {
  const [draftCategory, setDraftCategory] = useState(() => (['ALL', 'HOT', 'MY_POSTS'].includes(category)) ? 'FREE' : category);
  const [title, setTitle] = useState(() => initialPost ? initialPost.title : (localStorage.getItem('vq_forum_draft_title') || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: { class: 'rounded-3xl shadow-xl my-6 mx-auto block max-w-full' },
      }),
      Youtube.configure({ width: 480, height: 320, HTMLAttributes: { class: 'mx-auto rounded-3xl overflow-hidden my-8' } }),
      Placeholder.configure({ placeholder: lang === 'ko' ? '내용을 입력하세요...' : 'Write your content here...' }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      TextStyle,
    ],
    content: initialPost ? initialPost.content : (localStorage.getItem('vq_forum_draft_content') || ''),
    onUpdate: ({ editor }) => {
      localStorage.setItem('vq_forum_draft_content', editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] text-lg md:text-xl p-6' },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const hasImage = items.some(i => i.type.startsWith('image/'));
        
        if (hasImage && firebaseUser) {
           event.preventDefault();
           const files = items
              .filter(item => item.type.startsWith('image/'))
              .map(item => item.getAsFile())
              .filter(Boolean) as File[];
           
           if (files.length > 0) {
              setIsUploading(true);
              Promise.all(files.map(async file => await uploadCommunityImage(file, firebaseUser.uid)))
                .then(urls => {
                   urls.forEach(url => {
                      view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
                   });
                })
                .catch(err => {
                   console.error('Paste Upload Error:', err);
                   alert(lang === 'ko' ? '이미지 업로드 중 오류가 발생했습니다.' : 'Error uploading images.');
                })
                .finally(() => setIsUploading(false));
              return true;
           }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        const hasFiles = event.dataTransfer?.files?.length;
        if (!moved && hasFiles && firebaseUser) {
           const files = Array.from(event.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
           if (files.length > 0) {
              event.preventDefault();
              setIsUploading(true);
              
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              
              Promise.all(files.map(async file => await uploadCommunityImage(file, firebaseUser.uid)))
                .then(urls => {
                   if (coordinates) {
                      view.dispatch(view.state.tr.setSelection((view.state.selection.constructor as any).near(view.state.doc.resolve(coordinates.pos))));
                   }
                   urls.forEach(url => {
                      view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
                   });
                })
                .catch(err => {
                   console.error('Drop Upload Error:', err);
                })
                .finally(() => setIsUploading(false));
              return true;
           }
        }
        return false;
      }
    },
  });

  useEffect(() => {
    localStorage.setItem('vq_forum_draft_title', title);
  }, [title]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[Editor] FileChange triggered, count:', e.target.files?.length);
    if (e.target.files && firebaseUser && editor) {
      const files = Array.from(e.target.files);
      setIsUploading(true);
      try {
         // Upload image and get URLs
         const uploadPromises = files.map(async (file) => {
            console.log('[Editor] Uploading file:', file.name);
            const url = await uploadCommunityImage(file, firebaseUser.uid);
            console.log('[Editor] Uploaded, inserting into Tiptap:', url);
            return url;
         });

         const urls = await Promise.all(uploadPromises);
         
         // Insert into editor
         urls.forEach(url => {
            editor.chain().focus().setImage({ src: url }).run();
         });
         
         console.log('[Editor] All images inserted successfully');
      } catch (err) {
         console.error('[Editor] Upload/Insert Error:', err);
         alert(lang === 'ko' ? '이미지 업로드 중 오류가 발생했습니다.' : 'Error uploading images.');
      } finally {
         console.log('[Editor] Finishing upload process');
         setIsUploading(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!editor || !title.trim() || !firebaseUser) return;
    setIsSubmitting(true);
    try {
      const fullContent = editor.getHTML();
      const mediaUrls: string[] = [];
      const div = document.createElement('div');
      div.innerHTML = fullContent;
      div.querySelectorAll('img').forEach(img => mediaUrls.push(img.src));

      let title_en = title;
      let content_en = fullContent;
      const userSavedKey = localStorage.getItem('vq_gemini_key');
      const apiKey = userSavedKey ? getActiveApiKey(userSavedKey, false, 0) : null;
      if (apiKey && lang !== 'en') {
        try {
          title_en = await translateContent(title, 'en', apiKey, false);
          content_en = await translateContent(fullContent, 'en', apiKey, true);
        } catch (err) {
          console.warn('Auto translation failed on post creation:', err);
        }
      }

      if (initialPost && initialPost.id) {
        await updatePost(initialPost.id, {
          title,
          content: fullContent,
          title_en,
          content_en,
          mediaUrls,
        });
      } else {
        await createPost({
          category: draftCategory,
          title,
          content: fullContent,
          title_en,
          content_en,
          mediaUrls,
          authorId: firebaseUser.uid,
          authorName: firebaseUser.displayName || 'Guest',
          authorAvatar: firebaseUser.photoURL || '',
          originalLang: lang,
        });
      }
      onSuccess();
      if (!initialPost) {
        localStorage.removeItem('vq_forum_draft_title');
        localStorage.removeItem('vq_forum_draft_content');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col md:static md:z-0 md:h-full">
      <div className="w-full h-full max-w-5xl mx-auto bg-white flex flex-col shadow-2xl md:shadow-none">
        {/* Header - Stays sticky at the absolute top of the modal */}
        <div 
           className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-50"
           style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
        >
           <div className="flex items-center gap-3 md:gap-4">
              <button onClick={onSuccess} className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all shrink-0">
                 <ArrowLeft size={24} />
              </button>
              <h2 className="flex items-center">
                 <select 
                    value={draftCategory} 
                    onChange={e => setDraftCategory(e.target.value)} 
                    disabled={!!initialPost}
                    className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl text-[14px] md:text-[16px] border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer appearance-none pr-8 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1em 1em'
                    }}
                 >
                    {CATEGORY_GROUPS[0].items.filter(item => !['ALL', 'HOT', 'MY_POSTS'].includes(item.id)).map(item => (
                       <option key={item.id} value={item.id}>{item.icon} {tComm(lang, item.name_key)}</option>
                    ))}
                 </select>
              </h2>
           </div>
           
           <button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} className="bg-indigo-600 hover:bg-slate-900 text-white font-black px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all shrink-0">
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white" /> : <><Send size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden md:inline">{tComm(lang, 'publish_post')}</span></>}
           </button>
        </div>

        {/* Scrollable Content Area - the only part that shrinks/scrolls when keyboard opens */}
        <div className="flex-1 overflow-y-auto w-full relative bg-slate-50/20">
           <div className="w-full p-4 md:p-8 space-y-4 pb-64 min-h-full">
              {/* 1. Title Input (Bigger, clearly separated) */}
              <input type="text" className="w-full text-2xl md:text-3xl font-black border-none focus:ring-0 placeholder:text-slate-300 bg-transparent p-0 leading-tight pt-2" placeholder={tComm(lang, 'enter_title')} value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* Category Dropdown moved to Header */}
              {/* 3. Toolbar - Compacted right above content */}
              <div className="bg-white border border-slate-200 rounded-[16px] overflow-x-auto no-scrollbar shadow-sm sticky top-0 z-10 mx-[-4px]">
                 <div className="flex items-center px-2 py-1.5 md:px-4 md:py-2 gap-1 min-w-max">
                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl transition-all">
                       <ImageIcon size={16} /> <span className="text-[11px] font-bold">{tComm(lang, 'image')}</span>
                   </button>
                   <button onClick={() => setShowVideoModal(true)} className="flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl transition-all">
                       <Video size={16} /> <span className="text-[11px] font-bold">{tComm(lang, 'video')}</span>
                   </button>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <div className="flex bg-slate-50 p-0.5 rounded-xl">
                     <button onClick={() => editor?.chain().toggleBold().run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive('bold') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Bold size={14} /></button>
                     <button onClick={() => editor?.chain().toggleItalic().run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive('italic') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Italic size={14} /></button>
                     <button onClick={() => editor?.chain().toggleUnderline().run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive('underline') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><UnderlineIcon size={14} /></button>
                   </div>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <div className="flex bg-slate-50 p-0.5 rounded-xl">
                     <button onClick={() => editor?.chain().setTextAlign('left').run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><AlignLeft size={14} /></button>
                     <button onClick={() => editor?.chain().setTextAlign('center').run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><AlignCenter size={14} /></button>
                     <button onClick={() => editor?.chain().setTextAlign('right').run()} className={`p-1.5 rounded-lg transition-all ${editor?.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><AlignRight size={14} /></button>
                   </div>
                   <div className="w-px h-5 bg-slate-100 mx-1" />
                   <button onClick={() => editor?.chain().setColor('#f43f5e').run()} className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-400 transition-all"><Palette size={14} /></button>
                   <button onClick={() => editor?.chain().toggleHighlight({ color: '#fef08a' }).run()} className={`p-1.5 rounded-xl transition-all ${editor?.isActive('highlight') ? 'bg-amber-400 text-white shadow-sm' : 'hover:bg-amber-50 text-amber-400'}`}><Highlighter size={14} /></button>
                   <button onClick={() => setShowEmojiPicker(true)} className="flex items-center gap-1 hover:bg-amber-50 text-amber-500 px-3 py-1.5 rounded-xl transition-all ml-1"><Smile size={14} /> <span className="text-[11px] font-bold">Emoji</span></button>
                 </div>
              </div>

              <div className="relative pt-2 editor-container min-h-[400px]">
                 {editor && (
                    <>
                      <BubbleMenu editor={editor} className="bg-slate-900 text-white rounded-xl shadow-2xl flex items-center overflow-hidden border border-slate-700">
                         <button onClick={() => editor.chain().toggleBold().run()} className={`p-3 hover:bg-slate-800 ${editor.isActive('bold') ? 'text-indigo-400' : ''}`}><Bold size={14} /></button>
                         <button onClick={() => editor.chain().toggleItalic().run()} className={`p-3 hover:bg-slate-800 ${editor.isActive('italic') ? 'text-indigo-400' : ''}`}><Italic size={14} /></button>
                         <button onClick={() => editor.chain().toggleHighlight().run()} className={`p-3 hover:bg-slate-800 ${editor.isActive('highlight') ? 'text-amber-400' : ''}`}><Highlighter size={14} /></button>
                         <button onClick={() => editor.chain().setTextAlign('center').run()} className="p-3 hover:bg-slate-800"><AlignCenter size={14} /></button>
                      </BubbleMenu>
                      <EditorContent editor={editor} />
                    </>
                 )}
                 {isUploading && <div className="absolute top-0 right-0 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl animate-bounce text-xs font-black z-50 flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />Optimizing...</div>}
              </div>
           </div>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />

       {showEmojiPicker && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowEmojiPicker(false)} />
             <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
                <div className="grid grid-cols-5 gap-4">
                   {['😀','😁','😆','😅','😂','🤣','🥲','☺️','😊','😉','😍','🥰','😘','😜','🤪','😎','🥺','😢','😭','😤','😡','🤬','🤯','🥶'].map(emo => (
                     <button key={emo} onClick={() => { editor?.chain().focus().insertContent(emo).run(); setShowEmojiPicker(false); }} className="p-3 hover:bg-slate-50 rounded-2xl text-2xl active:scale-90 transition-all">{emo}</button>
                   ))}
                </div>
             </div>
          </div>
       )}

       {showVideoModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVideoModal(false)} />
             <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative">
                <div className="space-y-6">
                   <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" placeholder="Youtube URL..." />
                   <div className="flex gap-3">
                     <button onClick={() => setShowVideoModal(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black">Cancel</button>
                     <button onClick={() => { if(videoUrlInput) { editor?.chain().focus().setYoutubeVideo({ src: videoUrlInput }).run(); setShowVideoModal(false); setVideoUrlInput(''); } }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Add Video</button>
                   </div>
                </div>
             </div>
          </div>
       )}

       <style>{`
          .editor-container .ProseMirror { outline: none !important; min-height: 400px; }
          .editor-container .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; }
          .prose img { border-radius: 1.5rem; max-width: 100%; height: auto; }
          .prose iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 1.5rem; }
       `}</style>
    </div>
  );
};

export const RankingTicker = ({ onPostClick }: { onPostClick: (post: CommunityPost) => void }) => {
  const [popularPosts, setPopularPosts] = useState<CommunityPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { getGlobalPopularPosts(5).then(setPopularPosts); }, []);
  useEffect(() => {
    if (popularPosts.length <= 1) return;
    const timer = setInterval(() => { setCurrentIndex(prev => (prev + 1) % popularPosts.length); }, 4000);
    return () => clearInterval(timer);
  }, [popularPosts]);
  if (popularPosts.length === 0) return null;
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all h-12" onClick={() => onPostClick(popularPosts[currentIndex])}>
      <TrendingUp size={14} className="text-amber-300" />
      <span className="text-[10px] font-black uppercase text-white/80">Best</span>
      <div className="h-4 w-px bg-white/20" />
      <span className="text-sm font-bold text-white line-clamp-1">{popularPosts[currentIndex].title}</span>
    </div>
  );
};



