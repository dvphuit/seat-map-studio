import React from 'react';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';

export const AddStageButton: React.FC = () => {
    const { addStage } = useStageStore();
    const { pushState } = useHistoryStore();

    const handleAddStage = () => {
        pushState();
        addStage({
            name: 'New Stage',
            width: 700,
            depth: 550,
            gridColor: '#3b82f6',
            gridDensity: 50,
            snapStrength: 10,
            defaultTier: 'Standard',
            isVisible: true,
            lockAspectRatio: false,
            snapToGrid: true,
            sectionLabel: 'New Section',
            elements: [],
        });
    };

    return (
        <button
            onClick={handleAddStage}
            className="mt-2 w-full py-2.5 border-2 border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider"
        >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Add Stage
        </button>
    );
};
