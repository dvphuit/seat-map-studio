import React from 'react';
import type { EditorState } from '../../types';

interface ToolButtonProps {
    tool: EditorState['activeTool'];
    icon: string;
    isActive: boolean;
    onClick: () => void;
    isDestructive?: boolean;
    shortcut?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ tool, icon, isActive, onClick, isDestructive, shortcut }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick();
        e.currentTarget.blur(); // Remove focus immediately after click
    };

    return (
        <button
            onClick={handleClick}
            className={`
                w-full h-10 flex items-center justify-center rounded-lg transition-all relative
                outline-none focus:outline-none focus:ring-0 focus:ring-offset-0
                ${isActive
                    ? 'bg-white/10 text-white shadow-inner translate-y-[1px]'
                    : 'hover:bg-white/5 text-slate-400'
                }
                ${isDestructive ? 'hover:bg-red-500/10 text-red-400/70 hover:text-red-400' : ''}
            `}
            title={`${tool} (${shortcut})`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            {shortcut && (
                <span className="absolute top-1 right-1 text-[8px] font-bold text-slate-500/80 leading-none">
                    {shortcut}
                </span>
            )}
        </button>
    );
};
