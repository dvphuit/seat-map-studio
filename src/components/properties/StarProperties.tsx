import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SliderControl } from './SliderControl';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { ColorPicker } from './shared/ColorPicker';
import { DeleteButton } from './shared/DeleteButton';
import type { StarElement } from '../../types';

export const StarProperties: React.FC = () => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const element = stage.elements.find(e => e.id === selectedShapeId && e.type === 'star') as StarElement;
    if (!element) return null;

    const handleUpdate = (updates: Partial<StarElement>) => {
        pushState();
        updateElement(activeStageId, element.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Dimensions Group */}
                <Section title="Dimensions" icon="star">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Inner Radius"
                            value={Math.round(element.innerRadius)}
                            onChange={(val) => handleUpdate({ innerRadius: val })}
                            unit="px"
                        />
                        <NumberInput
                            label="Outer Radius"
                            value={Math.round(element.outerRadius)}
                            onChange={(val) => handleUpdate({ outerRadius: val })}
                            unit="px"
                        />
                    </div>

                    <SliderControl
                        label="Points"
                        value={element.numPoints}
                        onChange={(val) => handleUpdate({ numPoints: val })}
                        min={3}
                        max={12}
                        step={1}
                    />
                </Section>

                {/* Transform Group */}
                <Section title="Transform" icon="transform">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="X"
                            value={Math.round(element.x)}
                            onChange={(val) => handleUpdate({ x: val })}
                        />
                        <NumberInput
                            label="Y"
                            value={Math.round(element.y)}
                            onChange={(val) => handleUpdate({ y: val })}
                        />
                    </div>

                    <SliderControl
                        label="Rotation"
                        value={element.rotation || 0}
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
                        label="Fill Color"
                        value={element.fill}
                        onChange={(val) => handleUpdate({ fill: val })}
                        allowTransparent
                    />

                    <ColorPicker
                        label="Stroke Color"
                        value={element.stroke}
                        onChange={(val) => handleUpdate({ stroke: val })}
                    />

                    <SliderControl
                        label="Stroke Width"
                        value={element.strokeWidth}
                        onChange={(val) => handleUpdate({ strokeWidth: val })}
                        min={0}
                        max={20}
                        step={1}
                        unit="px"
                    />
                </Section>

                {/* Actions */}
                <div className="pt-2">
                    <DeleteButton
                        onDelete={() => {
                            pushState();
                            deleteElement(activeStageId, element.id);
                        }}
                        label="Delete Star"
                    />
                </div>
            </div>
        </div>
    );
};
