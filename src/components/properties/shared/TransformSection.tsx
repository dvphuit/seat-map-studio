import React from 'react';
import { Section } from './Section';
import { NumberInput } from './NumberInput';
import { SliderControl } from '../SliderControl';

interface TransformSectionProps {
    element: { x: number; y: number; rotation?: number };
    onUpdate: (updates: Partial<{ x: number; y: number; rotation: number }>) => void;
}

export const TransformSection: React.FC<TransformSectionProps> = ({ element, onUpdate }) => {
    return (
        <Section title="Transform" icon="transform">
            <div className="grid grid-cols-2 gap-4">
                <NumberInput
                    label="X"
                    value={Math.round(element.x)}
                    onChange={(val) => onUpdate({ x: val })}
                    unit="px"
                />
                <NumberInput
                    label="Y"
                    value={Math.round(element.y)}
                    onChange={(val) => onUpdate({ y: val })}
                    unit="px"
                />
            </div>

            {element.rotation !== undefined && (
                <SliderControl
                    label="Rotation"
                    value={element.rotation}
                    onChange={(val) => onUpdate({ rotation: val })}
                    min={0}
                    max={360}
                    unit="°"
                    icon="rotate_right"
                />
            )}
        </Section>
    );
};
