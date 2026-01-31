import React, { useRef } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useHistoryStore } from '../../stores/historyStore';
import { exportToJSON } from '../../utils/export';
import { importFromJSON } from '../../utils/import';
import { exportToPNG } from '../../utils/exportPNG';

export const Header: React.FC = () => {
    const { zoom, setZoom, isPreview, togglePreview } = useEditorStore();
    const { undo, redo, past, future } = useHistoryStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 4));
    const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.25));

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await importFromJSON(file);
            // Reset input so the same file can be selected again
            event.target.value = '';
        }
    };

    return (
        <header className="relative z-50 flex items-center justify-between px-8 py-4 pointer-events-none">
            {/* Logo Section */}
            <div className="pointer-events-auto flex items-center gap-4 bg-slate-glass backdrop-blur-3xl border border-white/10 rounded-2xl p-2 pr-6 shadow-glass">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined">center_focus_strong</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-white text-sm font-semibold tracking-wide uppercase leading-tight">Seat Creator</h1>
                    <span className="text-[10px] text-slate-400 font-light tracking-widest uppercase">Single Stage Focus</span>
                </div>
            </div>

            {/* Toolbar: Undo/Redo & Zoom */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-glass backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-glass">
                <div className="flex items-center px-1">
                    <button
                        onClick={undo}
                        disabled={past.length === 0}
                        title="Undo (Ctrl+Z)"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">undo</span>
                    </button>
                    <button
                        onClick={redo}
                        disabled={future.length === 0}
                        title="Redo (Ctrl+Shift+Z)"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">redo</span>
                    </button>
                </div>

                <div className="w-px h-5 bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                    </button>
                    <span className="text-xs font-mono text-slate-400 w-10 text-center select-none">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        title="Zoom In"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="pointer-events-auto flex gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />

                {/* Export/Import Group */}
                <div className="flex items-center gap-1 bg-slate-glass backdrop-blur-3xl border border-white/10 p-1 rounded-2xl shadow-glass">
                    <button
                        onClick={handleImportClick}
                        title="Import JSON"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">upload</span>
                    </button>
                    <button
                        onClick={exportToJSON}
                        title="Export JSON"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 transition-all border-r border-white/5 pr-1 rounded-r-none"
                    >
                        <span className="material-symbols-outlined text-[20px]">data_object</span>
                    </button>
                    <button
                        onClick={exportToPNG}
                        title="Export Image (PNG)"
                        className="size-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-300 transition-all rounded-l-none pl-1"
                    >
                        <span className="material-symbols-outlined text-[20px]">image</span>
                    </button>
                </div>

                <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>

                <button
                    onClick={togglePreview}
                    className={`${isPreview ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/40' : 'bg-slate-glass hover:bg-white/5 text-white shadow-glass'} backdrop-blur-3xl border border-white/10 text-sm font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2`}
                >
                    <span className="material-symbols-outlined text-[18px]">{isPreview ? 'edit' : 'visibility'}</span>
                    <span>{isPreview ? 'Edit' : 'Preview'}</span>
                </button>
                <button className="bg-primary hover:bg-blue-500 active:scale-95 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/40 flex items-center gap-2">
                    <span>Save Project</span>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                </button>
            </div>
        </header>
    );
};


