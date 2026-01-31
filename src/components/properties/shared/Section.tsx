import React from 'react';

interface SectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
    description?: string;
}

export const Section: React.FC<SectionProps> = ({
    title,
    icon,
    children,
    className = "",
    description
}) => {
    return (
        <div className={`bg-[#0a0f18] border border-white/5 rounded-3xl p-5 space-y-5 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-sm">{icon}</span>
                    <span className="text-xs font-semibold text-slate-300">{title}</span>
                </div>
                {description && (
                    <span className="text-[10px] text-slate-600 font-medium">{description}</span>
                )}
            </div>
            {children}
        </div>
    );
};
