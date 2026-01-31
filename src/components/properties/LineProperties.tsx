import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SliderControl } from './SliderControl';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { ColorPicker } from './shared/ColorPicker';
import { DeleteButton } from './shared/DeleteButton';
import type { ArrowElement, LineElement } from '../../types';

interface LineProps {
    type: 'arrow' | 'line';
}

export const LineProperties: React.FC<LineProps> = ({ type }) => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const element = stage.elements.find(e => e.id === selectedShapeId && e.type === type) as ArrowElement | LineElement;
    if (!element) return null;

    const handleUpdate = (updates: Partial<ArrowElement | LineElement>) => {
        pushState();
        updateElement(activeStageId, element.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Transform */}
                <Section title="Transform" icon={type === 'arrow' ? 'arrow_right_alt' : 'horizontal_rule'}>
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

                {/* Appearance */}
                <Section title="Appearance" icon="palette">
                    <ColorPicker
                        label="Stroke Color"
                        value={element.stroke}
                        onChange={(val) => handleUpdate({ stroke: val })}
                    />

                    <SliderControl
                        label="Stroke Width"
                        value={element.strokeWidth}
                        onChange={(val) => handleUpdate({ strokeWidth: val })}
                        min={1}
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
                        label={`Delete ${type === 'arrow' ? 'Arrow' : 'Line'}`}
                    />
                </div>
            </div>
        </div>
    );
};
