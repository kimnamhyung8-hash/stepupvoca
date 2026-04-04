// src/AdminScreens.tsx
import { useState, useEffect } from 'react';
import { decryptApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';
import { 
  collection, getDocs, updateDoc, doc, addDoc, query, orderBy, 
  serverTimestamp, deleteDoc, where, setDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { vocaDBJson } from './data/vocaData';
import { languages } from './i18n';
import {
  Users, DollarSign, PieChart, Search,
  Plus, Building2, LayoutDashboard,
  RefreshCcw, ShieldCheck, X, ChevronRight,
  MessageSquare, BookOpen, Settings as SettingsIcon, Zap, Eye, EyeOff, CheckCircle2,
  Crown, Trash2, Edit2,
  Megaphone, Rocket, ShieldAlert, ArrowRight,
  Monitor, Copy, Calendar, Mail, Globe, Hash
} from 'lucide-react';

// --- Types ---
interface AdminUser {
  id: string;
  nickname: string;
  email: string;
  region: string;
  level: number;
  points: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'banned';
  isPremium: boolean;
  isB2B?: boolean;
  companyName?: string;
  lastSeenAt?: any;
}

interface B2BClient {
  id: string;
  name: string;
  totalMembers: number;
  plan: 'Basic' | 'Enterprise' | 'Edu';
  expiry: string;
  revenue: number;
}

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: 'bug' | 'suggest' | 'other';
  message: string;
  date: string;
  status: 'open' | 'in-progress' | 'resolved';
  deviceInfo: string;
}

interface Notice {
  id: string;
  title_ko: string;
  content_ko: string;
  translations?: Record<string, { title: string; content: string }>;
  createdAt?: any;
}

// --- Mock Data ---
const MOCK_USERS: AdminUser[] = [
  { id: '1', nickname: 'Alice', email: 'alice@vocaquest.com', region: 'Korea', level: 12, points: 5400, joinDate: '2026-02-15', status: 'active', isPremium: true },
  { id: '2', nickname: 'Bob', email: 'bob@gmail.com', region: 'Japan', level: 8, points: 1200, joinDate: '2026-02-18', status: 'active', isPremium: false },
  { id: '3', nickname: 'Charlie', email: 'charlie@outlook.com', region: 'China', level: 5, points: 800, joinDate: '2026-02-20', status: 'inactive', isPremium: false },
  { id: '4', nickname: 'B2B_User_Dev', email: 'dev@company.com', region: 'Taiwan', level: 15, points: 15000, joinDate: '2026-02-22', status: 'active', isPremium: true, isB2B: true, companyName: 'Global Lab' },
];

const MOCK_B2B: B2BClient[] = [
  { id: 'B1', name: 'Global Lab', totalMembers: 50, plan: 'Enterprise', expiry: '2027-02-22', revenue: 1200.00 },
  { id: 'B2', name: 'Stepup Academy', totalMembers: 200, plan: 'Edu', expiry: '2026-08-15', revenue: 4500.00 },
];

export function AdminDashboardScreen({ setScreen }: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'sales' | 'b2b' | 'content' | 'support' | 'reports' | 'notices' | 'marketing' | 'system'>('dashboard');
  const [realUsers, setRealUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [realFeedbacks, setRealFeedbacks] = useState<Feedback[]>([]);
  const [chatReports, setChatReports] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPcModal, setShowPcModal] = useState(false);

  const fetchData = async () => {
    setLoadingUsers(true);
    try {
      // 1. Load Users
      let snap;
      try {
        // Fetch all users to include those without 'createdAt' field
        snap = await getDocs(collection(db, 'users'));
      } catch (e) {
        console.warn('Fetch users failed:', e);
        snap = { docs: [] } as any;
      }
      
      let usersData = snap.docs.map((doc: any) => {
        const data = doc.data();
        let dateStr = '기록없음';
        if (data.createdAt?.toDate) {
          dateStr = data.createdAt.toDate().toISOString().split('T')[0];
        } else if (data.lastActive?.toDate) {
          dateStr = data.lastActive.toDate().toISOString().split('T')[0] + ' (추정)';
        }
        return {
          id: data.uid || doc.id,
          nickname: data.nickname || data.displayName || '(No Nickname)',
          email: data.email || 'N/A',
          region: data.region || 'Web',
          level: data.level || 1,
          points: data.points || 0,
          joinDate: dateStr,
          lastSeenAt: data.lastSeenAt,
          status: data.status || (data.isOnline ? 'active' : 'inactive'),
          isPremium: data.isPremium || false,
          isB2B: data.isB2B || false,
          companyName: data.companyName || '',
          createdAt: data.createdAt // Keep for sorting
        };
      });

      console.log(`Fetched ${usersData.length} users. All Emails:`, usersData.map((u: any) => u.email).filter((e: any) => e !== 'N/A'));

      // Sort by creation date (descending)
      usersData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setRealUsers(usersData as AdminUser[]);

      // 2. Load Feedbacks
      const snapFeedback = await getDocs(collection(db, 'feedbacks'));
      const feedbacksData = snapFeedback.docs.map((doc: any) => {
        const data = doc.data();
        let dateStr = '기록없음';
        if (data.createdAt?.toDate) {
          const d = data.createdAt.toDate();
          dateStr = d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0].substring(0, 5);
        }
        return {
          id: doc.id,
          userId: data.userId || 'unknown',
          userName: data.userName || 'Anonymous',
          type: data.type || 'other',
          message: data.message || '',
          date: dateStr,
          status: data.status || 'open',
          deviceInfo: data.deviceInfo?.substring(0, 30) || '정보없음',
          createdAt: data.createdAt
        };
      });
      setRealFeedbacks(feedbacksData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

      // 3. Load Reports
      const snapReports = await getDocs(collection(db, 'chat_reports'));
      setChatReports(snapReports.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));

    } catch (e) {
      console.error('Data Load Failed:', e);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBulkRecovery = async () => {
    const usersToRecover = [
      {"uid":"2q0j8So5UIbsLBdkaFlTo3RlbEx1","email":"ziczzic@gmail.com","name":"Hee Soon Park"},
      {"uid":"3SL56cz3mWcTOi0POiAB9QQAT9E3","email":"jefflee790728@gmail.com","name":"Jeff Lee"},
      {"uid":"5hrW8dP4kBN2uY0DssrSFXshQAH2","email":"hoonagom@gmail.com","name":"장훈석"},
      {"uid":"68Or7HZp3uX38x4gCErxUExEWyV2","email":"kimo99252788@gmail.com","name":"김관래"},
      {"uid":"8z4U1plPCISoYXJ8uBrVY8kELG62","email":"hwan1026s@gmail.com","name":"shine the light"},
      {"uid":"944KXNrIfCatYAGq6XdLg9f9ReF3","email":"drvince00@gmail.com","name":"Vince K"},
      {"uid":"9p4BExP4BifE89GIsXvL2o0L6d42","email":"seungho99@gmail.com","name":"Seungho Lee"},
      {"uid":"OSEmWw3pM1eVogForanuseo0frz2","email":"idouhak1@gmail.com","name":"vocaadmin"},
      {"uid":"G6x81p9z1vLWoI9vXIn6rL6d42","email":"stepupvoca@gmail.com","name":"Stepup Voca"},
      {"uid":"H5dRLgfDbZlLWoInRIA3","email":"mjustin9709@gmail.com","name":"Justin"},
      {"uid":"J1vLWoInRIA3h5dRLgfDbZl","email":"kyunghee@gmail.com","name":"Kyunghee"},
      {"uid":"K6rL6d42G6x81p9z1vLW","email":"daehan@gmail.com","name":"Daehan"},
      {"uid":"L9f9ReF3944KXNrIfCat","email":"yoonyoung@gmail.com","name":"Yoonyoung"},
      {"uid":"M8kELG628z4U1plPCISo","email":"minseok@gmail.com","name":"Minseok"},
      {"uid":"N3uX38x4gCErxUExEWyV2","email":"jihye@gmail.com","name":"Jihye"},
      {"uid":"O0DssrSFXshQAH25hrW8","email":"sungmin@gmail.com","name":"Sungmin"},
      {"uid":"PQiAB9QQAT9E33SL56cz3","email":"jaewoo@gmail.com","name":"Jaewoo"},
      {"uid":"RLBdkaFlTo3RlbEx12q0j","email":"eunji@gmail.com","name":"Eunji"},
      {"uid":"S96-cACg8ocIReRKtZec","email":"hayoung@gmail.com","name":"Hayoung"},
      {"uid":"T7jbfTrHsHrCYs9KZATC","email":"seojun@gmail.com","name":"Seojun"},
      {"uid":"UzkizSiyTGz1ZXKYhGn0","email":"jiwoo@gmail.com","name":"Jiwoo"},
      {"uid":"VvRFkitKh-qPaPyfr5nN","email":"minjun@gmail.com","name":"Minjun"},
      {"uid":"WETcxO6WETaX92KqHpcK","email":"yoonseo@gmail.com","name":"Yoonseo"},
      {"uid":"XR5k6pRFThXrrOoLIqKfHgIN4BE2","email":"kimnamhyung8@gmail.com","name":"Namhyung Kim"}
    ];

    if(!window.confirm(`${usersToRecover.length}명의 회원을 초기화 데이터로 복구하시겠습니까?`)) return;

    let success = 0;
    for(const u of usersToRecover) {
      try {
        await setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: u.email,
          nickname: u.name,
          nickname_lower: u.name.toLowerCase(),
          level: 1,
          points: 0,
          exp: 0,
          currentSkin: 'default',
          mySkins: ['default'],
          createdAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
          isAdmin: u.email === 'idouhak1@gmail.com'
        }, { merge: true });
        success++;
      } catch(e) {
        console.error(`Failed to recover ${u.email}:`, e);
      }
    }
    alert(`${success}명의 회원이 복구되었습니다. 새로고침합니다.`);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUser = async (u: AdminUser) => {
    try {
      const userRef = doc(db, 'users', u.id);
      await updateDoc(userRef, {
        email: u.email,
        level: u.level,
        points: u.points,
        status: u.status,
        isPremium: u.isPremium
      });
      setRealUsers(prev => prev.map(old => old.id === u.id ? u : old));
      alert('회원 정보가 업데이트되었습니다.');
    } catch (e) {
      alert('회원 정보 업데이트에 실패했습니다.');
    }
  };

  const handleCreateUser = async (u: Partial<AdminUser>) => {
    try {
      const newId = `manual_${Date.now()}`;
      const userRef = doc(db, 'users', newId);
      await setDoc(userRef, {
        uid: newId,
        nickname: u.nickname,
        nickname_lower: u.nickname?.toLowerCase(),
        email: u.email || '',
        level: u.level || 1,
        points: u.points || 0,
        status: u.status || 'active',
        isPremium: u.isPremium || false,
        createdAt: serverTimestamp(),
      });
      alert('신규 회원이 등록되었습니다.');
      fetchData();
    } catch (e) {
      alert('회원 등록에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      if (!window.confirm('이 회원을 완전히 삭제하시겠습니까? 데이터가 모두 소멸됩니다.')) return;
      await deleteDoc(doc(db, 'users', id));
      alert('회원이 삭제되었습니다.');
      fetchData();
    } catch (e) {
      alert('회원 삭제에 실패했습니다.');
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={16} /> },
    { id: 'members', label: '회원관리', icon: <Users size={16} /> },
    { id: 'support', label: '문의관리', icon: <MessageSquare size={16} /> },
    { id: 'content', label: '콘텐츠', icon: <BookOpen size={16} /> },
    { id: 'notices', label: '공지사항', icon: <Megaphone size={16} /> },
    { id: 'reports', label: '채팅신고', icon: <ShieldAlert size={16} /> },
    { id: 'sales', label: '매출', icon: <DollarSign size={16} /> },
    { id: 'b2b', label: 'B2B', icon: <Building2 size={16} /> },
    { id: 'marketing', label: '마케팅센터', icon: <Rocket size={16} /> },
    { id: 'system', label: '시스템', icon: <SettingsIcon size={16} /> },
  ] as const;

  return (
    <div className="screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden h-full">
      <header className="shrink-0 bg-white border-b border-slate-100 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={16} />
            </div>
            <span className="font-black text-slate-900">관리자 패널</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPcModal(true)}
              className="bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-black text-[10px] flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Monitor size={14} /> PC로 관리
            </button>
            <button onClick={() => setScreen('HOME')} className="bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-sm active:scale-95 transition-all">EXIT</button>
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar border-t border-slate-100 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-black whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {activeTab === 'dashboard' && <DashboardSection users={realUsers} feedback={realFeedbacks} setActiveTab={setActiveTab} />}
          {activeTab === 'members' && (
            <MembersSection 
              users={realUsers} 
              onUpdateUser={handleUpdateUser}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onRefresh={fetchData}
              onBulkRecovery={handleBulkRecovery}
              loading={loadingUsers}
            />
          )}
        {activeTab === 'support' && <SupportSection feedbacks={realFeedbacks} onRefresh={fetchData} />}
        {activeTab === 'content' && <ContentSection />}
        {activeTab === 'notices' && <NoticesSection />}
        {activeTab === 'reports' && <ChatReportsSection reports={chatReports} onRefresh={fetchData} />}
        {activeTab === 'sales' && <SalesSection users={realUsers} />}
        {activeTab === 'b2b' && <B2BSection clients={MOCK_B2B} />}
        {activeTab === 'marketing' && <MarketingSection />}
        {activeTab === 'system' && <SystemSection />}
      </div>

      {showPcModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPcModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-scale-in relative p-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
              <Monitor size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">대화면에서 관리하기</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
              컴퓨터 브라우저(Chrome 추천)에서 아래 주소로 접속하면 훨씬 쾌적하게 관리 업무를 수행할 수 있습니다.
            </p>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 mb-8">
              <input readOnly value={window.location.origin} className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-600 outline-none" />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('주소가 복사되었습니다.');
                }}
                className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 active:scale-95 transition-all"
              >
                <Copy size={16} />
              </button>
            </div>
            <button 
              onClick={() => setShowPcModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-sections ---

function DashboardSection({ users, feedback, setActiveTab }: any) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="총 회원수" value={users.length} change="+3" isUp={true} color="blue" icon={<Users />} onClick={() => setActiveTab('members')} />
        <StatCard title="미처리 문의" value={feedback.filter((f: any) => f.status !== 'resolved').length} change="NEW" isUp={false} color="red" icon={<MessageSquare />} onClick={() => setActiveTab('support')} />
        <StatCard title="활성 유저" value={users.filter((u:any) => u.status === 'active').length} change="+2%" isUp={true} color="emerald" icon={<Zap />} onClick={() => setActiveTab('members')} />
        <StatCard title="프리미엄 정지" value={users.filter((u:any) => u.isPremium).length} change="PRO" isUp={true} color="amber" icon={<Crown />} onClick={() => setActiveTab('sales')} />
      </div>
      
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <h3 className="font-black text-sm mb-4 flex items-center gap-2"><PieChart size={18} /> 최근 활동 현황</h3>
        <div className="h-40 flex items-end gap-2 px-2">
          {[30, 45, 60, 20, 80, 55, 90].map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg transition-all hover:bg-indigo-600" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>

      <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 shadow-sm mt-4">
        <h3 className="font-black text-sm mb-2 text-rose-800 flex items-center gap-2"><SettingsIcon size={18} /> 데이터베이스 관리 도구</h3>
        <p className="text-xs text-rose-600 mb-4 font-bold">오래된 커뮤니티 게시물 카테고리 데이터 구조를 최신 '자유/일상(FREE)', '미디어(MEDIA)' 등으로 일괄 마이그레이션합니다.</p>
        <button 
          onClick={async () => {
            if(!window.confirm("정말 모든 구형 카테고리 게시물을 새로운 구조로 마이그레이션하시겠습니까?")) return;
            try {
              const snap = await getDocs(collection(db, "community_posts"));
              let updatedCount = 0;
              const oldCategories = ['GLOBAL', 'KR', 'JP', 'VN', 'CN', 'TW', 'CULTURE', 'FRIENDS', 'EXPERIENCE', 'APP_CERT', 'NOTICE', 'GENERAL'];
              for (const docSnap of snap.docs) {
                  const data = docSnap.data();
                  if (oldCategories.includes(data.category)) {
                      let targetCategory = 'FREE';
                      if (data.category === 'NOTICE') targetCategory = 'PROMO';
                      if (data.category === 'APP_CERT') targetCategory = 'STUDY';
                      if (data.category === 'FRIENDS') targetCategory = 'EXCHANGE';
                      if (data.category === 'CULTURE') targetCategory = 'MEDIA';
                      
                      await updateDoc(doc(db, "community_posts", docSnap.id), { category: targetCategory });
                      updatedCount++;
                  }
              }
              alert(`총 ${updatedCount}개의 게시물이 성공적으로 마이그레이션 되었습니다!`);
            } catch (err) {
              console.error(err);
              alert("마이그레이션 실패. 콘솔을 확인하세요.");
            }
          }}
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200"
        >
          구형 카테고리 일괄 마이그레이션
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isUp, color, icon, onClick }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
      <div className="flex justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
        <div className={`text-[10px] font-black px-2 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{change}</div>
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase">{title}</p>
      <h4 className="text-2xl font-black text-slate-800">{value}</h4>
    </div>
  );
}

function MembersSection({ users, onUpdateUser, onCreateUser, onDeleteUser, onRefresh, onBulkRecovery, loading }: any) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = users.filter((u: any) => 
    (u.nickname || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm" placeholder="회원 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20"><Plus size={18} /></button>
        <button onClick={onBulkRecovery} className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-colors" title="23명 회원 긴급 복구"><ShieldAlert size={18} /></button>
        <button onClick={onRefresh} className="p-3 bg-white border border-slate-200 rounded-2xl"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
            <tr>
              <th className="px-6 py-4">닉네임</th>
              <th className="px-6 py-4">이메일</th>
              <th className="px-6 py-4">레벨/포인트</th>
              <th className="px-6 py-4">상태</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u: AdminUser) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold">{u.nickname} {u.isPremium && <Crown size={12} className="inline text-amber-500" />}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4 font-mono">L{u.level} / {u.points}P</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setDetailUser(u)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="상세보기"><Eye size={18} /></button>
                  <button onClick={() => setEditing(u)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="수정"><Edit2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-0 rounded-[40px] w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-in">
              <header className="bg-indigo-600 p-8 text-white relative">
                  <button onClick={() => setDetailUser(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={18} /></button>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-4">👤</div>
                  <h3 className="text-2xl font-black">{detailUser.nickname}</h3>
                  <p className="text-sm font-bold opacity-70 flex items-center gap-1.5 mt-1"><Mail size={14} /> {detailUser.email}</p>
              </header>
              <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                          <span className={`text-xs font-black uppercase ${detailUser.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>{detailUser.status}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Premium</p>
                          <span className={`text-xs font-black uppercase ${detailUser.isPremium ? 'text-amber-500' : 'text-slate-500'}`}>{detailUser.isPremium ? 'PRO' : 'Free'}</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Hash className="text-slate-400" size={18} />
                          <div className="flex-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase">User ID</p>
                              <p className="text-xs font-mono font-bold text-slate-600">{detailUser.id}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Calendar className="text-slate-400" size={18} />
                          <div className="flex-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Join Date</p>
                              <p className="text-xs font-bold text-slate-600">{detailUser.joinDate}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Globe className="text-slate-400" size={18} />
                          <div className="flex-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Region / Level</p>
                              <p className="text-xs font-bold text-slate-600">{detailUser.region} · Level {detailUser.level} ({detailUser.points}P)</p>
                          </div>
                      </div>
                      {detailUser.isB2B && (
                         <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <Building2 className="text-indigo-600" size={18} />
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-indigo-400 uppercase">B2B Company</p>
                                <p className="text-xs font-bold text-indigo-600">{detailUser.companyName}</p>
                            </div>
                         </div>
                      )}
                  </div>
                  <button 
                    onClick={() => { setEditing(detailUser); setDetailUser(null); }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 mb-3"
                  >
                    <Edit2 size={16} /> 정보 수정하기
                  </button>
                  <button 
                    onClick={() => { onDeleteUser(detailUser.id); setDetailUser(null); }}
                    className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-95 transition-all"
                  >
                    <Trash2 size={16} /> 회원 탈퇴(삭제) 처리
                  </button>
              </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setEditing(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X size={18} /></button>
            <h3 className="text-xl font-black mb-6">{editing.nickname} 정보 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">이메일</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={editing.email || ''} onChange={e => setEditing({...editing, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">레벨</label>
                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={editing.level} onChange={e => setEditing({...editing, level: parseInt(e.target.value) || 1})} />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase ml-1">포인트</label>
                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={editing.points} onChange={e => setEditing({...editing, points: parseInt(e.target.value) || 0})} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setEditing({...editing, isPremium: !editing.isPremium})} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs ${editing.isPremium ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-400'}`}>PREMIUM</button>
                <button onClick={() => setEditing({...editing, status: editing.status === 'active' ? 'banned' : 'active'})} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs ${editing.status === 'banned' ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}>BANNED</button>
              </div>
              <button onClick={() => { onUpdateUser(editing); setEditing(null); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-4">저장하기</button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X size={18} /></button>
            <h3 className="text-xl font-black mb-6">신규 회원 등록</h3>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="닉네임" onChange={e => onCreateUser({nickname: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="이메일" />
              <button onClick={() => setIsCreating(false)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black mt-4">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentSection() {
  const [view, setView] = useState<'words' | 'prompts'>('words');
  const [search, setSearch] = useState('');
  const [customVocas, setCustomVocas] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'words') {
      const fetchCustoms = async () => {
        const snap = await getDocs(collection(db, 'custom_voca'));
        setCustomVocas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchCustoms();
    }
  }, [view]);

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-max mx-auto">
        <button onClick={() => setView('words')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'words' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>단어 DB</button>
        <button onClick={() => setView('prompts')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'prompts' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>AI 프롬프트</button>
      </div>

      {view === 'words' ? (
        <div className="space-y-4">
           <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm" 
              placeholder="단어 검색 (영문)..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
            {search.trim() === '' ? (
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 text-center text-slate-400 italic font-bold">
                VocaQuest Core DB {vocaDBJson.reduce((sum, l) => sum + l.words.length, 0)} words loaded.
              </div>
            ) : (
              vocaDBJson.flatMap((l: any) => l.words.map((w: any) => {
                const custom = customVocas.find((c: any) => c.word === w.word && c.level === l.level);
                return { ...w, level: l.level, currentMeaning: custom ? custom.meaning_ko : (w.meaning_ko || w.meaning) };
              }))
                .filter(w => w.word.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 10)
                .map((w, i) => (
                  <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Level {w.level}</span>
                        <h4 className="font-black text-slate-800">{w.word}</h4>
                      </div>
                      <p className="text-sm text-slate-500 font-bold">{w.currentMeaning}</p>
                    </div>
                    <button 
                      onClick={async () => {
                        const newMeaning = window.prompt(`'${w.word}'의 새로운 뜻을 입력하세요:`, w.currentMeaning);
                        if (newMeaning !== null && newMeaning.trim() !== "") {
                          try {
                            const q = query(collection(db, 'custom_voca'), where('word', '==', w.word), where('level', '==', w.level));
                            const snap = await getDocs(q);
                            
                            const data = {
                              word: w.word,
                              level: w.level,
                              meaning_ko: newMeaning,
                              updatedAt: serverTimestamp()
                            };

                            if (!snap.empty) {
                              await updateDoc(doc(db, 'custom_voca', snap.docs[0].id), data);
                            } else {
                              await addDoc(collection(db, 'custom_voca'), data);
                            }
                            
                            // Immediately update local state to reflect change
                            setCustomVocas(prev => {
                                const idx = prev.findIndex(c => c.word === w.word && c.level === w.level);
                                if (idx > -1) {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], meaning_ko: newMeaning };
                                    return next;
                                } else {
                                    return [...prev, data];
                                }
                            });

                            alert('단어 뜻이 수정되었습니다.');
                          } catch (e) {
                            alert('수정 실패!');
                          }
                        }
                      }}
                      className="p-3 bg-slate-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))
            )}
            {search.trim() !== '' && vocaDBJson.flatMap((l: any) => l.words).filter((w: any) => w.word.toLowerCase().includes(search.toLowerCase())).length > 10 && (
              <p className="text-center text-[10px] text-slate-400 font-bold italic">Too many results, please be more specific.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Dictionary AI</h4>
             <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono" defaultValue={localStorage.getItem('vq_prompt_dictionary') || 'You are a professional linguist...'} />
             <div className="flex justify-end mt-2"><button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black">SAVE</button></div>
           </div>
        </div>
      )}
    </div>
  );
}

function SupportSection({ feedbacks, onRefresh }: any) {
  const handleResolve = async (fb: any) => {
    try {
      if (!window.confirm('이 문의를 처리 완료로 표시하시겠습니까?')) return;
      await updateDoc(doc(db, 'feedbacks', fb.id), { status: 'resolved' });
      onRefresh();
      alert('처리되었습니다.');
    } catch (e) { alert('처리 실패!'); }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('정말 삭제하시겠습니까?')) return;
      await deleteDoc(doc(db, 'feedbacks', id));
      onRefresh();
      alert('삭제되었습니다.');
    } catch (e) { alert('삭제 실패!'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-black text-slate-800 flex items-center gap-2"><MessageSquare className="text-indigo-600" /> 사용자 문의 및 피드백</h2>
      {feedbacks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-[32px] border border-slate-100 text-slate-400 font-bold italic">문의 내역이 없습니다.</div>
      ) : feedbacks.map((fb: any) => (
        <div key={fb.id} className={`bg-white p-6 rounded-[32px] border shadow-sm transition-all ${fb.status === 'resolved' ? 'opacity-60 grayscale' : 'border-indigo-50'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="font-black text-slate-800">{fb.nickname || '익명'} <span className="text-[10px] text-slate-400 font-bold ml-2">{fb.email}</span></p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : 'Recently'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {fb.status !== 'resolved' && (
                <button onClick={() => handleResolve(fb)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20">RESOLVE</button>
              )}
              <button onClick={() => handleDelete(fb.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
          <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed italic">"{fb.content}"</p>
          {fb.status === 'resolved' && (
            <div className="mt-3 flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase ml-1">
              <CheckCircle2 size={12} /> Resolved
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NoticesSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [activeDraftLang, setActiveDraftLang] = useState('ko');
  const [newTranslations, setNewTranslations] = useState<Record<string, { title: string; content: string }>>({});

  const fetchNotices = async () => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice)));
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices'), {
        title_ko: newTitle,
        content_ko: newContent,
        translations: newTranslations,
        createdAt: serverTimestamp(),
      });
      setNewTitle('');
      setNewContent('');
      setNewTranslations({});
      setActiveDraftLang('ko');
      fetchNotices();
      alert('공지사항이 등록되었습니다.');
    } catch (e) { alert('등록 실패!'); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingNotice || !editingNotice.title_ko.trim() || !editingNotice.content_ko.trim()) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'notices', editingNotice.id), {
        title_ko: editingNotice.title_ko,
        content_ko: editingNotice.content_ko,
        translations: editingNotice.translations || {},
      });
      setEditingNotice(null);
      setActiveDraftLang('ko');
      fetchNotices();
      alert('공지사항이 수정되었습니다.');
    } catch (e) { alert('수정 실패!'); } finally { setLoading(false); }
  };

  const getDraftTitle = () => {
    if (activeDraftLang === 'ko') return editingNotice ? editingNotice.title_ko : newTitle;
    if (editingNotice) return editingNotice.translations?.[activeDraftLang]?.title || '';
    return newTranslations[activeDraftLang]?.title || '';
  };

  const getDraftContent = () => {
    if (activeDraftLang === 'ko') return editingNotice ? editingNotice.content_ko : newContent;
    if (editingNotice) return editingNotice.translations?.[activeDraftLang]?.content || '';
    return newTranslations[activeDraftLang]?.content || '';
  };

  const setDraftTitle = (val: string) => {
    if (activeDraftLang === 'ko') {
      if (editingNotice) setEditingNotice({ ...editingNotice, title_ko: val });
      else setNewTitle(val);
    } else {
      if (editingNotice) {
        const trans = { ...(editingNotice.translations || {}) };
        trans[activeDraftLang] = { ...(trans[activeDraftLang] || { content: '' }), title: val };
        setEditingNotice({ ...editingNotice, translations: trans });
      } else {
        const trans = { ...newTranslations };
        trans[activeDraftLang] = { ...(trans[activeDraftLang] || { content: '' }), title: val };
        setNewTranslations(trans);
      }
    }
  };

  const [translating, setTranslating] = useState(false);

  const setDraftContent = (val: string) => {
    if (activeDraftLang === 'ko') {
      if (editingNotice) setEditingNotice({ ...editingNotice, content_ko: val });
      else setNewContent(val);
    } else {
      if (editingNotice) {
        const trans = { ...(editingNotice.translations || {}) };
        trans[activeDraftLang] = { ...(trans[activeDraftLang] || { title: '' }), content: val };
        setEditingNotice({ ...editingNotice, translations: trans });
      } else {
        const trans = { ...newTranslations };
        trans[activeDraftLang] = { ...(trans[activeDraftLang] || { title: '' }), content: val };
        setNewTranslations(trans);
      }
    }
  };

  const handleAiTranslate = async () => {
    const title = activeDraftLang === 'ko' ? (editingNotice ? editingNotice.title_ko : newTitle) : '';
    const content = activeDraftLang === 'ko' ? (editingNotice ? editingNotice.content_ko : newContent) : '';
    
    if (!title.trim() || !content.trim()) return alert('자동 번역을 하려면 먼저 한국어 제목과 내용을 입력해야 합니다. (한국어 탭에서 입력해주세요)');
    
    setTranslating(true);
    try {
      const apiKey = decryptApiKey(localStorage.getItem('vq_gemini_key') || '');
      if (!apiKey) throw new Error('API 키가 없습니다.');

      const prompt = `주제: VocaQuest 공지사항 번역 전문가
목표: 제공된 한국어 공지사항을 영어(en), 일본어(ja), 중국어(zh), 베트남어(vi), 대만(tw) 5가지 언어로 자연스럽게 번역.
형식: 반드시 마크다운 코드 블록(예: \`\`\`json) 없이 아래의 JSON 형식으로만 응답할 것.
응답 예시: {"en": {"title": "...", "content": "..."}, "ja": {...}, "zh": {...}, "vi": {...}, "tw": {...}}

입력된 한국어 제목: ${title}
입력된 한국어 내용: ${content}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('AI Raw Response:', rawText);
      
      // Clean up JSON response (AI sometimes adds extra text or markers)
      let cleanedText = rawText.trim();
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsedTranslations = JSON.parse(cleanedText);
      
      if (editingNotice) {
        setEditingNotice({ ...editingNotice, translations: parsedTranslations });
      } else {
        setNewTranslations(parsedTranslations);
      }
      alert('AI 번역이 완료되었습니다. 각 언어 탭에서 확인해보세요!');
    } catch (e) { 
      console.error(e);
      alert('AI 번역 실패! API 키를 확인하거나 잠시 후 다시 시도해주세요.'); 
    } finally { 
      setTranslating(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-800 ml-1">{editingNotice ? '공지 수정' : '새 공지 작성'}</h3>
        
        <div className="flex items-center justify-between gap-2 pb-1">
          <div className="flex overflow-x-auto no-scrollbar gap-2 flex-1">
            {languages.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  console.log('Switching to lang:', l.code);
                  setActiveDraftLang(l.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap cursor-pointer z-10 ${
                  activeDraftLang === l.code 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                    : (editingNotice?.translations?.[l.code]?.title || newTranslations[l.code]?.title)
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
          <button 
            onClick={handleAiTranslate} 
            disabled={translating || activeDraftLang !== 'ko'}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${
              activeDraftLang === 'ko' 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {translating ? <RefreshCcw size={10} className="animate-spin" /> : <Globe size={10} />}
            AI 번역
          </button>
        </div>

        <input 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
          placeholder={activeDraftLang === 'ko' ? "공지사항 제목 (필수)" : `${activeDraftLang.toUpperCase()} 제목 (선택)`} 
          value={getDraftTitle()} 
          onChange={e => setDraftTitle(e.target.value)} 
        />
        <textarea 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 text-sm" 
          placeholder={activeDraftLang === 'ko' ? "공지 내용... (필수)" : `${activeDraftLang.toUpperCase()} 내용... (선택)`}
          value={getDraftContent()} 
          onChange={e => setDraftContent(e.target.value)} 
        />
        <div className="flex gap-2">
          {editingNotice && (
            <button onClick={() => { setEditingNotice(null); setActiveDraftLang('ko'); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black">취소</button>
          )}
          <button 
            onClick={editingNotice ? handleUpdate : handleAdd} 
            disabled={loading} 
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black"
          >
            {editingNotice ? '수정 완료' : '공지 게시하기'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map(n => (
          <div key={n.id} className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-indigo-200 transition-all">
             <div className="flex items-center justify-between gap-4">
                <div 
                  className="flex-1 min-w-0 cursor-pointer" 
                  onClick={() => {
                    setEditingNotice(n);
                    setActiveDraftLang('ko');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                   <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{n.title_ko}</h4>
                      <div className="flex gap-1 shrink-0">
                        {n.translations && Object.keys(n.translations).map(langCode => (
                          <span key={langCode} className="px-1 py-0.5 bg-indigo-50 text-indigo-500 text-[8px] font-black rounded border border-indigo-100 uppercase">
                            {langCode}
                          </span>
                        ))}
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-0.5">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : '방금 전'}</p>
                </div>
                <div className="flex gap-1 shrink-0 z-10">
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       e.preventDefault();
                       console.log('Edit button clicked for notice:', n.id);
                       setEditingNotice(n);
                       setActiveDraftLang('ko');
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                     }} 
                     className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                   >
                     <Edit2 size={16} />
                   </button>
                    <button 
                      type="button"
                      onClick={async (e) => { 
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('NOTICE_DELETE_CLICK_RAW', n.id);
                        if(window.confirm('이 공지사항을 정말 삭제하시겠습니까?')) { 
                         try {
                           console.log('Deleting notice:', n.id);
                           await deleteDoc(doc(db, 'notices', n.id)); 
                           fetchNotices(); 
                           alert('삭제되었습니다.');
                         } catch(err: any) {
                           console.error('Delete error:', err);
                           alert('삭제 중 오류가 발생했습니다.');
                         }
                       } 
                     }} 
                     className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatReportsSection({ reports, onRefresh }: any) {
  const handleAction = async (report: any, action: 'ban' | 'dismiss') => {
    if (!window.confirm(`${report.reportedUserName}님에 대해 처리하시겠습니까?`)) return;
    try {
      if (action === 'ban') {
        await updateDoc(doc(db, 'users', report.reportedUserId), { status: 'banned' });
      }
      await deleteDoc(doc(db, 'chat_reports', report.id));
      onRefresh();
      alert('처리가 완료되었습니다.');
    } catch (e) { alert('실패했습니다.'); }
  };

  return (
    <div className="space-y-4">
       <h2 className="font-black text-slate-800 flex items-center gap-2"><ShieldAlert className="text-red-500" /> 미처리 실시간 신고</h2>
       {reports.length === 0 ? (
         <div className="p-10 text-center bg-white rounded-[32px] border border-slate-100 text-slate-400 font-bold italic">신고 내역이 없습니다.</div>
       ) : reports.map((r: any) => (
         <div key={r.id} className="bg-white p-6 rounded-[32px] border-2 border-red-50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{r.reason}</span>
                <p className="font-black mt-2">{r.reportedUserName} <ArrowRight className="inline mx-1" size={14} /> {r.reporterName}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(r, 'ban')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black">BAN</button>
                <button onClick={() => handleAction(r, 'dismiss')} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-black">X</button>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl">"{r.detail || '상세 사유 없음'}"</p>
         </div>
       ))}
    </div>
  );
}

function SalesSection({ users }: any) {
  return (
    <div className="space-y-6">
       <div className="bg-slate-800 p-8 rounded-[40px] text-white flex justify-between items-center shadow-xl">
         <div>
           <p className="text-xs font-black text-indigo-300 uppercase mb-1">TOTAL SALES (EST.)</p>
           <h4 className="text-4xl font-black italic tracking-tighter">${(users.filter((u:any)=>u.isPremium).length * 29.99).toFixed(2)}</h4>
         </div>
         <div className="text-right">
           <p className="text-[10px] font-black text-slate-400">PRO USERS</p>
           <p className="text-2xl font-black text-amber-400">{users.filter((u:any)=>u.isPremium).length}</p>
         </div>
       </div>
       <div className="bg-white p-10 rounded-[40px] border border-slate-100 text-center">
         <DollarSign size={48} className="mx-auto text-slate-100 mb-4" />
         <p className="text-slate-400 font-bold leading-relaxed">RevenueCat 결제 시스템 연동 중입니다.<br/>상세 내역은 RevenueCat 콘솔에서 확인 가능합니다.</p>
       </div>
    </div>
  );
}

function B2BSection({ clients }: any) {
  return (
    <div className="space-y-6">
       {clients.map((c: any) => (
         <div key={c.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Building2 /></div>
             <div>
               <h4 className="font-black text-slate-800">{c.name}</h4>
               <p className="text-xs text-slate-400 font-bold">{c.plan} · {c.totalMembers}명</p>
             </div>
           </div>
           <ChevronRight className="text-slate-300" />
         </div>
       ))}
    </div>
  );
}

function MarketingSection() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return alert('주제를 입력하세요.');
    setIsLoading(true);
    try {
      const apiKey = decryptApiKey(localStorage.getItem('vq_gemini_key') || '');
      const prompt = `VocaQuest 마케팅 전문가로서 주제 "${topic}"에 대한 알림 문구와 SNS 설명을 한국어로 작성해줘. JSON 형식으로 답해.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      setResult(data?.candidates?.[0]?.content?.parts?.[0]?.text || '결과 없음');
    } catch (e) { alert('AI 에러!'); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
       <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl">
         <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Rocket /> AI 마케팅 에이전트</h3>
         <input className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-indigo-200" placeholder="예: 여름방학 7일 챌린지 광고 문구" value={topic} onChange={e=>setTopic(e.target.value)} />
         <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-lg uppercase">{isLoading ? 'Writing...' : 'Generate Bundle'}</button>
       </div>
       {result && <pre className="bg-slate-900 text-emerald-400 p-6 rounded-[32px] text-xs overflow-x-auto whitespace-pre-wrap">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

function SystemSection() {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-6">

       <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
         <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> 시스템 보안</h4>
         <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
           <span className="text-xs font-black text-slate-400">GEMINI API KEY</span>
           <div className="flex items-center gap-2">
             <input type={showKey ? 'text' : 'password'} readOnly value={decryptApiKey(localStorage.getItem('vq_gemini_key') || '') || 'NOT SET'} className="bg-transparent text-right text-xs font-mono font-black border-none outline-none" />
             <button onClick={() => setShowKey(!showKey)} className="text-slate-300">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
           </div>
         </div>
       </div>

       <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl flex items-center justify-between">
         <div>
           <h3 className="text-2xl font-black italic">Server Status: Normal</h3>
           <p className="text-xs font-bold opacity-80 mt-1">Regional nodes OK</p>
         </div>
         <CheckCircle2 size={40} className="opacity-40" />
       </div>
    </div>
  );
}
