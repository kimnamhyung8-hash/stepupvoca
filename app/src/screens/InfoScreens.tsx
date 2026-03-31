import React from 'react';
import { t } from '../i18n';
import { tInfo } from '../i18n/infoTranslations';
import { 
  Info, Globe, Trophy, Briefcase, Layout, PhoneCall, ArrowLeft, Sparkles, 
  Target, Users, Zap, ShieldCheck, MessageSquare, BookMarked, 
  BarChart3, Swords, CheckCircle2, BookOpen 
} from 'lucide-react';
import { PcAdSlot } from '../components/PcComponents';
import { CommunityForumScreen } from './CommunityForumScreen';
import { CommunityHomeScreen } from './CommunityHomeScreen';
import { type User as FirebaseUser } from 'firebase/auth';

interface InfoPageProps {
  title: string;
  icon: React.ReactNode;
  lang: string;
  onBack?: () => void;
  children: React.ReactNode;
}

const InfoPageLayout = ({ title, icon, lang, onBack, children }: InfoPageProps) => {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex items-center gap-4 mb-10">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
        )}
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {title.startsWith('pc_menu_') ? tInfo(lang, title) : t(lang, title)}
        </h2>
      </div>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export const AboutScreen = ({ lang, setScreen }: { lang: string, setScreen: (s: string) => void }) => (
  <InfoPageLayout title="pc_menu_about" icon={<Info size={24} />} lang={lang} onBack={() => setScreen('HOME')}>
    <div className="space-y-20 animate-fade-in pb-20">
      {/* Hero Narrative Section */}
      <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-12 md:p-20 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
            <Sparkles size={14} className="text-amber-300" /> Since 2024
          </div>
          <h3 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            <span dangerouslySetInnerHTML={{ __html: tInfo(lang, 'about_hero_title').replace('AI', '<span class="text-amber-300 italic">AI</span>') }} />
          </h3>
          <p className="text-lg md:text-xl text-indigo-100 font-bold leading-relaxed opacity-90">
            {tInfo(lang, 'about_hero_desc')}
          </p>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-amber-100">
            <Target size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-800 mb-4">{tInfo(lang, 'about_vision_title')}</h4>
          <p className="text-slate-500 font-medium leading-relaxed">
            {tInfo(lang, 'about_vision_desc')}
          </p>
        </div>

        <div className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-indigo-100">
            <Zap size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-800 mb-4">{tInfo(lang, 'about_mission_title')}</h4>
          <p className="text-slate-500 font-medium leading-relaxed">
            {tInfo(lang, 'about_mission_desc')}
          </p>
        </div>

        <div className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-rose-100">
            <Users size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-800 mb-4">{tInfo(lang, 'about_value_title')}</h4>
          <p className="text-slate-500 font-medium leading-relaxed">
            {tInfo(lang, 'about_value_desc')}
          </p>
        </div>
      </div>

      {/* Tech Highlight Section */}
      <div className="bg-slate-50 rounded-[56px] p-12 md:p-20 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-tighter">
              Technology Stack
            </div>
            <h3 className="text-4xl font-black text-slate-900 leading-tight">
              {lang === 'ko' ? "차세대 AI 엔진, Google Gemini와의 만남" : "Next-Gen AI Engine, powered by Google Gemini"}
            </h3>
            <div className="space-y-6">
              {[
                { t: lang === 'ko' ? "실시간 뉘앙스 분석" : "Real-time Nuance Analysis", d: lang === 'ko' ? "단어 이상의 문맥을 이해하는 지능형 피드백" : "Intelligent feedback that understands context beyond words" },
                { t: lang === 'ko' ? "원어민 수준 발음 평가" : "Native-level Pronunciation", d: lang === 'ko' ? "초정밀 음성 인식 기술을 통한 교정" : "Correction through ultra-precise speech recognition" },
                { t: lang === 'ko' ? "안전한 글로벌 환경" : "Safe Global Environment", d: lang === 'ko' ? "UGC 모니터링 시스템을 통한 클린 커뮤니티" : "Clean community through UGC monitoring system" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-lg">{item.t}</div>
                    <div className="text-slate-500 font-bold">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square bg-white rounded-[40px] shadow-2xl flex items-center justify-center p-12 relative z-10 border border-slate-100">
                <div className="relative w-full h-full bg-indigo-50 rounded-3xl flex items-center justify-center group overflow-hidden">
                   <Zap size={80} className="text-indigo-400 animate-bounce-slow" />
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </InfoPageLayout>
);

export const CommunityScreen = ({ lang, firebaseUser, setScreen }: { lang: string, firebaseUser: FirebaseUser | null, setScreen: (s: string) => void }) => {
  const [view, setView] = React.useState<'HOME' | 'FORUM'>('HOME');
  const [selectedPostId, setSelectedPostId] = React.useState<string | undefined>(undefined);

  const handleNavigateToCategory = (catId: string) => {
    setSelectedPostId(undefined);
    setView('FORUM');
    localStorage.setItem('vq_forum_category', catId);
    localStorage.setItem('vq_forum_view', 'LIST');
  };

  const handleNavigateToPost = (postId: string) => {
    setSelectedPostId(postId);
    setView('FORUM');
    localStorage.setItem('vq_forum_view', 'DETAIL');
  };

  React.useEffect(() => {
    const targetPostId = localStorage.getItem('vq_target_post_id');
    if (targetPostId) {
      localStorage.removeItem('vq_target_post_id');
      handleNavigateToPost(targetPostId);
    }
  }, []);


  return (
    <div className="w-full min-h-screen bg-slate-50 relative pb-20 md:pb-0 font-sans">
      <div className="w-full">
        {view === 'HOME' ? (
          <CommunityHomeScreen 
            lang={lang} 
            onNavigateToCategory={handleNavigateToCategory}
            onNavigateToPost={handleNavigateToPost}
            onLoginClick={() => setScreen('LOGIN')}
            onBack={() => setScreen('HOME')}
          />
        ) : (
          <div className="min-h-screen bg-slate-50 md:p-6 lg:p-12 flex flex-col">
             <div className="flex-1 bg-white rounded-[40px] md:shadow-2xl overflow-hidden border-0 md:border md:border-slate-100 relative">
                <div className="h-full">
                    <CommunityForumScreen 
                        lang={lang} 
                        firebaseUser={firebaseUser} 
                        externalPostId={selectedPostId}
                        onBack={() => setView('HOME')}
                    />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SuccessStoriesScreen = ({ lang, setScreen }: { lang: string, setScreen: (s: string) => void }) => (
  <InfoPageLayout title="pc_menu_success" icon={<Trophy size={24} />} lang={lang} onBack={() => setScreen('HOME')}>
    <div className="space-y-20 animate-fade-in pb-20">
      {/* Hero */}
      <div className="text-center space-y-4">
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {tInfo(lang, 'success_hero_title')}
          </h3>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
            {tInfo(lang, 'success_hero_desc')}
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { n: "David Park", r: lang === 'ko' ? "구글 본사 소프트웨어 엔지니어" : "Software Engineer at Google", desc: lang === 'ko' ? "보카퀘스트의 AI 뉘앙스 분석 덕분에 원어민 동료들과의 기술 미팅에서 더욱 정교한 표현을 사용할 수 있게 되었습니다." : "Thanks to AI nuance analysis, I can use more sophisticated expressions in technical meetings with native colleagues.", img: "11" },
          { n: "Elena Sato", r: lang === 'ko' ? "국제 비즈니스 컨설턴트" : "International Business Consultant", desc: lang === 'ko' ? "바쁜 일정 속에서도 마스터리 시스템의 게임 요소 덕분에 하루 15분씩 즐겁게 학습 루틴을 지킬 수 있었습니다." : "The gamified mastery system helped me keep my 15-min daily learning routine even with a busy schedule.", img: "15" },
          { n: "Kim Jisoo", r: lang === 'ko' ? "대학생 (TOEFL 115점 달성)" : "Student (TOEFL 115 Score)", desc: lang === 'ko' ? "어휘 바이블과 오답 노트 기능은 시험 준비에 결정적인 도움이 되었습니다. 실전 대화 데이터 기반의 예문이 정말 훌륭해요." : "The Voca Bible and Review Note features were crucial for my exam prep. The example sentences are top-notch.", img: "22" },
          { n: "Michael Chen", r: lang === 'ko' ? "글로벌 마케팅 기획자" : "Global Marketing Planner", desc: lang === 'ko' ? "AI와의 상황별 시중 대화 훈련을 통해 실제 출장지에서 당황하지 않고 대처할 수 있는 자신감을 얻었습니다." : "The situational AI conversation training gave me the confidence to handle my global business trips without panic.", img: "33" }
        ].map((story, i) => (
          <div key={i} className="group bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-lg border-2 border-slate-50">
                 <img src={`https://i.pravatar.cc/100?img=${story.img}`} alt="user" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{story.n}</div>
                <div className="text-sm font-black text-indigo-500 uppercase tracking-widest">{story.r}</div>
              </div>
            </div>
            <p className="text-slate-600 font-bold leading-relaxed italic text-lg opacity-90">
              "{story.desc}"
            </p>
          </div>
        ))}
      </div>
    </div>
  </InfoPageLayout>
);

export const CareersScreen = ({ lang, setScreen }: { lang: string, setScreen: (s: string) => void }) => (
  <InfoPageLayout title="pc_menu_careers" icon={<Briefcase size={24} />} lang={lang} onBack={() => setScreen('HOME')}>
    <div className="space-y-20 animate-fade-in pb-20">
      {/* Careers Hero */}
      <div className="bg-slate-900 text-white rounded-[56px] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-600/30 blur-[120px] rounded-full" />
        <div className="relative z-10 space-y-6">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8">
            {tInfo(lang, 'careers_hero_title')}
          </h3>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            {tInfo(lang, 'careers_hero_desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { t: lang === 'ko' ? "혁신 지향" : "Innovation Driven", d: lang === 'ko' ? "최신 AI 기술을 실제 교육 현장에 빠르게 적용합니다." : "We rapidy apply the latest AI technology to real education.", i: <Zap /> },
          { t: lang === 'ko' ? "글로벌 마인드" : "Global Mindset", d: lang === 'ko' ? "전 세계 모든 언어와 문화를 존중하며 서비스를 키워갑니다." : "We grow by respecting all languages and cultures worldwide.", i: <Globe /> },
          { t: lang === 'ko' ? "사용자 중심" : "User Centric", d: lang === 'ko' ? "학습자의 성장이 곧 우리의 성장입니다." : "Learner's growth is our primary metric of success.", i: <Users /> },
          { t: lang === 'ko' ? "자율성 기반" : "High Autonomy", d: lang === 'ko' ? "최고의 성과를 위한 최적의 환경을 스스로 디자인합니다." : "Design the best environment for your peak performance.", i: <Layout /> }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm hover:shadow-xl transition-all">
             <div className="w-14 h-14 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center mb-6">
                {React.cloneElement(item.i as React.ReactElement<{ size?: number }>, { size: 28 })}
             </div>
             <h4 className="text-2xl font-black text-slate-800 mb-2">{item.t}</h4>
             <p className="text-slate-500 font-bold text-lg">{item.d}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-[40px] p-12 text-center space-y-6 border border-indigo-100">
         <h4 className="text-3xl font-black text-slate-900">{tInfo(lang, 'careers_open_positions_title')}</h4>
         <div className="bg-white/50 backdrop-blur-md rounded-3xl p-10 border border-white inline-block">
            <p className="text-indigo-600 font-black text-xl italic">
               {tInfo(lang, 'careers_open_positions_desc')}
            </p>
         </div>
      </div>
    </div>
  </InfoPageLayout>
);

interface ContentIntroProps {
  lang: string;
  setScreen: (s: string) => void;
  setAiReportMode: (mode: 'VOCAB' | 'CONVERSATION') => void;
  setActiveStudyLevel: (lvl: number) => void;
  currentLevel: number;
}

export const ContentIntroScreen = ({ lang, setScreen, setAiReportMode, currentLevel }: ContentIntroProps) => {
  interface ContentItem {
    id: string;
    t: string;
    d: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
    isAi?: boolean;
    isPro?: boolean;
  }

  const categories: { title: string, items: ContentItem[] }[] = [
    {
      title: tInfo(lang, 'contents_cat_mastery'),
      items: [
        {
          id: 'MASTERY',
          t: tInfo(lang, 'module_voca_master_title'),
          d: tInfo(lang, 'module_voca_master_desc', { lvl: currentLevel - 1 }),
          icon: <Trophy size={32} />,
          color: "bg-emerald-50 text-emerald-600 border-emerald-100",
          onClick: () => setScreen('MASTERY')
        },
        {
          id: 'LEVEL_TEST',
          t: tInfo(lang, 'module_level_test_title'),
          d: tInfo(lang, 'module_level_test_desc'),
          icon: <Target size={32} />,
          color: "bg-blue-50 text-blue-600 border-blue-100",
          onClick: () => setScreen('LEVEL_TEST')
        },
        {
          id: 'REVIEW',
          t: tInfo(lang, 'module_review_title'),
          d: tInfo(lang, 'module_review_desc'),
          icon: <CheckCircle2 size={32} />,
          color: "bg-rose-50 text-rose-600 border-rose-100",
          onClick: () => setScreen('REVIEW')
        }
      ]
    },
    {
      title: tInfo(lang, 'contents_cat_ai'),
      items: [
        {
          id: 'CONVERSATION',
          t: tInfo(lang, 'module_conversation_title'),
          d: tInfo(lang, 'module_conversation_desc'),
          icon: <MessageSquare size={32} />,
          color: "bg-indigo-50 text-indigo-600 border-indigo-100",
          isAi: true,
          onClick: () => setScreen('CONVERSATION_LIST')
        },
        {
          id: 'DICTIONARY',
          t: tInfo(lang, 'module_dictionary_title'),
          d: tInfo(lang, 'module_dictionary_desc'),
          icon: <Sparkles size={32} />,
          color: "bg-cyan-50 text-cyan-600 border-cyan-100",
          isAi: true,
          onClick: () => setScreen('DICTIONARY')
        },
        {
          id: 'REPORT',
          t: tInfo(lang, 'module_report_title'),
          d: tInfo(lang, 'module_report_desc'),
          icon: <BarChart3 size={32} />,
          color: "bg-purple-50 text-purple-600 border-purple-100",
          isAi: true,
          isPro: true,
          onClick: () => { setAiReportMode('VOCAB'); setScreen('AI_REPORT'); }
        },
        {
          id: 'PHRASE_BIBLE',
          t: tInfo(lang, 'module_phrase_bible_title'),
          d: tInfo(lang, 'module_phrase_bible_desc'),
          icon: <BookMarked size={32} />,
          color: "bg-orange-50 text-orange-600 border-orange-100",
          isAi: true,
          onClick: () => setScreen('MY_PHRASES')
        },
        {
          id: 'BIBLE',
          t: tInfo(lang, 'module_core50_title'),
          d: tInfo(lang, 'module_core50_desc'),
          icon: <BookOpen size={32} />,
          color: "bg-amber-50 text-amber-600 border-amber-100",
          isAi: true,
          onClick: () => setScreen('BIBLE')
        }
      ]
    },
    {
      title: lang === 'ko' ? "소셜 & 배틀" : "Social & Battle",
      items: [
        {
          id: 'BATTLE',
          t: "Voca Battle",
          d: lang === 'ko' ? "전 세계 라이벌과 실시간으로 실력을 겨루는 긴장감 가득한 대결" : "Real-time vocabulary battles with global rivals",
          icon: <Swords size={32} />,
          color: "bg-red-50 text-red-600 border-red-100",
          onClick: () => setScreen('BATTLE')
        },
        {
          id: 'LIVE_CHAT',
          t: "Global Live Chat",
          d: lang === 'ko' ? "초정밀 실시간 번역 지원으로 국경 없이 소통하는 소셜 공간" : "Social space for global communication with live translation",
          icon: <Globe size={32} />,
          color: "bg-teal-50 text-teal-600 border-teal-100",
          isAi: true,
          onClick: () => setScreen('LIVE_CHAT')
        }
      ]
    }
  ];

  return (
    <InfoPageLayout title="pc_menu_contents" icon={<Layout size={24} />} lang={lang}>
      <div className="space-y-16 animate-fade-in pb-20">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
            {tInfo(lang, 'contents_intro_title')}
          </h3>
          <p className="text-xl text-slate-500 font-bold">
            {tInfo(lang, 'contents_intro_desc')}
          </p>
        </div>

        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-8">
            <div className="flex items-center gap-4">
              <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">{cat.title}</h4>
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-full">{tInfo(lang, 'module_blocks_count', { n: cat.items.length })}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="group relative bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
                >
                  <div className="flex gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-current/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <h5 className="text-xl font-black text-slate-800 leading-tight">{item.t}</h5>
                          {item.isAi && <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">AI</span>}
                          {item.isPro && <span className="bg-amber-400 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">PRO</span>}
                       </div>
                       <p className="text-slate-500 font-bold text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.d}
                      </p>
                    </div>
                  </div>
                  
                  {/* Decorative Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color.replace('bg-', 'from-').split(' ')[0]} to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  
                  {/* Bottom Indicator */}
                  <div className={`absolute bottom-0 left-0 h-1.5 ${item.color.split(' ')[0]} w-0 group-hover:w-full transition-all duration-700`} />
                </button>
              ))}
            </div>
            
            {catIdx < categories.length - 1 && (
              <div className="py-8">
                <PcAdSlot variant="horizontal" />
              </div>
            )}
          </div>
        ))}

        <div className="bg-slate-900 rounded-[48px] p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
           <div className="relative z-10 space-y-6">
              <h4 className="text-white text-2xl font-black">{tInfo(lang, 'contents_cta_start')}</h4>
              <button 
                onClick={() => setScreen('HOME')}
                className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
              >
                {tInfo(lang, 'contents_cta_home')}
              </button>
           </div>
        </div>
      </div>
    </InfoPageLayout>
  );
};

export const ExpertConsultationScreen = ({ lang, setScreen }: { lang: string, setScreen: (s: string) => void }) => (
  <InfoPageLayout title="pc_menu_expert" icon={<PhoneCall size={24} />} lang={lang} onBack={() => setScreen('HOME')}>
    <div className="max-w-2xl mx-auto space-y-10 py-10 animate-fade-in">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-slate-800">
          {tInfo(lang, 'expert_title')}
        </h3>
        <p className="text-slate-500 font-bold text-lg">
          {tInfo(lang, 'expert_desc')}
        </p>
      </div>
      <div className="bg-white border-2 border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">{tInfo(lang, 'expert_label_company')}</label>
            <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-2 ring-indigo-500 transition-all" placeholder={tInfo(lang, 'expert_placeholder_name')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">{tInfo(lang, 'expert_label_type')}</label>
            <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-2 ring-indigo-500 transition-all appearance-none">
              <option>{tInfo(lang, 'expert_inquiry_b2b')}</option>
              <option>{tInfo(lang, 'expert_inquiry_content')}</option>
              <option>{tInfo(lang, 'expert_inquiry_other')}</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 transform active:scale-95">
            {tInfo(lang, 'expert_submit')}
          </button>
        </div>
      </div>
    </div>
  </InfoPageLayout>
);
