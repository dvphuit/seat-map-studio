import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';
import { DeleteButton } from './shared/DeleteButton';
import { TransformSection } from './shared/TransformSection';
import { AppearanceSection } from './shared/AppearanceSection';
import type { RectElement } from '../../types';

export const RectProperties: React.FC = () => {
    const { activeStageId, selectedShapeId } = useEditorStore();
    const { stages, updateElement, deleteElement } = useStageStore();
    const { pushState } = useHistoryStore();

    if (!activeStageId || !selectedShapeId) return null;

    const stage = stages[activeStageId];
    if (!stage) return null;

    const element = stage.elements.find(e => e.id === selectedShapeId && e.type === 'rect') as RectElement;
    if (!element) return null;

    const handleUpdate = (updates: Partial<RectElement>) => {
        pushState();
        updateElement(activeStageId, element.id, updates);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Dimensions Group */}
                <Section title="Dimensions" icon="square_foot">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Width"
                            value={Math.round(element.width)}
                            onChange={(val) => handleUpdate({ width: val })}
                            unit="px"
                        />
                        <NumberInput
                            label="Height"
                            value={Math.round(element.height)}
                            onChange={(val) => handleUpdate({ height: val })}
                            unit="px"
                        />
                    </div>
                </Section>

                {/* Transform Group */}
                <TransformSection element={element} onUpdate={handleUpdate} />

                {/* Appearance Group */}
                <AppearanceSection element={element} onUpdate={handleUpdate} />

                {/* Actions */}
                <div className="pt-2">
                    <DeleteButton
                        onDelete={() => {
                            pushState();
                            deleteElement(activeStageId, element.id);
                        }}
                        label="Delete Rectangle"
                    />
                </div>
            </div>
        </div>
    );
};
