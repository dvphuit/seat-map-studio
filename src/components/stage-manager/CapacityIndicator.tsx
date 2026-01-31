import React from 'react';
import { useSelectors } from '../../hooks/useSelectors';

export const CapacityIndicator: React.FC = () => {
    const { activeStage, activeStageSeats } = useSelectors();

    if (!activeStage) return null;

    const totalCapacity = 500; // Hardcoded limit for now or config
    const currentCount = activeStageSeats.length;
    const percentage = Math.min((currentCount / totalCapacity) * 100, 100);

    return (
        <div className="p-4 bg-black/20 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>{activeStage.name} Capacity</span>
                <span>{currentCount}/{totalCapacity}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};
