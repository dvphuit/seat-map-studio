import React from 'react';

interface DeleteButtonProps {
    onDelete: () => void;
    label?: string;
    className?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
    onDelete,
    label = "Delete",
    className = ""
}) => {
    return (
        <button
            onClick={onDelete}
            className={`w-full flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-3.5 rounded-2xl font-bold text-xs hover:bg-rose-500/20 transition-all active:scale-95 ${className}`}
        >
            <span className="material-symbols-outlined text-lg">delete</span>
            {label}
        </button>
    );
};
