import React from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    value: number | string | undefined;
    onChange: (value: number) => void;
    unit?: string;
    className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    value,
    onChange,
    unit,
    className = "",
    disabled,
    readOnly,
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={`w-full bg-white/5 border border-white/5 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 
                        ${readOnly ? 'cursor-default text-white/50' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    {...props}
                />
                {unit && (
                    <span className="absolute right-3 top-2 text-[9px] text-slate-600 font-bold uppercase pointer-events-none">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
};
