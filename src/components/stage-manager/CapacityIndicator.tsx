import React from 'react';
import { useSelectors } from '../../hooks/useSelectors';
import { useTierStore } from '../../stores/tierStore';
import { GRID_SIZE } from '../../constants';

export const CapacityIndicator: React.FC = () => {
    const { activeStage, activeStageSeats } = useSelectors();
    const { tiers } = useTierStore();

    if (!activeStage) return null;

    const cols = Math.max(0, Math.round(activeStage.width / GRID_SIZE) - 1);
    const rows = Math.max(0, Math.round(activeStage.depth / GRID_SIZE) - 1);
    const totalCapacity = cols * rows;

    const currentCount = activeStageSeats.length;

    // Group seats by tier to show colored segments
    const tierCounts = activeStageSeats.reduce((acc, seat) => {
        acc[seat.tier] = (acc[seat.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-4 bg-black/20 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-medium tracking-wide uppercase opacity-70">{activeStage.name} Capacity</span>
                <span className="font-mono">{currentCount} / {totalCapacity}</span>
            </div>
            <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden flex ring-1 ring-white/5">
                {tiers.map((tier) => {
                    const count = tierCounts[tier.id] || 0;
                    if (count === 0) return null;

                    const segmentWidth = (count / totalCapacity) * 100;

                    return (
                        <div
                            key={tier.id}
                            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                            style={{
                                width: `${segmentWidth}%`,
                                backgroundColor: tier.color,
                                boxShadow: `0 0 12px ${tier.color}40`
                            }}
                            title={`${tier.name}: ${count} seats`}
                        ></div>
                    );
                })}
            </div>

            {/* Optional: Legend for tiers if needed, but maybe too much for a small indicator */}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                {tiers.map(tier => {
                    const count = tierCounts[tier.id] || 0;
                    if (count === 0) return null;
                    return (
                        <div key={tier.id} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }}></div>
                            <span className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">{tier.name} ({count})</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
