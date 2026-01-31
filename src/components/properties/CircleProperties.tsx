import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SliderControl } from './SliderControl';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { ColorPicker } from './shared/ColorPicker';
import { DeleteButton } from './shared/DeleteButton';
import type { CircleElement } from '../../types';

export const CircleProperties: React.FC = () => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const element = stage.elements.find(e => e.id === selectedShapeId && e.type === 'circle') as CircleElement;
    if (!element) return null;

    const handleUpdate = (updates: Partial<CircleElement>) => {
        pushState();
        updateElement(activeStageId, element.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Dimensions Group */}
                <Section title="Dimensions" icon="circle">
                    <div className="space-y-2">
                        <SliderControl
                            label="Radius"
                            value={Math.round(element.radius)}
                            onChange={(val) => handleUpdate({ radius: val })}
                            min={1}
                            max={500}
                            unit="px"
                        />
                    </div>
                </Section>

                {/* Transform Group */}
                <Section title="Transform" icon="transform">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Center X"
                            value={Math.round(element.x)}
                            onChange={(val) => handleUpdate({ x: val })}
                        />
                        <NumberInput
                            label="Center Y"
                            value={Math.round(element.y)}
                            onChange={(val) => handleUpdate({ y: val })}
                        />
                    </div>
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
                        label="Delete Circle"
                    />
                </div>
            </div>
        </div>
    );
};
