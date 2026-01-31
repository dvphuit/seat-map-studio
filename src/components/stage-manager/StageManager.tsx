import React from 'react';
import { useStageStore } from '../../stores/stageStore';
import { StageItem } from './StageItem';
import { AddStageButton } from './AddStageButton';
import { CapacityIndicator } from './CapacityIndicator';

export const StageManager: React.FC = () => {
    const { stages, stageOrder } = useStageStore();

    return (
        <div className="bg-slate-glass backdrop-blur-3xl border border-white/10 rounded-2xl flex flex-col shadow-glass overflow-hidden h-full">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Stage Manager</span>
                <button className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                </button>
            </div>

            <div className="p-2 flex flex-col gap-1 overflow-y-auto flex-1">
                {stageOrder.map((stageId) => {
                    const stage = stages[stageId];
                    if (!stage) return null;
                    return <StageItem key={stageId} stage={stage} />;
                })}
                <AddStageButton />
            </div>

            <CapacityIndicator />
        </div>
    );
};
