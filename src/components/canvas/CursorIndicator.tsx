import React from 'react';

interface CursorIndicatorProps {
    x: number;
    y: number;
}

export const CursorIndicator: React.FC<CursorIndicatorProps> = ({ x, y }) => {
    return (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono pointer-events-none z-50 backdrop-blur-md shadow-lg flex items-center gap-3">
            <span className="flex items-center gap-1.5">
                <span className="text-slate-500">X</span>
                <span className="text-white font-medium min-w-[30px]">{Math.round(x)}</span>
            </span>
            <div className="w-px h-3 bg-white/10"></div>
            <span className="flex items-center gap-1.5">
                <span className="text-slate-500">Y</span>
                <span className="text-white font-medium min-w-[30px]">{Math.round(y)}</span>
            </span>
        </div>
    );
};
