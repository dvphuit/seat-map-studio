import React from 'react';
import { Section } from './Section';
import { ColorPicker } from './ColorPicker';
import { SliderControl } from '../SliderControl';

interface AppearanceSectionProps {
    element: { fill?: string; stroke?: string; strokeWidth?: number };
    onUpdate: (updates: Partial<{ fill: string; stroke: string; strokeWidth: number }>) => void;
    showFill?: boolean;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ element, onUpdate, showFill = true }) => {
    return (
        <Section title="Appearance" icon="palette">
            {showFill && element.fill !== undefined && (
                <ColorPicker
                    label="Fill Color"
                    value={element.fill}
                    onChange={(val) => onUpdate({ fill: val })}
                    allowTransparent
                />
            )}

            {element.stroke !== undefined && (
                <ColorPicker
                    label="Stroke Color"
                    value={element.stroke}
                    onChange={(val) => onUpdate({ stroke: val })}
                />
            )}

            {element.strokeWidth !== undefined && (
                <SliderControl
                    label="Stroke Width"
                    value={element.strokeWidth}
                    onChange={(val) => onUpdate({ strokeWidth: val })}
                    min={0}
                    max={20}
                    step={1}
                    unit="px"
                />
            )}
        </Section>
    );
};
