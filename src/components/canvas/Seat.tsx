import React, { useRef } from 'react';
import { Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Seat as SeatType } from '../../types';
import Konva from 'konva';

import { useTierStore } from '../../stores/tierStore';
import { useSnapping } from '../../hooks/useSnapping';

interface SeatProps {
    seat: SeatType;
    isSelected: boolean;
    isDraggable: boolean;
    isDeleteMode: boolean;
    onSelect: (id: string, isMulti: boolean) => void;
    listening?: boolean;
    onDelete?: (id: string) => void;
    onDragStart?: (e: KonvaEventObject<DragEvent>) => void;
    onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
}

export const Seat: React.FC<SeatProps> = React.memo(({
    seat,
    isSelected,
    isDraggable,
    isDeleteMode,
    onSelect,
    listening,
    onDelete,
    onDragStart,
    onDragMove,
    onDragEnd
}) => {
    const seatRef = useRef<Konva.Circle>(null);
    const tiers = useTierStore(state => state.tiers);
    const { getSnappedPos } = useSnapping();
    const tier = tiers.find(t => t.id === seat.tier);
    const tierColor = tier?.color || '#64748b';

    // Determine visuals based on state
    const fill = isSelected ? '#3b82f6' : tierColor;
    const stroke = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.1)';
    const shadowBlur = isSelected ? 15 : 2;
    const shadowColor = isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0,0,0,0.3)';
    const scale = isSelected ? 1.2 : 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (e: KonvaEventObject<any>) => {
        e.cancelBubble = true; // Prevent stage click

        if (isDeleteMode && onDelete) {
            onDelete(seat.id);
            return;
        }

        const isMulti = e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey;
        onSelect(seat.id, isMulti);
    };

    const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = isDeleteMode ? 'no-drop' : 'pointer';

        // Hover effect
        e.target.to({
            scaleX: isSelected ? 1.2 : 1.1,
            scaleY: isSelected ? 1.2 : 1.1,
            fill: isDeleteMode ? '#ef4444' : (isSelected ? '#3b82f6' : '#475569'), // red-500 if delete
            duration: 0.1,
        });
    };

    const handleMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'default';

        // Reset
        e.target.to({
            scaleX: scale,
            scaleY: scale,
            fill: fill,
            duration: 0.1,
        });
    };

    return (
        <Circle
            ref={seatRef}
            id={seat.id} // Important for drag logic
            x={seat.x}
            y={seat.y}
            radius={14} // Standard radius
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected ? 2 : 1}
            shadowColor={shadowColor}
            shadowBlur={shadowBlur}
            shadowOffset={{ x: 0, y: 2 }}
            scaleX={scale}
            scaleY={scale}
            draggable={isDraggable}
            dragBoundFunc={(pos) => {
                const stage = seatRef.current?.getStage();
                if (!stage) return pos;

                // Transform absolute position to stage-relative position
                const transform = stage.getAbsoluteTransform().copy().invert();
                const localPos = transform.point(pos);

                // Snap AND Clamp using central helper
                const snappedLocal = getSnappedPos(localPos.x, localPos.y);

                // Transform back to absolute screen coordinates for Konva
                return stage.getAbsoluteTransform().point(snappedLocal);
            }}
            listening={listening}
            onClick={handleClick}
            onTap={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            perfectDrawEnabled={false} // Optimization
        />
    );
});
