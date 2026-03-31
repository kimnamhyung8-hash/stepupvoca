
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { CommunityHomeScreen } from './screens/CommunityHomeScreen';
import { CommunityForumScreen } from './screens/CommunityForumScreen';
import { LoginScreen } from './LoginScreen';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import './index.css';

function CommunityMain() {
  const [view, setView] = useState<'HOME' | 'FORUM' | 'LOGIN'>('HOME');
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(undefined);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [lang] = useState('ko');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const handleNavigateToCategory = (catId: string) => {
    setSelectedPostId(undefined);
    setView('FORUM');
    // 로컬 스토리지 연동 (기존 CommunityForumScreen 호환)
    localStorage.setItem('vq_forum_category', catId);
    localStorage.setItem('vq_forum_view', 'LIST');
  };

  const handleNavigateToPost = (postId: string) => {
    setSelectedPostId(postId);
    setView('FORUM');
    localStorage.setItem('vq_forum_view', 'DETAIL');
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <CommunityHomeScreen 
            lang={lang} 
            onNavigateToCategory={handleNavigateToCategory}
            onNavigateToPost={handleNavigateToPost}
            onLoginClick={() => setView('LOGIN')}
          />
        );
      case 'FORUM':
        return (
          <div className="h-screen bg-slate-50 md:p-6 lg:p-12 flex flex-col">
             <div className="flex-1 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 relative">
                <button 
                  onClick={() => setView('HOME')}
                  className="absolute top-6 left-6 z-[110] bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-2xl font-black text-xs text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                >
                  ← 커뮤니티 홈으로
                </button>
                <CommunityForumScreen 
                    lang={lang} 
                    firebaseUser={firebaseUser} 
                    externalPostId={selectedPostId} 
                />
             </div>
          </div>
        );
      case 'LOGIN':
        return (
          <div className="h-screen">
             <LoginScreen settings={{ lang }} setScreen={(s: string) => s === 'HOME' ? setView('HOME') : null} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen">
      {renderContent()}
    </div>
  );
}

export default function CommunityApp() {
  return (
    <GlobalErrorBoundary>
      <CommunityMain />
    </GlobalErrorBoundary>
  );
}
