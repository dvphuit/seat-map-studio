import React from 'react';
import type { ActivityLogEntry } from '../../types';

interface LogEntryProps {
    entry: ActivityLogEntry;
}

export const LogEntry: React.FC<LogEntryProps> = ({ entry }) => {
    const timeString = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let dotColor = 'bg-slate-500';
    if (entry.type === 'success') dotColor = 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]';
    if (entry.type === 'warning') dotColor = 'bg-yellow-400';
    if (entry.type === 'error') dotColor = 'bg-red-400';
    if (entry.message.includes('Entered')) dotColor = 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]';

    return (
        <div className={`flex items-start gap-3 ${entry.type === 'info' ? 'opacity-60' : 'opacity-90'}`}>
            <div className={`mt-1 size-1.5 rounded-full ${dotColor}`}></div>
            <div className="flex flex-col">
                <span className="text-[11px] text-slate-300 font-medium">{entry.message}</span>
                <span className="text-[9px] text-slate-500 font-mono uppercase">{timeString} • {entry.actor}</span>
            </div>
        </div>
    );
};
