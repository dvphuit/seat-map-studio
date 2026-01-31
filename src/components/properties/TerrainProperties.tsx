import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SliderControl } from './SliderControl';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { ColorPicker } from './shared/ColorPicker';
import { DeleteButton } from './shared/DeleteButton';
import type { Terrain } from '../../types';

export const TerrainProperties: React.FC = () => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const terrain = stage.elements.find(e => e.id === selectedShapeId && e.type === 'terrain') as Terrain;
    if (!terrain) return null;

    const handleUpdate = (updates: Partial<Terrain>) => {
        pushState();
        updateElement(activeStageId, terrain.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Identification */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identification</label>
                    <input
                        type="text"
                        placeholder="e.g. Stage Floor, Background Shape..."
                        value={terrain.label || ''}
                        onChange={(e) => handleUpdate({ label: e.target.value })}
                        className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                    />
                </div>

                {/* Transform Group */}
                <Section title="Transform" icon="transform">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Position X"
                            value={Math.round(terrain.x)}
                            onChange={(val) => handleUpdate({ x: val })}
                            unit="px"
                        />
                        <NumberInput
                            label="Position Y"
                            value={Math.round(terrain.y)}
                            onChange={(val) => handleUpdate({ y: val })}
                            unit="px"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Scale X"
                            value={terrain.scaleX || 1}
                            onChange={(val) => handleUpdate({ scaleX: val })}
                            step="0.1"
                        />
                        <NumberInput
                            label="Scale Y"
                            value={terrain.scaleY || 1}
                            onChange={(val) => handleUpdate({ scaleY: val })}
                            step="0.1"
                        />
                    </div>

                    <SliderControl
                        label="Rotation"
                        value={terrain.rotation || 0}
                        onChange={(val) => handleUpdate({ rotation: val })}
                        min={0}
                        max={360}
                        unit="°"
                        icon="rotate_right"
                    />
                </Section>

                {/* Appearance Group */}
                <Section title="Appearance" icon="palette">
                    <ColorPicker
                        value={terrain.color}
                        onChange={(val) => handleUpdate({ color: val })}
                    />

                    <SliderControl
                        label="Opacity"
                        value={terrain.opacity * 100}
                        onChange={(val) => handleUpdate({ opacity: val / 100 })}
                        unit="%"
                        min={0}
                        max={100}
                    />

                    <label className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 text-sm">polyline</span>
                            <span className="text-xs font-semibold text-slate-300">Closed Shape</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={terrain.closed}
                            onChange={(e) => handleUpdate({ closed: e.target.checked })}
                            className="size-4 rounded-lg accent-blue-500"
                        />
                    </label>
                </Section>

                {/* Actions */}
                <div className="pt-2">
                    <DeleteButton
                        onDelete={() => {
                            pushState();
                            deleteElement(activeStageId, terrain.id);
                        }}
                        label="Delete Terrain"
                    />
                </div>
            </div>
        </div>
    );
};
