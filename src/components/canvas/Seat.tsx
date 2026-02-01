import React, { useRef, useEffect } from 'react';
import { Circle, Group, Text } from 'react-konva';
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

    // Sync Konva node when selection state changes to prevent animation artifacts
    useEffect(() => {
        if (seatRef.current) {
            seatRef.current.to({
                fill: fill,
                scaleX: scale,
                scaleY: scale,
                stroke: stroke,
                strokeWidth: isSelected ? 2 : 1,
                shadowBlur: shadowBlur,
                duration: 0.1,
            });
        }
    }, [isSelected, fill, scale, stroke, shadowBlur]);

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

    const radius = 14;

    return (
        <Group
            id={seat.id}
            x={seat.x}
            y={seat.y}
            draggable={isDraggable}
            dragBoundFunc={(pos) => {
                const stage = seatRef.current?.getStage();
                if (!stage) return pos;
                const transform = stage.getAbsoluteTransform().copy().invert();
                const localPos = transform.point(pos);
                const snappedLocal = getSnappedPos(localPos.x, localPos.y);
                return stage.getAbsoluteTransform().point(snappedLocal);
            }}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onClick={handleClick}
            onTap={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Circle
                ref={seatRef}
                x={0}
                y={0}
                radius={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : 1}
                shadowColor={shadowColor}
                shadowBlur={shadowBlur}
                shadowOffset={{ x: 0, y: 2 }}
                scaleX={scale}
                scaleY={scale}
                listening={listening}
                perfectDrawEnabled={false}
            />
            {seat.label && (
                <Text
                    name="seat-label"
                    text={seat.label}
                    x={-radius}
                    y={-radius + 1}
                    width={radius * 2}
                    height={radius * 2}
                    fontSize={8}
                    fontStyle="bold"
                    fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                    fontFamily="Inter, sans-serif"
                />
            )}
        </Group>
    );
});
