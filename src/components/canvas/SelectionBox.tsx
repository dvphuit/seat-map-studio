import React from 'react';
import { Rect } from 'react-konva';

// Placeholder for interactions logic (Phase 05)
interface SelectionBoxProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
    x = 0, y = 0, width = 0, height = 0, visible = false
}) => {
    if (!visible) return null;

    return (
        <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(59, 130, 246, 0.1)" // blue-500 with opacity
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[4, 2]}
            listening={false}
        />
    );
};
