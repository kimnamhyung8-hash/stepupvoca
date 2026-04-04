import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { HeartCrack } from 'lucide-react';
import { getBrowserLanguage, t } from '../i18n';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMsg: string;
}

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMsg: "" };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, errorMsg: error.message };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            let lang = getBrowserLanguage();
            try {
                const saved = localStorage.getItem('vq_settings');
                if (saved) lang = JSON.parse(saved).lang || lang;
            } catch (e) { }
            return (
                <div className="screen bg-[#0A0A0E] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative z-20">
                    <HeartCrack size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <h1 className="text-2xl font-black text-white mb-2 tracking-tight">{t(lang, "error_occurred")}</h1>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-xs break-all">
                        (Log: {this.state.errorMsg || 'Unknown error'})<br /><br />
                        {t(lang, "error_desc")}
                    </p>
                    <button onClick={() => window.location.reload()}
 className="three-d-btn bg-blue-600 text-white w-full max-w-xs py-4 rounded-xl font-bold flex items-center justify-center shadow-[0_4px_20px_rgba(37,99,235,0.4)]">
                        {t(lang, "reload")}
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
