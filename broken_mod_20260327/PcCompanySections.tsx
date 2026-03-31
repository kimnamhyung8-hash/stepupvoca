import React from 'react';
import { 
  Building2, Globe2, Trophy, Users2, Handshake, 
  ArrowRight, Mail, MapPin, ExternalLink
} from 'lucide-react';
import { t } from '../i18n';

interface PcCompanySectionsProps {
  lang: string;
}

export const PcCompanySections: React.FC<PcCompanySectionsProps> = ({ lang }) => {
  const sections = [
    {
      id: 'ABOUT',
      title: 'about_story',
      desc: 'about_story_desc',
      icon: <Building2 size={32} className="text-indigo-600" />,
      color: 'indigo',
      image: '/assets/company_about.png'
    },
    {
      id: 'GLOBAL',
      title: 'global_community',
      desc: 'global_community_desc',
      icon: <Globe2 size={32} className="text-emerald-600" />,
      color: 'emerald',
      image: '/assets/company_global.png'
    },
    {
      id: 'SUCCESS',
      title: 'success_stories',
      desc: 'success_stories_desc',
      icon: <Trophy size={32} className="text-amber-600" />,
      color: 'amber',
      image: '/assets/company_success.png'
    },
    {
      id: 'CAREERS',
      title: 'career_opportunities',
      desc: 'career_opportunities_desc',
      icon: <Users2 size={32} className="text-purple-600" />,
      color: 'purple',
      image: '/assets/company_careers.png'
    },
    {
      id: 'PARTNERSHIP',
      title: 'partnership_inquiry',
      desc: 'partnership_inquiry_desc',
      icon: <Handshake size={32} className="text-rose-600" />,
      color: 'rose',
      image: '/assets/company_partnership.png'
    }
  ];

  return (
    <div className="space-y-48 py-32">
      {sections.map((section, idx) => (
        <section 
          key={section.id} 
          id={`company-${section.id.toLowerCase()}`}
          className={`flex flex-col lg:flex-row items-center gap-24 ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
        >
          <div className="flex-1 space-y-8">
            <div className={`w-20 h-20 bg-${section.color}-50 rounded-3xl flex items-center justify-center shadow-xl shadow-${section.color}-100/50`}>
              {section.icon}
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                {t(lang, section.title)}
              </h2>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                {t(lang, section.desc)}
              </p>
            </div>
            
            {section.id === 'PARTNERSHIP' ? (
              <div className="pt-8 flex flex-col sm:flex-row gap-6">
                <a 
                  href="mailto:idouhak1@gmail.com"
                  className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-lg flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                >
                  <Mail size={24} /> {t(lang, 'partnership_inquiry')}
                </a>
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(lang, 'address_label') || 'SEOUL'}</div>
                    <div className="text-sm font-bold text-slate-700">Digital-ro, Guro-gu, Seoul, KR</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-8">
                <button className={`group flex items-center gap-4 text-${section.color}-600 font-black text-xl uppercase tracking-tighter hover:gap-6 transition-all`}>
                  {t(lang, 'view_more')} <ArrowRight size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 relative group">
            <div className={`absolute inset-0 bg-${section.color}-400/10 rounded-[64px] scale-105 blur-2xl group-hover:scale-110 transition-transform duration-700`} />
            <div className="relative rounded-[64px] shadow-2xl overflow-hidden border-8 border-white bg-slate-100 aspect-video lg:aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/20 to-transparent z-10" />
              <img 
                src={section.image} 
                alt={t(lang, section.title)}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000`; // Workspace/Company fallback
                }}
              />
              <div className="absolute bottom-10 right-10 z-20">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-2xl flex items-center gap-3">
                  <ExternalLink size={20} className={`text-${section.color}-600`} />
                  <span className="text-sm font-black text-slate-800">Stepup Voca Inc.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
