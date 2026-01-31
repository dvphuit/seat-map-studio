import React from 'react';

const DEFAULT_PRESETS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#6366f1', // indigo
    '#ec4899', // pink
    '#94a3b8', // slate
    '#1e293b', // dark
    '#ffffff', // white
    '#000000'  // black
];

interface ColorPickerProps {
    label?: string;
    value: string;
    onChange: (color: string) => void;
    presets?: string[];
    allowTransparent?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    label = "Fill Color",
    value,
    onChange,
    presets = DEFAULT_PRESETS,
    allowTransparent = false
}) => {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <input
                        type="color"
                        value={value === 'transparent' ? '#ffffff' : value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                        disabled={value === 'transparent'}
                    />
                    {value === 'transparent' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-800">
                            <span className="material-symbols-outlined text-white/50 text-lg">block</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 grid grid-cols-5 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                    {allowTransparent && (
                        <button
                            onClick={() => onChange('transparent')}
                            title="Transparent"
                            className={`h-6 rounded-lg border border-white/5 transition-all hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-slate-800
                                ${value === 'transparent' ? 'ring-1 ring-white/50' : ''}
                            `}
                        >
                            <span className="material-symbols-outlined text-[10px] text-slate-400">block</span>
                        </button>
                    )}
                    {presets.map(c => (
                        <button
                            key={c}
                            onClick={() => onChange(c)}
                            className={`h-6 rounded-lg border transition-all hover:scale-110 active:scale-90 shadow-sm
                                ${value === c ? 'border-white ring-1 ring-white/20' : 'border-white/5'}
                            `}
                            style={{ backgroundColor: c }}
                            title={c}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
