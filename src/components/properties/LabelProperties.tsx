import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SliderControl } from './SliderControl';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { ColorPicker } from './shared/ColorPicker';
import { DeleteButton } from './shared/DeleteButton';
import type { Label } from '../../types';

export const LabelProperties: React.FC = () => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const label = stage.elements.find(e => e.id === selectedShapeId && e.type === 'label') as Label;
    if (!label) return null;

    const handleUpdate = (updates: Partial<Label>) => {
        pushState();
        updateElement(activeStageId, label.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Content */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Content</label>
                    <textarea
                        value={label.text}
                        onChange={(e) => handleUpdate({ text: e.target.value })}
                        className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm min-h-[80px] resize-none"
                    />
                </div>

                {/* Appearance Group */}
                <Section title="Appearance" icon="palette">
                    <ColorPicker
                        label="Color"
                        value={label.color}
                        onChange={(val) => handleUpdate({ color: val })}
                    />

                    <NumberInput
                        label="Size"
                        value={label.fontSize}
                        onChange={(val) => handleUpdate({ fontSize: val })}
                        unit="px"
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Font Weight</label>
                        <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl">
                            {['normal', 'bold', 'italic'].map((weight) => (
                                <button
                                    key={weight}
                                    onClick={() => handleUpdate({ fontWeight: weight })}
                                    className={`py-1.5 rounded-lg text-xs font-medium transition-all ${(label.fontWeight || 'normal') === weight
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {weight.charAt(0).toUpperCase() + weight.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Transform */}
                <Section title="Transform" icon="transform">
                    <SliderControl
                        label="Rotation"
                        value={label.rotation || 0}
                        onChange={(val) => handleUpdate({ rotation: val })}
                        min={0}
                        max={360}
                        unit="°"
                        icon="rotate_right"
                    />
                </Section>

                {/* Actions */}
                <div className="pt-2">
                    <DeleteButton
                        onDelete={() => {
                            pushState();
                            deleteElement(activeStageId, label.id);
                        }}
                        label="Delete Label"
                    />
                </div>
            </div>
        </div>
    );
};
