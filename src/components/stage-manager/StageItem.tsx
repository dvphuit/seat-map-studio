import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import type { Stage } from '../../types';

interface StageItemProps {
    stage: Stage;
}

export const StageItem: React.FC<StageItemProps> = ({ stage }) => {
    const { activeStageId, setActiveStage } = useEditorStore();
    const { updateStage } = useStageStore();
    const { pushState } = useHistoryStore();
    const isActive = activeStageId === stage.id;

    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(stage.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleActivate = () => {
        if (!stage.isVisible) return; // Cannot activate hidden stage? Design says "Hidden" text, implying state.
        // Actually typically you can activate a hidden stage to edit it, but it might remain hidden in final view?
        // Or activating it makes it visible?
        // Let's assume activating makes it visible or allows editing.
        setActiveStage(stage.id);
    };

    const handleToggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        pushState();
        updateStage(stage.id, { isVisible: !stage.isVisible });
    };

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActive) {
            setIsEditing(true);
            setTempName(stage.name);
        }
    };

    const saveName = () => {
        if (tempName.trim() && tempName !== stage.name) {
            pushState();
            updateStage(stage.id, { name: tempName });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') saveName();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setTempName(stage.name);
        }
    };

    return (
        <div
            onClick={handleActivate}
            className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all group relative overflow-hidden w-full text-left cursor-pointer
                ${isActive
                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-white opacity-60 hover:opacity-100'
                }
            `}
        >
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
            )}

            <span className={`material-symbols-outlined ${isActive ? 'text-blue-500' : ''}`}>theater_comedy</span>

            <div className="flex flex-col items-start flex-1 min-w-0">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveName}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950 text-white text-sm font-bold border border-blue-500 rounded px-1 py-0 w-full focus:outline-none"
                    />
                ) : (
                    <span
                        className="text-sm font-bold truncate w-full"
                        onDoubleClick={startEditing}
                    >
                        {stage.name}
                    </span>
                )}

                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`size-1.5 rounded-full ${isActive ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse' : (stage.isVisible ? 'bg-slate-500' : 'bg-slate-700')}`}></span>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-green-300' : 'text-slate-500'}`}>
                        {isActive ? 'Editing' : (stage.isVisible ? 'Visible' : 'Hidden')}
                    </span>
                </div>
            </div>

            <button
                onClick={handleToggleVisibility}
                className={`
                    size-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors
                    ${isActive ? 'text-blue-500' : 'text-slate-500 opacity-0 group-hover:opacity-100'}
                `}
            >
                <span className="material-symbols-outlined text-[18px]">
                    {stage.isVisible ? 'visibility' : 'visibility_off'}
                </span>
            </button>
        </div>
    );
};
