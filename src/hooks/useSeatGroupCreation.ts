import { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSeatStore } from '../stores/seatStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSelectors } from './useSelectors';
import { useSnapping } from './useSnapping';
import type { Seat } from '../types';

const SEAT_SPACING = 40; // Center to center distance

export const useSeatGroupCreation = () => {
    const { activeTool, activeStage } = useSelectors();
    const { addSeats } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { getSnappedPos } = useSnapping();

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [previewSeats, setPreviewSeats] = useState<Partial<Seat>[]>([]);

    const getPointerPos = (e: KonvaEventObject<any>) => {
        const stage = e.target.getStage();
        if (!stage) return { x: 0, y: 0 };
        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return { x: 0, y: 0 };
        return getSnappedPos(pointer.x, pointer.y);
    };

    const calculateSeats = useCallback((currentPos: { x: number; y: number }, tool: string) => {
        const seats: Partial<Seat>[] = [];
        const dx = currentPos.x - startPos.x;
        const dy = currentPos.y - startPos.y;

        if (tool === 'seat:line') {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const count = Math.max(1, Math.floor(distance / SEAT_SPACING) + 1);

            for (let i = 0; i < count; i++) {
                const ratio = count === 1 ? 0 : i / (count - 1);
                seats.push({
                    x: startPos.x + dx * ratio,
                    y: startPos.y + dy * ratio,
                    status: 'available',
                });
            }
        } else if (tool === 'seat:region') {
            const rows = Math.max(1, Math.floor(Math.abs(dy) / SEAT_SPACING) + 1);
            const cols = Math.max(1, Math.floor(Math.abs(dx) / SEAT_SPACING) + 1);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    seats.push({
                        x: startPos.x + (dx >= 0 ? 1 : -1) * c * SEAT_SPACING,
                        y: startPos.y + (dy >= 0 ? 1 : -1) * r * SEAT_SPACING,
                        status: 'available',
                    });
                }
            }
        }

        return seats;
    }, [startPos]);

    const handleMouseDown = useCallback((e: KonvaEventObject<any>) => {
        if (!['seat:line', 'seat:region'].includes(activeTool)) return;

        const pos = getPointerPos(e);
        setStartPos(pos);
        setIsDrawing(true);
        setPreviewSeats([{ x: pos.x, y: pos.y, status: 'available' }]);
    }, [activeTool]);

    const handleMouseMove = useCallback((e: KonvaEventObject<any>) => {
        if (!isDrawing) return;
        const currentPos = getPointerPos(e);
        const seats = calculateSeats(currentPos, activeTool);
        setPreviewSeats(seats);
    }, [isDrawing, activeTool, calculateSeats]);

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !activeStage) return;

        if (previewSeats.length > 0) {
            pushState();
            addSeats(activeStage.id, previewSeats.map(s => ({
                ...s,
                tier: activeStage.defaultTier,
                label: 'New' // Placeholder
            }) as Omit<Seat, 'id' | 'type' | 'z' | 'stageId'>));
        }

        setIsDrawing(false);
        setPreviewSeats([]);
    }, [isDrawing, previewSeats, activeStage, addSeats, pushState]);

    return {
        previewSeats,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        isDrawing
    };
};
