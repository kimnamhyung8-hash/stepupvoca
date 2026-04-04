import { useState, useEffect } from 'react';
import {
    ChevronLeft, Sparkles, Brain, PlayCircle, TrendingUp as LineChart,
    X, Lightbulb, BookOpen, ChevronRight, Target, Languages, Volume2, ShieldCheck, Bot
} from 'lucide-react';
import { t } from '../i18n';
import { playNaturalTTS, stopTTS } from '../utils/ttsUtils';
import { getActiveApiKey, HIGH_PERFORMANCE_MODEL, LIGHTWEIGHT_MODEL } from '../apiUtils';
import { showAdIfFree } from '../admob';
import { getActivityLog } from '../streak';
import { getCefrFromLevel } from '../utils/wordUtils';

interface AiReportScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    userInfo: any;
    incorrectNotes: any[];
    setIncorrectNotes: (notes: any) => void;
    setMyPhrases: (phrases: any) => void;
    incrementAiUsage?: () => boolean;
    commitReportUsage?: () => void;
    reportUsage?: number;
    activeScenario?: any;
    convLevel?: string;
    prevScreen?: string;
    mode?: 'VOCAB' | 'CONVERSATION';
    aiUsage?: number;
    setShowApiModal?: (show: boolean) => void;
}

