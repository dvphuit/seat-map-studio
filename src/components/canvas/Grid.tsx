import React, { useMemo } from 'react';
import { Group, Line } from 'react-konva';
import { useSelectors } from '../../hooks/useSelectors';

export const Grid: React.FC = () => {
    const { activeStage } = useSelectors();

    const gridLines = useMemo(() => {
        if (!activeStage || !activeStage.isVisible) return null;

        const { width, depth, gridDensity, gridColor } = activeStage;
        // Safety check to avoid infinite loop with 0 or negative density
        const safeDensity = Math.max(10, gridDensity);
        const lines = [];

        // Vertical lines
        for (let x = 0; x <= width; x += safeDensity) {
            lines.push(
                <Line
                    key={`v-${x}`}
                    points={[x, 0, x, depth]}
                    stroke={gridColor}
                    strokeWidth={1}
                    listening={false}
                    opacity={0.2}
                />
            );
        }

        // Horizontal lines
        for (let y = 0; y <= depth; y += safeDensity) {
            lines.push(
                <Line
                    key={`h-${y}`}
                    points={[0, y, width, y]}
                    stroke={gridColor}
                    strokeWidth={1}
                    listening={false}
                    opacity={0.2}
                />
            );
        }

        return lines;
    }, [activeStage]);

    if (!activeStage) return null;

    // Render grid only if we have lines
    return <Group listening={false}>{gridLines}</Group>;
};
