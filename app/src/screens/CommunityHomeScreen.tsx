import { useState, useEffect, useMemo } from 'react';
import { 
  Globe, TrendingUp, ChevronRight, PenSquare, Eye, PlayCircle, MessageSquare, Star, User, Bell, Languages, Flame, ArrowLeft
} from 'lucide-react';
import { 
  getGlobalPopularPosts, 
  getAggregatedHomePosts,
  type CommunityPost 
} from '../communityService';
import { auth } from '../firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFlagEmoji } from '../utils/langUtils'; // We'll create this
import { PcAdSlot } from '../components/PcComponents';
import { tComm } from '../i18n/communityTranslations';
import { useGlobalTranslate } from '../communityAiService';
import { FeedTitle } from '../components/FeedTitle';

interface CommunityHomeScreenProps {
  lang: string;
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToPost: (postId: string) => void;
  onLoginClick: () => void;
  onBack?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_META: Record<string, { name: string, icon: string, color: string }> = {
  'HOT': { name: '실시간 베스트', icon: '🔥', color: 'bg-rose-50 text-rose-600' },
  'FREE': { name: '자유/일상', icon: '💬', color: 'bg-blue-50 text-blue-600' },
  'STUDY': { name: '영어 Q&A', icon: '📝', color: 'bg-indigo-50 text-indigo-600' },
  'MEDIA': { name: '미디어/팝콘', icon: '📺', color: 'bg-emerald-50 text-emerald-600' },
  'EXCHANGE': { name: '친구 찾기', icon: '🤝', color: 'bg-amber-50 text-amber-600' },
  'PROMO': { name: '홍보/건의', icon: '📢', color: 'bg-slate-100 text-slate-700' },
  'MY_POSTS': { name: '내가 쓴 글', icon: '📂', color: 'bg-indigo-50 text-indigo-600' },
};

// eslint-disable-next-line react-refresh/only-export-components
export const getCategoryName = (id: string, lang: string) => {
  if (CATEGORY_META[id]) {
    return tComm(lang, `cat_${id.toLowerCase()}`);
  }
  return id;
};


export const CommunityHomeScreen = ({ lang, onNavigateToCategory, onNavigateToPost, onLoginClick, onBack }: CommunityHomeScreenProps) => {
  const { isGlobalTranslateOn, toggleGlobalTranslate } = useGlobalTranslate();
  const [popularPosts, setPopularPosts] = useState<CommunityPost[]>([]);
  const [aggregatedPosts, setAggregatedPosts] = useState<Record<string, CommunityPost[]>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const bestCreators = useMemo(() => {
    const scores: Record<string, { n: string, p: number, avatar: string, lang: string }> = {};
    const allPosts = [...popularPosts, ...Object.values(aggregatedPosts).flat()];
    allPosts.forEach(post => {
      const key = post.authorName || 'Guest';
      if (!scores[key]) {
        scores[key] = { n: key, p: 0, avatar: post.authorAvatar, lang: post.originalLang || 'ko' };
      }
      scores[key].p += (post.viewCount || 0) + (post.commentCount || 0) * 5;
    });
    return Object.values(scores)
      .sort((a, b) => b.p - a.p)
      .slice(0, 3);
  }, [popularPosts, aggregatedPosts]);

  const trendingTags = useMemo(() => {
    const allPosts = [...popularPosts, ...Object.values(aggregatedPosts).flat()];
    const hashtags: Record<string, number> = {};
    
    // Parse real hashtags
    allPosts.forEach(p => {
      const text = (p.content || '') + ' ' + (p.title || '');
      const matcher = text.match(/#[a-zA-Z가-힣0-9_]+/g);
      if (matcher) {
        matcher.forEach(tag => {
          hashtags[tag] = (hashtags[tag] || 0) + (p.viewCount || 1);
        });
      }
    });

    let topTags = Object.entries(hashtags).sort((a,b) => b[1] - a[1]).map(x => x[0]);
    
    // Fallback to title keywords if not enough hashtags
    if (topTags.length < 5) {
      const stopWords = ['the', 'is', 'in', 'and', 'to', 'how', 'what', 'for', 'of', 'are', '그냥', '진짜', '너무', '정말', '이거', '제가', '하는', '있나요', '어떻게', '왜', '이런', '저런'];
      const words: Record<string, number> = {};
      allPosts.forEach(p => {
         const tokens = (p.title || '').replace(/[^\w가-힣\s]/g, '').split(/\s+/);
         tokens.forEach((w: string) => {
           if (w.length >= 2 && !stopWords.includes(w.toLowerCase())) {
             const tag = '#' + w;
             if (!topTags.includes(tag)) {
               words[tag] = (words[tag] || 0) + (p.viewCount || 1);
             }
           }
         });
      });
      const extraTags = Object.entries(words).sort((a,b) => b[1] - a[1]).map(x => x[0]);
      topTags = [...topTags, ...extraTags];
    }
    
    const fallback = ['#VocaQuest', '#LanguageExchange', '#StudyMotivation', '#English', '#Korean'];
    while(topTags.length < 5) {
       topTags.push(fallback.shift() || '#Trending');
    }
    
    // remove duplicates uniquely
    return Array.from(new Set(topTags)).slice(0, 5);
  }, [popularPosts, aggregatedPosts]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hot, aggregated] = await Promise.all([
          getGlobalPopularPosts(10), // Limit to 10 for best swipe
          getAggregatedHomePosts(50)  // Fetch latest 50 for local category grouping
        ]);
        setPopularPosts(hot);
        setAggregatedPosts(aggregated);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Responsive UI Component breakdown
  return (
    <div className={`min-h-screen bg-slate-50 font-sans flex flex-col relative w-full ${onBack ? 'pt-0' : 'pt-[var(--nav-height)] md:pt-0'} pb-20 md:pb-0`}>
      
      {/* 1. Global Community Header (Responsive) */}
      <div 
        className="bg-white border-b border-slate-100 shadow-sm sticky top-0 md:relative z-50 pt-safe"
        style={onBack ? { paddingTop: 'max(env(safe-area-inset-top), 8px)', paddingBottom: '8px' } : undefined}
      >
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack ? (
                <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors active:scale-95 shadow-sm">
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Globe size={20} />
                </div>
              )}
              <div>
                <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter">VocaQuest <span className="text-indigo-600">Global</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
                <div 
                   className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors hover:scale-105 active:scale-95 select-none"
                   onClick={toggleGlobalTranslate}
                   style={{ 
                       backgroundColor: isGlobalTranslateOn ? '#eef2ff' : '#f8fafc',
                       borderColor: isGlobalTranslateOn ? '#e0e7ff' : '#f1f5f9'
                   }}
                >
                    {isGlobalTranslateOn ? (
                       <>
                       <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                       </span>
                       <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase">AI: {lang.toUpperCase()}</span>
                       <Languages size={14} className="text-indigo-600" />
                       </>
                    ) : (
                       <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                          AI: EN <Languages size={14} className="text-slate-400" />
                       </span>
                    )}
                </div>
                <button className="p-2.5 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>
            </div>
        </div>
        {/* Mobile AI indicator */}
        <div 
            className="md:hidden flex items-center justify-center gap-2 py-2.5 w-full cursor-pointer select-none active:bg-slate-50"
            style={{ 
               backgroundColor: isGlobalTranslateOn ? '#eef2ff' : '#ffffff',
               borderTop: `1px solid ${isGlobalTranslateOn ? '#e0e7ff' : '#f1f5f9'}`
            }}
            onClick={toggleGlobalTranslate}
        >
            {isGlobalTranslateOn ? (
               <>
                 <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                 </span>
                 <span className="text-[9px] font-black tracking-widest text-indigo-700 uppercase">{tComm(lang, 'auto_translate_active')}</span>
               </>
            ) : (
                 <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                    <Globe size={10}/> Global English Mode
                 </span>
            )}
        </div>
      </div>

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 py-6 md:py-10">
        
        {/* Left LNB (PC Only) */}
        <aside className="hidden lg:block col-span-3 space-y-6">
            <div className="bg-white rounded-[32px] p-4 shadow-sm border border-slate-100 sticky top-24">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">{lang === 'ko' ? '移댄뀒怨좊━ 紐⑸줉' : 'Board Categories'}</div>
                <div className="space-y-1">
                    {['HOT', 'FREE', 'STUDY', 'MEDIA', 'EXCHANGE', 'PROMO'].map(catId => (
                        <button 
                            key={catId}
                            onClick={() => onNavigateToCategory(catId)}
                            className="w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-all font-bold group"
                        >
                            <span className="flex items-center gap-3">
                                <span className={CATEGORY_META[catId].color + " w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm"}>
                                    {CATEGORY_META[catId].icon}
                                </span>
                                {getCategoryName(catId, lang)}
                            </span>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                    ))}
                </div>
            </div>
        </aside>

        {/* Center Feed */}
        <div className="col-span-1 lg:col-span-6 space-y-6 md:space-y-8 min-w-0">
            {/* Mobile Category Menu (Horizontal Scroll) */}
            <div className="lg:hidden flex overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2">
                {['HOT', 'FREE', 'STUDY', 'MEDIA', 'EXCHANGE', 'PROMO'].map(catId => (
                    <button 
                        key={catId}
                        onClick={() => onNavigateToCategory(catId)}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm whitespace-nowrap active:scale-95 shrink-0 snap-start select-none"
                    >
                        <span className="text-sm">{CATEGORY_META[catId].icon}</span>
                        <span className="text-sm font-bold text-slate-700">{getCategoryName(catId, lang)}</span>
                    </button>
                ))}
            </div>

            {/* Top Event Banner */}
            <div className="bg-indigo-600 rounded-[32px] overflow-hidden p-6 md:p-10 relative text-white shadow-xl shadow-indigo-200 cursor-pointer hover:scale-[1.01] transition-transform active:scale-95" onClick={() => onNavigateToCategory('FREE')}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mt-20 -mr-20"></div>
               <div className="relative z-10 space-y-2">
                   <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black tracking-widest mb-2 uppercase">{tComm(lang, 'official_notice')}</div>
                   <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{tComm(lang, 'banner_title')}</h2>
                   <p className="text-indigo-200 font-bold text-sm md:text-base opacity-90">{tComm(lang, 'banner_desc')}</p>
               </div>
            </div>

            {/* ?뵦 ?ㅼ떆媛?踰좎뒪??(Horizontal Swipe on Mobile) */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Flame size={20} className="text-rose-500" /> {tComm(lang, 'best_hot')}
                    </h3>
                    <button onClick={() => onNavigateToCategory('HOT')} className="text-xs font-bold text-slate-400 flex items-center hover:text-indigo-600 transition-colors">
                        {tComm(lang, 'view_more')}
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-2">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="min-w-[280px] h-32 bg-slate-100 rounded-3xl animate-pulse shrink-0 snap-start" />)
                    ) : popularPosts.map(post => (
                        <div 
                           key={post.id} 
                           onClick={() => onNavigateToPost(post.id!)}
                           className="min-w-[280px] md:min-w-[300px] bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-lg transition-all shrink-0 snap-start cursor-pointer active:scale-95 group relative flex flex-col justify-between"
                        >
                            <div className="space-y-2 mb-4">
                               <div className="flex items-center gap-2">
                                  <span className="text-[20px] shadow-sm rounded-full self-start" title={post.originalLang}>{getFlagEmoji(post.originalLang || 'ko')}</span>
                                  <h4 className="font-black text-slate-800 text-lg line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                      <FeedTitle post={post} lang={lang} isGlobalTranslateOn={isGlobalTranslateOn} />
                                  </h4>
                               </div>
                               <p className="text-xs text-slate-500 font-medium line-clamp-1">{post.content.replace(/<[^>]+>/g, '')}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto border-t border-slate-50 pt-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                   <Eye size={12} /> {post.viewCount}
                                </div>
                                {post.commentCount > 0 && <span className="bg-rose-50 text-rose-500 text-[10px] font-black px-2 py-0.5 rounded-full">{post.commentCount} Comments</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Sub-feeds */}
            <div className="space-y-6 lg:space-y-10">
                {['FREE', 'STUDY', 'MEDIA', 'EXCHANGE'].map(catId => {
                    const categoryPosts = aggregatedPosts[catId] || [];
                    if (loading || categoryPosts.length === 0) return null; // Wait for loading or skip if empty

                    return (
                        <div key={catId} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-4 md:px-6 md:py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                                    <span className={CATEGORY_META[catId]?.color + " w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-sm"}>{CATEGORY_META[catId]?.icon}</span>
                                    {getCategoryName(catId, lang)}
                                </h3>
                                <button onClick={() => onNavigateToCategory(catId)} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                    {tComm(lang, 'view_more')}
                                </button>
                            </div>
                            <div className="divide-y divide-slate-50 px-2 md:px-4">
                                {categoryPosts.slice(0, 3).map(post => (
                                    <div key={post.id} onClick={() => onNavigateToPost(post.id!)} className="p-4 flex gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors group rounded-2xl my-1">
                                         <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                               <span className="text-[16px] leading-none aspect-square flex items-center">{getFlagEmoji(post.originalLang || 'ko')}</span>
                                               <h4 className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-600 transition-colors flex-1"><FeedTitle post={post} lang={lang} isGlobalTranslateOn={isGlobalTranslateOn} /></h4>
                                               {post.mediaUrls?.length > 0 && <PlayCircle size={14} className="text-slate-300 shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                                <span>{post.authorName}</span>
                                                <span className="flex items-center gap-0.5"><Eye size={10} /> {post.viewCount}</span>
                                                <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {post.commentCount}</span>
                                            </div>
                                         </div>
                                         {post.mediaUrls?.length > 0 && (
                                             <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-sm opacity-90 group-hover:opacity-100">
                                                 <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="thumb" />
                                             </div>
                                         )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Right Widgets (PC Only) */}
        <aside className="hidden lg:block col-span-3 space-y-6">
            {!user ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] p-6 border border-indigo-100/50 text-center shadow-sm">
                    <User size={32} className="mx-auto text-indigo-300 mb-3" />
                    <h3 className="font-black text-slate-800 text-sm mb-2">VocaQuest 로그인</h3>
                    <p className="text-xs text-slate-500 font-bold mb-4 leading-relaxed">전세계 사람들과 언어 교환하고 일상을 공유하세요</p>
                    <button onClick={onLoginClick} className="w-full py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 transition-colors active:scale-95">Login to Start</button>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-slate-100 overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-300"><User size={20} /></div>}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Welcome back</div>
                        <div className="font-black text-slate-800 truncate w-32">{user.displayName || 'Voca User'}</div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-indigo-600" /> 주간 트렌드</h3>
                <div className="space-y-3">
                    {trendingTags.map((tag, i) => (
                        <div key={tag} className="flex items-center gap-3 group cursor-pointer">
                           <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${i < 3 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>{i+1}</span>
                           <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-600 transition-colors truncate">{tag}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 mb-4"><Star size={16} className="text-amber-500" /> 주간 베스트 크리에이터</h3>
                <div className="space-y-4">
                    {bestCreators.map((u) => (
                        <div key={u.n} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] overflow-hidden">
                                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.n.slice(0,1).toUpperCase()}
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                  {u.n} <span className="text-xs">{getFlagEmoji(u.lang)}</span>
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{u.p} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
      </div>

      {/* Bottom Horizontal Ad */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-10">
        <PcAdSlot variant="horizontal" className="w-full shadow-sm rounded-3xl overflow-hidden border border-slate-100/50" />
      </div>

      {/* 3. Mobile FAB (Floating Action Button) */}
      <button 
         onClick={() => onNavigateToCategory('MY_POSTS')}
         className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-600/50 flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-indigo-500"
      >
          <PenSquare size={24} />
      </button>
    </div>
  );
};