export const AiReportScreen = ({
    settings,
    setScreen,
    userInfo,
    incorrectNotes,
    setIncorrectNotes,
    setMyPhrases,
    incrementAiUsage,
    commitReportUsage,
    reportUsage = 0,
    activeScenario,
    convLevel = 'B1',
    prevScreen = 'HOME',
    mode = 'VOCAB',
    aiUsage = 0,
    setShowApiModal
}: AiReportScreenProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Load saved report and logs from specific sub-scenario key
    const savedBundle = (() => {
        try {
            let specificKey = 'vq_vocab_report_data';
            if (mode === 'CONVERSATION') {
                const scId = activeScenario?.id;
                const subId = activeScenario?.subScSelected?.id || 'default';
                specificKey = scId ? `vq_rep_${scId}_${subId}` : 'vq_ai_report_data';
            }
            
            let saved = localStorage.getItem(specificKey);
            // Fallback for legacy data in VOCAB mode
            if (!saved && mode === 'VOCAB') {
                saved = localStorage.getItem('vq_ai_report_data');
            }

            if (saved) {
                const parsed = JSON.parse(saved);
                // NEW BUNDLE FORMAT: { data: {...}, logs: [...], mode: "..." }
                if (parsed && typeof parsed === 'object' && parsed.hasOwnProperty('data')) {
                    return { data: parsed.data, logs: parsed.logs || null };
                }
                // LEGACY FORMAT: just the analysis object directly
                return { data: parsed, logs: null };
            }
        } catch { }
        return { data: null, logs: null };
    })();

    const [reportData, setReportData] = useState<any | null>(savedBundle.data);
    const [viewMode, setViewMode] = useState<'DASHBOARD' | 'REVIEW'>('DASHBOARD');
    const [reviewIndex, setReviewIndex] = useState(0);
    const [explanationCache, setExplanationCache] = useState<{ [key: number]: string }>({});
    const [isExplaining, setIsExplaining] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const handleSaveToBible = (exp: any) => {
        setMyPhrases((prev: any) => {
            if (prev.some((p: any) => p.english === exp.better)) return prev;
            return [{
                id: Date.now(),
                original: exp.basic || exp.wrong || "",
                english: exp.better || exp.correct,
                englishPronunciation: "",
                nativeTranslation: exp.translation || "",
                originalPronunciation: "",
                inputLangCode: 'en',
                categoryId: 'ai_report',
                createdAt: new Date().toLocaleDateString(settings.lang === 'ko' ? 'ko-KR' : settings.lang === 'ja' ? 'ja-JP' : settings.lang === 'zh' ? 'zh-CN' : 'en-US')
            }, ...prev];
        });
        triggerToast(t(settings.lang, 'toast_saved_ko') || "Saved! ✨");
    };

    const handleSaveToWrongNote = (item: any) => {
        setIncorrectNotes((prev: any) => {
            if (prev.some((n: any) => (n.word) === (item.word))) return prev;
            return [{
                id: Date.now(),
                word: item.word,
                translation: item.translation || item.meaning || "",
                context: item.context || "",
                level: 1, // Default level
                addedDate: new Date().toISOString()
            }, ...prev];
        });
        triggerToast(t(settings.lang, 'toast_saved_wrong') || "Added to Wrong Note! 📝");
    };

    const activeConvLogs = (() => {
        if (savedBundle.logs) return savedBundle.logs;
        try {
            const scId = activeScenario?.id;
            const subId = activeScenario?.subScSelected?.id || 'default';
            const specificLogKey = scId ? `vq_logs_${scId}_${subId}` : 'vq_conv_logs';
            const saved = localStorage.getItem(specificLogKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
                if (parsed.messages) return parsed.messages;
            }
        } catch { }
        return [];
    })();

    const handleGenerate = async () => {
        if (incrementAiUsage && !incrementAiUsage()) {
            return;
        }

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, settings?.isPremium || false, aiUsage);

        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        await showAdIfFree();
        setIsGenerating(true);

        const log = getActivityLog();
        const recentWrongWords = incorrectNotes.slice(0, 15).map((n: any) => n.word).join(', ');
        const userTarget = userInfo?.target || "General English";
        const userPurpose = userInfo?.purpose || "English Conversation";
        const level = userInfo?.level || 1;
        const userLevel = getCefrFromLevel(level);
        const recentStats = log.slice(-20).map((l: any) => ({ type: l.type, date: l.date, value: l.value }));

        let levelTestInfo = "Not taken";
        try {
            const savedTest = localStorage.getItem('vq_level_test_result');
            if (savedTest) {
                const parsed = JSON.parse(savedTest);
                levelTestInfo = `Tested Level: ${parsed.level} (Overall Score: ${parsed.overall}/100, Vocab: ${parsed.scores.vocab}, Grammar: ${parsed.scores.grammar}, Reading: ${parsed.scores.reading})`;
            }
        } catch (e) { }

        let promptText = "";

        if (mode === 'VOCAB') {
            promptText = `
                # Role & Persona
                당신은 Vocaquest의 수석 AI 학습 코치이자, 대한민국 최고의 프리미엄 교육 서비스를 제공하는 '1타 강사'입니다. 
                유저의 오답 패턴과 학습 통계를 분석하여, 망각 곡선 이론에 기반한 냉철한 약점 진단과 향후 4주간의 학습 로드맵을 제시하십시오.

                # Output Constraints
                1. 당신의 응답은 반드시 아래에 정의된 JSON 스키마와 100% 일치해야 합니다.
                2. 인사말 생략, 오직 JSON만 출력하십시오.
                3. Language: "${settings.lang}".

                # JSON Schema
                {
                    "summaryTitle": "string",
                    "swot": {
                        "strengths": "string",
                        "weaknesses": "string",
                        "opportunities": "string",
                        "threats": "string"
                    },
                    "forgettingCurve": {
                        "status": "safe | warning | critical",
                        "message": "string",
                        "percentRemaining": "number"
                    },
                    "directedGoals": {
                        "direction": "string",
                        "milestone": "string"
                    },
                    "customTasks": [
                        { "title": "string", "description": "string" }
                    ],
                    "nuanceCoaching": [
                        { "word": "string", "meaning": "string", "example": "string", "coachingTip": "string" }
                    ],
                    "targetWords": [
                        { "word": "string", "translation": "string (MUST provide a detailed translation in 유저언어)", "context": "string (A practical usage sentence)" }
                    ],
                    "fourWeekRoadmap": [
                        { "week": "number", "goal": "string", "action": "string" }
                    ]
                }

                # Input Data
                - Level: ${userLevel}
                - Target: ${userTarget}
                - Purpose: ${userPurpose}
                - Wrong Words: [${recentWrongWords}]
                - Activity Logs: ${JSON.stringify(recentStats)}
                - Test Results: ${levelTestInfo}
            `;
        } else {
            // CONVERSATION MODE
            let convLogs = "No recent conversation data.";
            try {
                const scId = activeScenario?.id;
                const subId = activeScenario?.subScSelected?.id || 'default';
                const specificLogKey = scId ? `vq_logs_${scId}_${subId}` : 'vq_conv_logs';
                const savedLogs = localStorage.getItem(specificLogKey);
                
                if (savedLogs) {
                    const parsed = JSON.parse(savedLogs);
                    // If it's a direct message array (new specific format)
                    if (Array.isArray(parsed)) {
                        convLogs = parsed.map((m: any) => `[${m.role}] ${m.text}`).join('\n');
                    } else if (parsed.messages) {
                        // If it's the wrapped entry format
                        convLogs = parsed.messages.map((m: any) => `[${m.role}] ${m.text}`).join('\n');
                    }
                } else if (!savedLogs) {
                    // Final fallback to vq_conv_logs if specific key missing
                    const globalLogs = localStorage.getItem('vq_conv_logs');
                    if (globalLogs) {
                        const parsed = JSON.parse(globalLogs);
                        const latest = Array.isArray(parsed) ? parsed[0] : parsed;
                        convLogs = latest.messages.map((m: any) => `[${m.role}] ${m.text}`).join('\n');
                    }
                }
            } catch (e) { console.error("Log fetch error:", e); }

            promptText = `
                # Role & Persona
                당신은 Vocaquest의 수석 AI 회화 코치입니다. 최근 유저와의 AI 회화 내용을 분석하여 문법 교정과 더 세련된 표현(Native-like)을 제안하십시오.

                # Output Constraints
                1. JSON 스키마 준수, 인사말 생략.
                2. Language: "${settings.lang}".

                # JSON Schema (Conversation specialized)
                {
                    "summaryTitle": "string",
                    "conversationAnalysis": {
                        "overallFeedback": "string",
                        "grammarCorrections": [ { "wrong": "string", "correct": "string", "reason": "string", "translation": "string" } ],
                        "powerfulExpressions": [ { "basic": "string", "better": "string", "why": "string", "translation": "string" } ]
                    },
                    "selectedReviewIndices": ["number"],
                    "topStrength": "string",
                    "criticalWeakness": "string",
                    "forgettingCurve": { "status": "safe", "message": "string", "percentRemaining": "number" },
                    "targetWords": [ { "word": "string", "translation": "string (MUST provide a detailed translation in 유저언어)", "context": "string (A practical usage sentence)" } ]
                }

                # Input Data
                - Level: ${userLevel}
                - Conversation Logs: ${convLogs}
                - Scenario: ${activeScenario?.subScSelected?.title_ko || "English Chat"}
            `;
        }

        try {
            let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${HIGH_PERFORMANCE_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });

            if (!response.ok) {
                console.warn(`[AI Report] API Error (${response.status}) on ${HIGH_PERFORMANCE_MODEL}. Falling back to ${LIGHTWEIGHT_MODEL}...`);
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                });
            }

            if (!response.ok) {
                throw new Error(await response.text());
            }
            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanJson = rawText.replace(new RegExp('```json', 'gi'), '').replace(new RegExp('```', 'gi'), '').trim() || rawText.trim();
            const parsedReport = JSON.parse(cleanJson);
            
            // Ensure selectedReviewIndices exists (fallback to random/first few if AI fails)
            if (mode === 'CONVERSATION') {
                if (!parsedReport.selectedReviewIndices || !Array.isArray(parsedReport.selectedReviewIndices)) {
                    parsedReport.selectedReviewIndices = [0, 1, 2].slice(0, activeConvLogs.length);
                }
                // Limit to max 4 items as requested
                parsedReport.selectedReviewIndices = parsedReport.selectedReviewIndices.slice(0, 4);
            }

            setReportData(parsedReport);
            
            let specificKey = 'vq_vocab_report_data';
            if (mode === 'CONVERSATION') {
                const scId = activeScenario?.id;
                const subId = activeScenario?.subScSelected?.id || 'default';
                specificKey = scId ? `vq_rep_${scId}_${subId}` : 'vq_ai_report_data';
            }
            
            // Save bundle
            const saveBundle = {
                data: parsedReport,
                logs: mode === 'CONVERSATION' ? activeConvLogs : null,
                level: mode === 'CONVERSATION' ? convLevel : null,
                mode
            };
            
            localStorage.setItem(specificKey, JSON.stringify(saveBundle));
            if (mode === 'VOCAB') {
                localStorage.setItem('vq_ai_report_data', cleanJson); // Global back compat
            }
            
            if (commitReportUsage) commitReportUsage();
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }

    };

    // AUTO-GENERATE FOR CONVERSATION MODE
    useEffect(() => {
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, settings?.isPremium || false, aiUsage);
        const canAutoGenerate = 
            mode === 'CONVERSATION' && 
            !reportData && 
            !isGenerating && 
            activeConvLogs.length > 0 && 
            activeKey;

        if (canAutoGenerate) {
            const timer = setTimeout(() => {
                handleGenerate();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mode, !!reportData, aiUsage, activeConvLogs.length]);

    const safeRender = (val: any) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            const preferred = val[settings.lang] || val.tr || val.translation || val.en || Object.values(val)[0] || "";
            return typeof preferred === 'string' ? preferred : JSON.stringify(preferred);
        }
        return String(val);
    };

    const handleSpeak = async (text: string) => {
        await playNaturalTTS(text, settings.lang);
    };

    const generateTurnExplanation = async (index: number) => {
        if (incrementAiUsage && !incrementAiUsage()) {
            return;
        }
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, settings?.isPremium || false, aiUsage);
        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }
        const userLevel = getCefrFromLevel(userInfo?.level || 1);
        // Find the actual log index from the selected indices
        const actualLogIndex = reportData?.selectedReviewIndices?.[index] ?? index;
        const msg = activeConvLogs[actualLogIndex];
        if (!msg) return;
        if (explanationCache[actualLogIndex]) {
            handleSpeak(explanationCache[actualLogIndex]);
            return;
        }

        setIsExplaining(true);
        try {
            const prompt = `
        당신은 냉철하고 예리한 시각으로 핵심을 짚어주는 1타 AI 강사입니다. 
        아래 대화 내용에 대해 유저가 다음 레벨(${userLevel})로 올라가기 위해 반드시 개선해야 할 점이나 꼭 배워야 할 핵심 포인트 위주로 '미션' 형태의 설명을 해주세요.

        [대화 상황]
        역할: ${msg.role === 'user' ? '학생(Student)' : 'AI 선생님(Teacher)'}
        내용: "${msg.text}"
        유저 레벨: ${userLevel}

        [지침]
        1. 첫 문장은 "핵심을 짚어드릴게요!"나 "이 부분은 꼭 체크해야 합니다." 같이 자신감 있게 시작하세요.
        2. 이 문장이 실전 상황(공항, 호텔 등)에서 왜 중요한지 핵심만 간단히 설명하세요.
        3. ${userLevel} 레벨 유저가 더 세련되게(Better way to say) 들릴 수 있는 강력한 대안 표현을 하나 제안하세요.
        4. 말투는 단호하면서도 열정이 느껴지는 구어체를 사용하세요.
        5. 오직 "한국어"로만 응답하며, 이모지를 활용해 가독성을 높이세요.
      `;

            let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${HIGH_PERFORMANCE_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                console.warn(`[AI Report] API Error (${response.status}) on ${HIGH_PERFORMANCE_MODEL}. Falling back to ${LIGHTWEIGHT_MODEL}...`);
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
            }

            if (!response.ok) throw new Error("Explanation gen failed");
            const data = await response.json();
            const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text || "설명을 생성할 수 없습니다.";

            setExplanationCache(prev => ({ ...prev, [index]: explanation }));
            handleSpeak(explanation);
        } catch (e) {
            console.error("Explanation Error:", e);
        } finally {
            setIsExplaining(false);
        }
    };

    // Component Unmount 시 오디오 강제 중지
    useEffect(() => {
        return () => {
            stopTTS();
        };
    }, []);

    return (
        <div className="screen relative bg-[#0A0A0E] flex flex-col overflow-hidden text-white">
            <header className="flex items-center justify-between px-5 pt-[calc(10px+env(safe-area-inset-top,24px))] pb-4 border-b border-white/5 sticky top-0 bg-[#0A0A0E]/90 backdrop-blur-xl z-30">
                <button onClick={() => {
                    stopTTS();
                    if (viewMode === 'REVIEW') {
                        setViewMode('DASHBOARD');
                    } else {
                        setScreen(prevScreen || 'HOME');
                    }
                }}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl active:scale-95 transition-all text-slate-400 border border-white/5">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-[17px] font-black text-white flex items-center gap-2 italic tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                        {viewMode === 'DASHBOARD' ? <Sparkles size={18} className="text-indigo-400" /> : <BookOpen size={18} className="text-indigo-400" />}
                    </div>
                    {viewMode === 'DASHBOARD' ? t(settings.lang, 'ai_report_title') : t(settings.lang, 'ai_report_review_detail')}
                </h2>
                <div className="flex items-center gap-2">
                    {viewMode === 'REVIEW' && (
                        <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                {reviewIndex + 1} / {reportData?.selectedReviewIndices?.length || activeConvLogs.length}
                            </span>
                        </div>
                    )}
                    <button onClick={() => {
                        stopTTS();
                        setScreen(prevScreen);
                    }} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-[calc(var(--nav-height)+env(safe-area-inset-bottom,24px))]">
                {viewMode === 'DASHBOARD' && !reportData && !isGenerating && (
                    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 relative">
                            <Brain size={40} className="text-white" />
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full px-1.5 py-0.5 text-[9px] font-black text-white shadow-lg border-2 border-white animate-pulse">PRO</div>
                        </div>

                        <h1 className="text-2xl font-black text-white mb-2 tracking-tight leading-tight italic uppercase">
                            AI WEAKNESS<br />ANALYZER
                        </h1>
                        <div className="flex items-center gap-2 mb-8 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t(settings.lang, "daily_usage") || "Daily Usage"}: {reportUsage} / 5</span>
                        </div>
                        

                        <button onClick={handleGenerate}
                            className="w-full bg-indigo-600 text-white py-5 rounded-[22px] font-black text-[15px] shadow-xl shadow-indigo-600/20 active:translate-y-0.5 transition-all flex justify-center items-center gap-2">
                            <PlayCircle size={20} /> {t(settings.lang, 'ai_report_dashboard_build')}
                        </button>
                    </div>
                )}


                {isGenerating && (
                    <div className="flex flex-col items-center justify-center text-center py-32 px-6">
                        <div className="relative w-28 h-28 mb-8">
                            <div className="absolute inset-0 bg-indigo-600/10 rounded-[40px] animate-pulse"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain size={40} className="text-indigo-500 animate-bounce" />
                            </div>
                        </div>
                        <h2 className="textxl font-black text-white mb-2 italic tracking-tight uppercase">{t(settings.lang, 'ai_report_analyzing')}</h2>
                        <p className="text-indigo-500 font-bold text-xs uppercase tracking-widest animate-pulse">{t(settings.lang, 'ai_report_connecting')}</p>
                    </div>
                )}

                {reportData && !isGenerating && (
                    <div className="p-4 space-y-6 animate-fade-in pb-20">
                        {mode === 'VOCAB' ? (
                            <>
                                {/* VOCAB MODE: MAIN SUMMARY */}
                                <div className="bg-[#1e1e2d] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[6px] bg-indigo-600/50"></div>
                                    <h2 className="text-[22px] font-black text-white leading-snug tracking-tighter mb-4">
                                        {safeRender(reportData.summaryTitle)}
                                    </h2>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t(settings.lang, 'edu_direction') || "Learning Direction"}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">
                                        {safeRender(reportData.directedGoals?.direction)}
                                    </p>
                                </div>

                                {/* SWOT ANALYSIS */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#1e1e2d] p-5 rounded-[24px] border border-emerald-500/10">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">{t(settings.lang, 'swot_strengths') || "Strengths"}</span>
                                        <p className="text-[12px] font-bold text-slate-300 leading-tight">{safeRender(reportData.swot?.strengths)}</p>
                                    </div>
                                    <div className="bg-[#1e1e2d] p-5 rounded-[24px] border border-red-500/10">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 block">{t(settings.lang, 'swot_weaknesses') || "Weaknesses"}</span>
                                        <p className="text-[12px] font-bold text-slate-300 leading-tight">{safeRender(reportData.swot?.weaknesses)}</p>
                                    </div>
                                    <div className="bg-[#1e1e2d] p-5 rounded-[24px] border border-blue-500/10">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">{t(settings.lang, 'swot_opportunities') || "Opportunities"}</span>
                                        <p className="text-[12px] font-bold text-slate-300 leading-tight">{safeRender(reportData.swot?.opportunities)}</p>
                                    </div>
                                    <div className="bg-[#1e1e2d] p-5 rounded-[24px] border border-amber-500/10">
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 block">{t(settings.lang, 'swot_threats') || "Threats"}</span>
                                        <p className="text-[12px] font-bold text-slate-300 leading-tight">{safeRender(reportData.swot?.threats)}</p>
                                    </div>
                                </div>

                                {/* MEMORY RETENTION */}
                                <div className="bg-[#1e1e2d] rounded-[32px] p-6 border border-white/5 shadow-xl flex items-center gap-5">
                                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                            <path className={`${reportData.forgettingCurve?.status === 'critical' ? 'text-red-500' : 'text-indigo-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${reportData.forgettingCurve?.percentRemaining || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                        <span className="absolute text-[11px] font-black text-white">{reportData.forgettingCurve?.percentRemaining || 0}%</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">{t(settings.lang, 'ai_report_memory_retention')}</span>
                                        <p className="text-[13px] font-black text-slate-200 leading-tight">
                                            {safeRender(reportData.forgettingCurve?.message)}
                                        </p>
                                    </div>
                                </div>

                                {/* CUSTOM TASKS */}
                                <div className="pt-4">
                                    <h3 className="text-amber-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                                        <Target size={16} /> {t(settings.lang, 'daily_custom_task') || "Daily Tasks"}
                                    </h3>
                                    <div className="space-y-3">
                                        {reportData.customTasks?.map((task: any, i: number) => (
                                            <div key={i} className="bg-[#1e1e2d] rounded-[24px] p-5 border border-amber-500/10 shadow-xl relative overflow-hidden group">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xs">0{i+1}</div>
                                                    <span className="text-white text-[15px] font-black tracking-tight">{safeRender(task.title)}</span>
                                                </div>
                                                <p className="text-slate-400 text-[12px] font-medium leading-relaxed italic ml-11">
                                                    {safeRender(task.description)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* NUANCE COACHING */}
                                <div className="pt-4">
                                    <h3 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                                        <Brain size={16} /> {t(settings.lang, 'nuance_coaching') || "Nuance Coaching"}
                                    </h3>
                                    <div className="space-y-4">
                                        {reportData.nuanceCoaching?.map((item: any, i: number) => (
                                            <div key={i} className="bg-[#1e1e2d] rounded-[32px] p-6 border border-white/5 shadow-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white text-lg font-black tracking-tight">{item.word}</span>
                                                    <span className="text-indigo-400 text-[11px] font-black bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">{item.meaning}</span>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
                                                    <p className="text-[12px] text-slate-300 font-bold leading-relaxed">"{item.example}"</p>
                                                    <div className="h-px bg-white/5 w-full" />
                                                    <p className="text-[11px] text-indigo-300/80 font-medium leading-normal italic">💡 {safeRender(item.coachingTip)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TARGET WORDS */}
                                <div className="pt-4">
                                    <h3 className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                                        <Sparkles size={16} /> {t(settings.lang, 'ai_report_target_voca')}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {reportData.targetWords?.map((item: any, i: number) => (
                                            <div key={i} className="bg-[#1e1e2d] rounded-[24px] p-5 border border-white/5 shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white text-lg font-black tracking-tight">{item.word}</span>
                                                        <span className="text-emerald-500/60 text-xs font-bold">{safeRender(item.translation)}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-[11px] font-medium italic">"{safeRender(item.context)}"</p>
                                                </div>
                                                {(() => {
                                                    const isSaved = (localStorage.getItem('vq_notes') ? JSON.parse(localStorage.getItem('vq_notes')!) : []).some((n: any) => (n.word) === (item.word));
                                                    return (
                                                        <button 
                                                            onClick={() => !isSaved && handleSaveToWrongNote(item)}
                                                            className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 group-active:bg-emerald-500 group-active:text-white'}`}
                                                        >
                                                            {isSaved ? <ShieldCheck size={18} /> : <ChevronRight size={18} />}
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* LEARNING_ROADMAP */}
                                <div className="bg-[#1e1e2d] rounded-[32px] p-6 border border-white/5 shadow-xl mt-4">
                                    <h3 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <LineChart size={16} /> {t(settings.lang, 'ai_report_learning_roadmap')}
                                    </h3>
                                    <div className="space-y-4">
                                        {reportData.fourWeekRoadmap?.map((week: any, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">W{week.week}</div>
                                                    {i < 3 && <div className="w-[2px] flex-1 bg-indigo-500/10" />}
                                                </div>
                                                <div className="pb-4 flex-1">
                                                    <p className="text-slate-200 text-[13px] font-black mb-1">{safeRender(week.goal)}</p>
                                                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic">{safeRender(week.action)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* CONVERSATION MODE: MAIN SUMMARY */}
                                <div className="bg-[#1e1e2d] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[6px] bg-indigo-600/50"></div>
                                    <h2 className="text-[22px] font-black text-white leading-snug tracking-tighter mb-4">
                                        {safeRender(reportData.summaryTitle)}
                                    </h2>
                                    <p className="text-slate-400 text-sm font-bold leading-relaxed">
                                        {safeRender(reportData.conversationAnalysis?.overallFeedback)}
                                    </p>
                                </div>

                                {/* STRENGTHS & WEAKNESSES (Shared UI style but different keys) */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-[#1e1e2d] rounded-[32px] p-6 border border-emerald-500/20 shadow-lg">
                                        <h3 className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Sparkles size={16} /> {t(settings.lang, 'ai_report_strengths')}
                                        </h3>
                                        <p className="text-[13px] font-bold text-slate-300 leading-snug">{safeRender(reportData.topStrength)}</p>
                                    </div>
                                    <div className="bg-[#1e1e2d] rounded-[32px] p-6 border border-red-500/20 shadow-lg">
                                        <h3 className="text-red-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Lightbulb size={16} /> {t(settings.lang, 'ai_report_weaknesses')}
                                        </h3>
                                        <p className="text-[13px] font-bold text-slate-300 leading-snug">{safeRender(reportData.criticalWeakness)}</p>
                                    </div>
                                </div>

                                {/* NATURAL EXPRESSIONS */}
                                <div className="pt-4">
                                    <h3 className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                                        <BookOpen size={16} /> {t(settings.lang, 'ai_report_natural_exp')}
                                    </h3>
                                    <div className="space-y-4">
                                        {reportData.conversationAnalysis?.powerfulExpressions?.map((exp: any, i: number) => (
                                            <div key={i} className="bg-[#1e1e2d] rounded-[32px] p-6 border border-white/5 shadow-xl space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t(settings.lang, 'ai_report_you_said')}</p>
                                                    <p className="text-slate-400 italic font-medium">"{exp.basic}"</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t(settings.lang, 'ai_report_native_like')}</p>
                                                    <p className="text-white text-lg font-black tracking-tight leading-tight">"{exp.better}"</p>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-[12px] text-slate-400 leading-relaxed relative">
                                                    {safeRender(exp.why)}
                                                    {exp.translation && <p className="mt-2 text-indigo-300/60 font-medium">({safeRender(exp.translation)})</p>}
                                                </div>
                                                {(() => {
                                                    const isSaved = (localStorage.getItem('vq_my_phrases') ? JSON.parse(localStorage.getItem('vq_my_phrases')!) : []).some((p: any) => p.english === exp.better);
                                                    return (
                                                        <button 
                                                            onClick={() => !isSaved && handleSaveToBible(exp)}
                                                            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 ${isSaved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default' : 'bg-[#312e81] text-indigo-200 border-indigo-500/30'}`}
                                                        >
                                                            {isSaved ? <><Sparkles size={16} /> {t(settings.lang, 'ai_report_saved_bible')}</> : <><BookOpen size={16} /> {t(settings.lang, 'ai_report_save_bible')}</>}
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CONVERSATION MODE: TARGET WORDS */}
                                <div className="pt-4">
                                    <h3 className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                                        <Target size={16} /> {t(settings.lang, 'ai_report_target_voca')}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {reportData.targetWords?.map((item: any, i: number) => (
                                            <div key={i} className="bg-[#1e1e2d] rounded-[24px] p-5 border border-white/5 shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white text-lg font-black tracking-tight">{item.word}</span>
                                                        <span className="text-emerald-500/60 text-xs font-bold">{safeRender(item.translation)}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-[11px] font-medium italic">"{safeRender(item.context)}"</p>
                                                </div>
                                                {(() => {
                                                    const isSaved = (localStorage.getItem('vq_notes') ? JSON.parse(localStorage.getItem('vq_notes')!) : []).some((n: any) => (n.word) === (item.word));
                                                    return (
                                                        <button 
                                                            onClick={() => !isSaved && handleSaveToWrongNote(item)}
                                                            className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 group-active:bg-emerald-500 group-active:text-white'}`}
                                                        >
                                                            {isSaved ? <ShieldCheck size={18} /> : <ChevronRight size={18} />}
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ACTION FOOTER */}
                        <div className="flex gap-3 pt-6 pb-12">
                            {mode === 'CONVERSATION' ? (
                                <button 
                                    onClick={() => {
                                        setViewMode('REVIEW');
                                        setReviewIndex(0);
                                        generateTurnExplanation(0);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                    <PlayCircle size={20} /> {t(settings.lang, 'ai_report_review_detail')}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleGenerate}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                    <Sparkles size={18} /> {t(settings.lang, 'regenerate')}
                                </button>
                            )}
                            <button onClick={() => setScreen('HOME')} className="flex-1 bg-[#1e1e2d] text-slate-300 py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition-all">
                                {t(settings.lang, 'ai_report_close')}
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'REVIEW' && activeConvLogs[reviewIndex] && (
                    <div className="p-4 space-y-6 animate-fade-in pb-20">
                        {/* ROLE & MESSAGE CARD */}
                        <div className="bg-[#1e1e2d] rounded-[32px] p-6 shadow-xl border border-white/5 relative group overflow-hidden">
                            <div className={`absolute top-0 left-0 w-[4px] h-full ${activeConvLogs[reviewIndex].role === 'user' ? 'bg-purple-500' : 'bg-indigo-500'}`} />
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeConvLogs[reviewIndex].role === 'user' ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    {activeConvLogs[reviewIndex].role === 'user' ? 'STUDENT' : 'AI TEACHER'}
                                </span>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                    <Languages size={14} />
                                </button>
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                                {activeConvLogs[reviewIndex].text}
                            </h3>
                            {activeConvLogs[reviewIndex].translation && (
                                <p className="mt-4 text-slate-500 text-sm font-medium italic">
                                    {activeConvLogs[reviewIndex].translation}
                                </p>
                            )}
                        </div>

                        {/* ROLE & MESSAGE CARD */}
                        {(() => {
                            const actualLogIndex = reportData?.selectedReviewIndices?.[reviewIndex] ?? reviewIndex;
                            const msg = activeConvLogs[actualLogIndex];
                            if (!msg) return null;
                            return (
                                <div className="bg-[#1e1e2d] rounded-[32px] p-8 border border-white/5 relative overflow-hidden shadow-2xl mb-6">
                                    <div className={`absolute top-0 left-0 w-full h-1.5 ${msg.role === 'user' ? 'bg-emerald-500/50' : 'bg-indigo-500/50'}`}></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${msg.role === 'user' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                                            {msg.role === 'user' ? <ShieldCheck size={18} className="text-emerald-400" /> : <Bot size={18} className="text-indigo-400" />}
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                                {msg.role === 'user' ? "Your Expression" : "AI Roleplay"}
                                            </p>
                                            <p className="text-white font-black text-sm italic uppercase tracking-tighter">{activeScenario?.subScSelected?.title_ko || "Conversation"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/40 p-5 rounded-[24px] border border-white/5">
                                            <p className="text-white text-lg font-bold leading-snug">"{msg.text}"</p>
                                            {msg.translation && <p className="mt-3 text-indigo-300/60 font-medium text-sm">({msg.translation})</p>}
                                        </div>
                                        <button onClick={() => handleSpeak(msg.text)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-white/5">
                                            <Volume2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="bg-[#16161D] rounded-[32px] p-6 border border-amber-500/20 shadow-xl relative animate-slide-up">
                            <div className="flex items-center gap-2 mb-4 text-amber-500">
                                <Lightbulb size={18} /> <span className="text-[11px] font-black uppercase tracking-widest">{t(settings.lang, 'ai_report_teacher_coaching')}</span>
                            </div>
                            
                            <div className="text-slate-300 text-[15px] font-bold leading-relaxed">
                                {isExplaining ? (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <span className="text-[10px] font-black text-amber-500/50 ml-2 uppercase tracking-widest">{t(settings.lang, 'ai_report_generating_advice')}</span>
                                    </div>
                                ) : (
                                    <p>{explanationCache[reportData?.selectedReviewIndices?.[reviewIndex] ?? reviewIndex] || t(settings.lang, 'ai_report_waiting_desc')}</p>
                                )}
                            </div>
                        </div>

                        {/* NAV BUTTONS */}
                        <div className="flex gap-4 pt-4">
                            <button 
                                disabled={reviewIndex === 0}
                                onClick={() => {
                                    const nextIdx = reviewIndex - 1;
                                    setReviewIndex(nextIdx);
                                    generateTurnExplanation(nextIdx);
                                }}
                                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 disabled:opacity-20 active:scale-90 transition-all">
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={() => {
                                    const nextIdx = reviewIndex + 1;
                                    const totalToReview = reportData?.selectedReviewIndices?.length || activeConvLogs.length;
                                    if (nextIdx < totalToReview) {
                                        setReviewIndex(nextIdx);
                                        generateTurnExplanation(nextIdx);
                                    } else {
                                        setViewMode('DASHBOARD');
                                        stopTTS(); 
                                    }
                                }}
                                className="flex-1 bg-indigo-600 text-white py-5 rounded-[24px] font-black text-[15px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                {reviewIndex < (reportData?.selectedReviewIndices?.length || activeConvLogs.length) - 1 ? t(settings.lang, 'ai_report_next_sentence') : t(settings.lang, 'ai_report_review_complete')}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="bg-[#1e1e2d] border border-indigo-500/30 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
                </div>
            </div>

        </div>
    );
};
