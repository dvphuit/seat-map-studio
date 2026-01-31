import React from 'react';

interface ConstraintTogglesProps {
    lockAspectRatio: boolean;
    snapToGrid: boolean;
    onChange: (key: 'lockAspectRatio' | 'snapToGrid', value: boolean) => void;
}

export const ConstraintToggles: React.FC<ConstraintTogglesProps> = ({ lockAspectRatio, snapToGrid, onChange }) => {
    return (
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Constraints</label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Lock Aspect Ratio</span>
                <input
                    type="checkbox"
                    checked={lockAspectRatio}
                    onChange={(e) => onChange('lockAspectRatio', e.target.checked)}
                    className="size-4 text-blue-500 rounded border-slate-600 bg-transparent focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Snap Seats to Grid</span>
                <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => onChange('snapToGrid', e.target.checked)}
                    className="size-4 text-blue-500 rounded border-slate-600 bg-transparent focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
            </label>
        </div>
    );
};
