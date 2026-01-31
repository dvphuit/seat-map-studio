import React, { useEffect, useRef } from 'react';
import { useActivityLogStore } from '../../stores/activityLogStore';
import { LogEntry } from './LogEntry';

interface ActivityLogProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ isExpanded = false, onToggle }) => {
    const { logs } = useActivityLogStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current && isExpanded) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isExpanded]);

    return (
        <div
            className={`pointer-events-auto bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col relative ${isExpanded ? 'flex-1' : 'h-[60px] shrink-0 hover:border-white/20 cursor-pointer'}`}
            onClick={!isExpanded ? onToggle : undefined}
        >
            {/* Toggle Button (Absolute) */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                className={`absolute right-4 top-4 z-50 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 ${!isExpanded ? 'hidden' : ''}`}
            >
                <span className="material-symbols-outlined">expand_more</span>
            </button>

            {/* Collapsed Header */}
            {!isExpanded && (
                <div className="h-full px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
                        <span className="font-semibold text-slate-200 text-sm tracking-wide">Activity Log</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 text-xl">expand_less</span>
                </div>
            )}

            {/* Expanded Content */}
            <div className={`flex-1 overflow-hidden flex flex-col p-4 ${!isExpanded && 'hidden'}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">Activity Log</span>
                <div
                    ref={scrollRef}
                    className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                    {logs.length === 0 && (
                        <span className="text-xs text-slate-600 italic">No activity yet.</span>
                    )}
                    {logs.map((log) => (
                        <LogEntry key={log.id} entry={log} />
                    ))}
                </div>
            </div>
        </div>
    );
};
