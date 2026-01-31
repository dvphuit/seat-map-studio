import React from 'react';

interface SliderControlProps {
    label?: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    icon?: string;
    className?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
    label, value, onChange, min = 0, max = 100, step = 1, unit, icon, className
}) => {
    return (
        <div className={className}>
            {label && <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">{label}</label>}
            <div className="flex items-center gap-4">
                {icon && <span className="material-symbols-outlined text-slate-500 text-[16px]">{icon}</span>}

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />

                {unit ? (
                    <span className="text-xs font-mono text-white bg-white/5 px-2 py-1 rounded w-12 text-center">{value}{unit}</span>
                ) : (
                    <span className="material-symbols-outlined text-blue-500 text-[16px]">save_alt</span>
                )}
            </div>
        </div>
    );
};
