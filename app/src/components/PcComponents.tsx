import React from 'react';
import { 
  Zap, Star, MessageSquare, BookOpen, Layers, Globe, ArrowRight,
  CheckCircle2, Users, Trophy, Sparkles, TrendingUp, ChevronDown, Clock, Eye
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { t } from '../i18n';
import { tInfo } from '../i18n/infoTranslations';
import { getGlobalLatestPosts, getGlobalPopularPosts } from '../communityService';

interface PcHeaderProps {
  screen: string;
  setScreen: (s: string) => void;
  lang?: string;
  userPoints: number;
}

export const PcHeader = ({ screen, setScreen, lang, userPoints }: PcHeaderProps) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const menuGroups = [
    { id: 'HOME', label: 'nav_home', items: [] },
    { 
      id: 'COMPANY_GROUP', 
      label: 'pc_menu_company', 
      items: [
        { id: 'ABOUT', label: 'pc_menu_about' },
        { id: 'COMMUNITY', label: 'pc_menu_community' },
        { id: 'SUCCESS', label: 'pc_menu_success' },
        { id: 'CAREERS', label: 'pc_menu_careers' },
        { id: 'EXPERT', label: 'pc_menu_expert' },
      ]
    },
    { 
      id: 'STUDY_GROUP', 
      label: 'study_menu', 
      items: [
        { id: 'MASTERY', label: 'mastery' },
        { id: 'STUDY_LEVEL', label: 'study_mode' },
        { id: 'REVIEW', label: 'review' },
        { id: 'DICTIONARY', label: 'ai_dictionary' },
        { id: 'BATTLE', label: 'battle_title' },
        { id: 'ARCADE', label: 'defender_title' },
      ]
    },
    { 
      id: 'SPEAKING_GROUP', 
      label: 'speak_menu', 
      items: [
        { id: 'CONVERSATION_LIST', label: 'conv_ai_header' },
        { id: 'LIVE_CHAT', label: 'global_live_chat_title' },
        { id: 'BIBLE', label: 'bible_title' },
        { id: 'MY_PHRASES', label: 'phrase_bible_title' },
      ]
    },
    { id: 'CONTENTS', label: 'pc_menu_contents', items: [] },
    { 
      id: 'EVAL_GROUP', 
      label: 'eval_menu', 
      items: [
        { id: 'LEVEL_TEST', label: 'level_test_title' },
        { id: 'AI_REPORT', label: 'analysis_report' },
      ]
    },
    { id: 'STORE', label: 'store_menu', items: [] },
    { 
      id: 'SETTINGS_GROUP', 
      label: 'settings_menu', 
      items: [
        { id: 'STATS', label: 'nav_stats' },
        { id: 'SETTINGS', label: 'settings' },
        { id: 'PROFILE', label: 'profile' },
      ]
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-[1000] px-8 flex items-center justify-between shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setScreen('HOME')}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Layers className="text-white" size={24} />
        </div>
        <span className="text-2xl font-black text-slate-800 tracking-tight">VocaQuest</span>
      </div>

      <nav className="flex items-center h-full">
        {menuGroups.map((group) => (
          <div 
            key={group.id} 
            className="relative h-full flex items-center px-2"
            onMouseEnter={() => setActiveMenu(group.id)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              onClick={() => { if (group.items.length === 0) setScreen(group.id); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                (screen === group.id || group.items.some(it => it.id === screen)) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {group.label.startsWith('pc_menu_') ? tInfo(lang || 'ko', group.label) : t(lang, group.label)}
              {group.items.length > 0 && (
                <ChevronDown size={14} className={`transition-transform duration-200 opacity-60 ${activeMenu === group.id ? 'rotate-180 opacity-100' : ''}`} />
              )}
            </button>

            {group.items.length > 0 && (
              <div 
                className={`absolute top-[85%] left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-3 transform transition-all duration-200 z-[1001] shadow-indigo-100 
                  before:content-[""] before:absolute before:-top-6 before:left-0 before:w-full before:h-6
                  ${activeMenu === group.id ? 'opacity-100 translate-y-2' : 'opacity-0 translate-y-0 pointer-events-none'}`}
              >
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setScreen(item.id); setActiveMenu(null); }}
                    className={`w-full text-left px-6 py-3 text-sm font-black transition-all hover:bg-slate-50 flex items-center justify-between group/item ${
                      screen === item.id ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                  >
                    {item.label.startsWith('pc_menu_') ? tInfo(lang || 'ko', item.label) : t(lang, item.label)}
                    <ArrowRight size={14} className={`-translate-x-2 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100 ${screen === item.id ? 'translate-x-0 opacity-100' : ''}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-4 shrink-0">
        <div className="bg-amber-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-100">
          <Star className="text-amber-500" size={16} fill="currentColor" />
          <span className="text-amber-700 font-bold text-sm tracking-tight">{userPoints.toLocaleString()}P</span>
        </div>
        <button 
          onClick={() => setScreen('STORE')} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          {t(lang, 'premium')}
        </button>
      </div>
    </header>
  );
};

export const PcHero = ({ lang, onStart }: { lang: string, onStart: () => void }) => {
  return (
    <section className="relative w-full min-h-[95vh] flex items-center pt-20 pb-32 px-10 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-indigo-200/40 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[70%] bg-purple-200/40 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10 w-full">
        <div className="text-center lg:text-left space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-700 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100/20 animate-bounce-slow">
            <Sparkles size={18} className="text-indigo-600" /> {t(lang, 'vocaquest_v2_banner')}
          </div>
          
          <div className="space-y-6">
            <h1 className="text-7xl lg:text-[100px] font-black text-slate-900 leading-[0.9] tracking-tighter">
              {t(lang, 'pc_hero_title1') || 'Master English'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 block mt-2">
                {t(lang, 'pc_hero_title2') || 'with Smart AI'}
              </span>
            </h1>
            <p className="text-2xl text-slate-500 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              {t(lang, 'pc_hero_desc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
            <button 
              onClick={onStart}
              className="group relative bg-indigo-600 text-white px-14 py-7 rounded-[32px] text-2xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {t(lang, 'get_started_free')} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center gap-6 p-2 bg-white/50 backdrop-blur-sm rounded-full pr-8 border border-white/50">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-black text-slate-900 text-lg line-clamp-1">{t(lang, 'learners_count')}</div>
                <div className="font-bold text-slate-400 mt-0.5">{t(lang, 'joining_daily')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative lg:h-[700px] flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-600/5 rounded-full blur-[100px] animate-pulse" />
          <div className="relative w-full max-w-[650px] aspect-[4/3] rounded-[64px] overflow-hidden shadow-[0_60px_120px_-20px_rgba(79,70,229,0.4)] border-[12px] border-white group transform hover:-rotate-1 transition-all duration-700">
             <img src="/assets/hero.png" alt="Hero Illustration" className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-all duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent opacity-60" />
             
             {/* Dynamic Float Cards */}
             <div className="absolute top-12 -right-8 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white flex items-center gap-5 animate-float-slow group-hover:translate-y-4 transition-transform">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="text-emerald-600" size={28} />
                </div>
                <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t(lang, 'accuracy_label')}</div>
                    <div className="text-xl font-black text-slate-800">98.4%</div>
                </div>
             </div>

             <div className="absolute bottom-12 -left-8 bg-white/95 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white flex items-center gap-5 animate-float group-hover:-translate-y-4 transition-transform">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <TrendingUp className="text-indigo-600" size={28} />
                </div>
                <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t(lang, 'impact_label')}</div>
                    <div className="text-xl font-black text-slate-800">{t(lang, 'growth_label', { n: '142%' })}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const PcFeaturesDetailed = ({ lang }: { lang: string }) => {
    const features = [
        {
            title: "ai_live_conv_title",
            subtitle: "ai_live_conv_subtitle",
            desc: "ai_live_conv_desc",
            img: "/assets/chat_mock.png",
            color: "indigo",
            icon: <MessageSquare size={24} />
        },
        {
            title: "gamified_voca_title",
            subtitle: "gamified_voca_subtitle",
            desc: "gamified_voca_desc",
            img: "/assets/voca_mock.png",
            color: "emerald",
            icon: <BookOpen size={24} />,
            reverse: true
        },
        {
            title: "global_battle_title",
            subtitle: "global_battle_subtitle",
            desc: "global_battle_desc",
            img: "/assets/battle_mock.png",
            color: "rose",
            icon: <Zap size={24} />
        }
    ];

    return (
        <section className="py-48 px-10 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
            
            <div className="max-w-7xl mx-auto space-y-64 relative z-10">
                {features.map((f, idx) => (
                    <div key={idx} className={`flex flex-col lg:flex-row items-center gap-32 ${f.reverse ? 'lg:flex-row-reverse' : ''}`}>
                        <div className="flex-1 space-y-10 text-center lg:text-left animate-on-scroll">
                            <div className={`w-20 h-20 bg-${f.color}-100 text-${f.color}-600 rounded-3xl flex items-center justify-center mb-6 transition-all hover:scale-110 hover:rotate-6 shadow-xl shadow-${f.color}-100/50`}>
                                {React.cloneElement(f.icon as React.ReactElement<{ size: number }>, { size: 32 })}
                            </div>
                            <div className="space-y-6">
                                <h3 className={`text-2xl font-black text-${f.color}-600 tracking-tighter uppercase mb-4`}>
                                    {t(lang, f.subtitle)}
                                </h3>
                                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                                    {t(lang, f.title)}
                                </h2>
                                <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    {t(lang, f.desc)}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-8">
                                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                    <span className="text-lg font-black text-slate-700">{t(lang, 'realtime_ai_badge')}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
                                    <CheckCircle2 size={24} className="text-indigo-500" />
                                    <span className="text-lg font-black text-slate-700">{t(lang, 'unlimited_access_badge')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative group">
                            <div className={`absolute inset-0 bg-${f.color}-400/10 rounded-[80px] scale-105 blur-2xl group-hover:scale-110 transition-transform duration-700`} />
                            <div className="relative rounded-[80px] overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.2)] border-8 border-white/50 bg-slate-50 aspect-[5/4]">
                                <img src={f.img} alt={t(lang, f.title)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const PcStats = ({ lang }: { lang: string }) => {
    const stats = [
        { label: "active_users_label", value: "240K+", icon: <Users size={32} /> },
        { label: "success_rate_label", value: "94.8%", icon: <Trophy size={32} /> },
        { label: "daily_lessons_label", value: "1.2M+", icon: <Sparkles size={32} /> },
        { label: "available_langs_label", value: "12+", icon: <Globe size={32} /> }
    ];

    return (
        <section className="py-24 px-10 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px'}} />
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl lg:text-6xl font-black text-white mb-20">{t(lang, 'stats_proven_title')}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {stats.map((s, idx) => (
                        <div key={idx} className="space-y-4 group">
                            <div className="w-16 h-16 bg-white/10 text-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                {s.icon}
                            </div>
                            <div className="text-4xl lg:text-5xl font-black text-white">{s.value}</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t(lang, s.label)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const PcFooter = ({ lang, onNavigateLegal, setScreen }: { lang: string, onNavigateLegal: (id: string, title: string) => void, setScreen: (s: string) => void }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-32 pb-16 px-10 text-slate-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
        <div className="col-span-1 md:col-span-1 space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Layers className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">VocaQuest</span>
          </div>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            {t(lang, 'footer_mission')}
          </p>
          <div className="flex gap-4">
             {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500 cursor-pointer transition-colors" />)}
          </div>
        </div>

        <div>
          <h4 className="text-white text-lg font-black mb-10">{t(lang, 'academy_label')}</h4>
          <ul className="space-y-6 text-base font-bold text-slate-400">
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('CONVERSATION_LIST')}>{t(lang, 'ai_live_conv_title')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('MASTERY')}>{t(lang, 'gamified_voca_title')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('BIBLE')}>{t(lang, 'voca_bible_menu')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('BATTLE')}>{t(lang, 'global_battle_title')}</li>
          </ul>
        </div>

        <div>
           <h4 className="text-white text-lg font-black mb-10">{t(lang, 'company_label')}</h4>
           <ul className="space-y-6 text-base font-bold text-slate-400">
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('ABOUT')}>{t(lang, 'pc_menu_about')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('COMMUNITY')}>{t(lang, 'pc_menu_community')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('SUCCESS')}>{t(lang, 'pc_menu_success')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('CAREERS')}>{t(lang, 'pc_menu_careers')}</li>
            <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setScreen('EXPERT')}>{t(lang, 'pc_menu_expert')}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-black mb-10">{t(lang, 'support_label')}</h4>
          <ul className="space-y-6 text-base font-bold text-slate-400">
            <li className="hover:text-indigo-400 cursor-pointer transition-colors">{t(lang, 'help_center')}</li>
            <li 
              onClick={() => onNavigateLegal('terms', t(lang, 'legal_terms_title'))}
              className="hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {t(lang, 'tos')}
            </li>
            <li 
              onClick={() => onNavigateLegal('privacy', t(lang, 'legal_privacy_title'))}
              className="hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {t(lang, 'privacy_policy')}
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-bold text-slate-500">
        <p>{t(lang, 'footer_copyright')}</p>
        <div className="flex gap-10">
            <span className="hover:text-white cursor-pointer transition-colors">한국어</span>
            <span className="hover:text-white cursor-pointer transition-colors">English</span>
            <span className="hover:text-white cursor-pointer transition-colors">日本語</span>
        </div>
      </div>
    </footer>
  );
};

export const PcModuleGrid = ({ setScreen, lang }: { setScreen: (s: string) => void, lang: string }) => {
    const modules = [
        { id: 'CONVERSATION_LIST', title: 'ai_live_conv_title', desc: 'ai_live_conv_desc', icon: <MessageSquare size={32} />, color: 'bg-indigo-50 text-indigo-600' },
        { id: 'MASTERY', title: 'gamified_voca_title', desc: 'gamified_voca_desc', icon: <BookOpen size={32} />, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'BIBLE', title: 'voca_bible_menu', desc: 'voca_bible_menu_desc', icon: <Layers size={32} />, color: 'bg-amber-50 text-amber-600' },
        { id: 'BATTLE', title: 'global_battle_title', desc: 'global_battle_desc', icon: <Zap size={32} />, color: 'bg-rose-50 text-rose-600' },
        { id: 'DICTIONARY', title: 'ai_dictionary', desc: 'ai_dict_desc', icon: <Globe size={32} />, color: 'bg-sky-50 text-sky-600' },
        { id: 'ARCADE', title: 'defender_title', desc: 'arcade_desc', icon: <Star size={32} />, color: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <section id="modules" className="py-24">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t(lang, 'learning_categories_title')}</h2>
                <p className="text-slate-500 font-bold max-w-2xl mx-auto">{t(lang, 'learning_categories_desc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((m) => (
                    <div 
                        key={m.id}
                        onClick={() => setScreen(m.id)}
                        className="p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all cursor-pointer group"
                    >
                        <div className={`w-20 h-20 ${m.color} rounded-[28px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-current/10`}>
                            {m.icon}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-4">{t(lang, m.title)}</h3>
                        <p className="text-slate-500 text-base font-medium leading-relaxed mb-8">{t(lang, m.desc)}</p>
                        <div className="flex items-center gap-3 text-indigo-600 font-black text-sm uppercase tracking-widest group-hover:gap-5 transition-all">
                            {t(lang, 'start_now')} <ArrowRight size={18} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const PcAdSlot = ({ 
  className = "", 
  adClient, 
  adSlot, 
  variant = "square" 
}: { 
  className?: string; 
  adClient?: string; 
  adSlot?: string;
  variant?: 'horizontal' | 'vertical' | 'square';
}) => {
  React.useEffect(() => {
    if (adClient && adSlot && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense error:', e);
      }
    }
  }, [adClient, adSlot]);

  const variantStyles = {
    horizontal: "w-full h-32 md:h-40",
    vertical: "w-80 h-[600px]",
    square: "w-full aspect-square md:aspect-video"
  };

  const currentStyle = variantStyles[variant] || variantStyles.square;

  if (adClient && adSlot) {
    return (
      <div className={`overflow-hidden flex items-center justify-center bg-slate-50/50 rounded-[32px] border border-slate-100/50 backdrop-blur-sm ${currentStyle} ${className}`}>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client={adClient}
             data-ad-slot={adSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50/50 border border-slate-100/50 rounded-[32px] backdrop-blur-sm flex items-center justify-center p-6 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] group hover:bg-slate-100/50 transition-all ${currentStyle} ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-10 h-10 bg-slate-200/50 rounded-2xl flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
          <Layers size={20} className="text-slate-300 opacity-50" />
        </div>
        <div className="space-y-1">
          <span className="block">Advertisement</span>
          <span className="block text-[8px] opacity-40 font-bold">Space for Monetization</span>
        </div>
      </div>
    </div>
  );
};

export const PcLeaderboard = ({ lang }: { lang: string }) => {
  const [activeTab, setActiveTab] = React.useState<'USERS' | 'LATEST' | 'POPULAR'>('USERS');
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    if (activeTab === 'USERS') {
      const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(5));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'USER' }));
        setData(users);
        setLoading(false);
      }, (err) => {
        console.error("Firestore leaderboard error:", err);
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (activeTab === 'LATEST') {
      getGlobalLatestPosts(5).then(posts => {
        setData(posts.map(p => ({ ...p, type: 'POST' })));
        setLoading(false);
      });
    } else {
      getGlobalPopularPosts(5).then(posts => {
        setData(posts.map(p => ({ ...p, type: 'POST' })));
        setLoading(false);
      });
    }
  }, [activeTab]);

  const tabs = [
    { id: 'USERS', label: lang === 'ko' ? '유저' : 'Users', icon: <Users size={14} /> },
    { id: 'POPULAR', label: lang === 'ko' ? '인기글' : 'Best', icon: <TrendingUp size={14} /> },
    { id: 'LATEST', label: lang === 'ko' ? '최신글' : 'Latest', icon: <Clock size={14} /> },
  ];

  return (
    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Trophy className="text-amber-500" size={20} fill="currentColor" /> {t(lang, 'leaderboard_title')}
        </h3>
      </div>

      {/* Mini Tabs */}
      <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {!loading ? data.map((item, i) => (
          <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                {i + 1}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.type === 'USER' ? (item.nickname || 'Anonymous') : item.title}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                  {item.type === 'USER' ? `LV.${item.level || 1}` : `${item.authorName} • ${(item.createdAt?.toDate ? item.createdAt.toDate() : new Date()).toLocaleDateString()}`}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black text-indigo-600 shrink-0 ml-2">
              {item.type === 'USER' ? `${(item.points || 0).toLocaleString()}P` : (activeTab === 'POPULAR' ? <span className="flex items-center gap-1"><Eye size={10} /> {item.viewCount}</span> : '')}
            </span>
          </div>
        )) : (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-200">{i}</div>
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-1.5 w-16 bg-slate-50 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="h-2 w-10 bg-indigo-50 rounded-full animate-pulse" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
