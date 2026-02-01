import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSeatStore } from '../stores/seatStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSelectors } from './useSelectors';
import { useSnapping } from './useSnapping';

const SEAT_DETECTION_TOLERANCE = 5;

export const useSeatPaint = () => {
    const { activeTool, activeStage, activeStageSeats, defaultTierId } = useSelectors();
    const { addSeat, deleteSeat } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { getSnappedPos } = useSnapping();

    const [isPainting, setIsPainting] = useState(false);
    const [paintMode, setPaintMode] = useState<'add' | 'erase' | null>(null);
    const touchedPosRef = useRef<Set<string>>(new Set());

    const checkSeatAt = useCallback((x: number, y: number) => {
        // Small threshold because of floating point math, though grid snap should be exact
        return activeStageSeats.find(s => Math.abs(s.x - x) < SEAT_DETECTION_TOLERANCE && Math.abs(s.y - y) < SEAT_DETECTION_TOLERANCE);
    }, [activeStageSeats]);

    const handlePaintAction = useCallback((e: KonvaEventObject<MouseEvent>, currentModeOverride?: 'add' | 'erase') => {
        if (activeTool !== 'seat:paint' || !activeStage) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);

        // Anti-flicker: Don't process the same cell twice in one stroke
        const posKey = `${Math.round(snapped.x)},${Math.round(snapped.y)}`;
        if (touchedPosRef.current.has(posKey)) return;

        const existingSeat = checkSeatAt(snapped.x, snapped.y);

        // Determine mode if it's the start of the action
        let mode = currentModeOverride || paintMode;

        if (mode === 'add' && !existingSeat) {
            touchedPosRef.current.add(posKey);
            addSeat(activeStage.id, {
                x: snapped.x,
                y: snapped.y,
                tier: defaultTierId,
                status: 'available',
                label: '' // Labels usually come later or auto-gen
            });
        } else if (mode === 'erase' && existingSeat) {
            touchedPosRef.current.add(posKey);
            deleteSeat(activeStage.id, existingSeat.id);
        }
    }, [activeTool, activeStage, getSnappedPos, checkSeatAt, addSeat, deleteSeat, paintMode]);

    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'seat:paint' || !activeStage) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);
        const existingSeat = checkSeatAt(snapped.x, snapped.y);

        const initialMode = existingSeat ? 'erase' : 'add';

        setIsPainting(true);
        setPaintMode(initialMode);
        touchedPosRef.current.clear();
        pushState(); // Save state at the start of the stroke

        handlePaintAction(e, initialMode);
    }, [activeTool, activeStage, getSnappedPos, checkSeatAt, handlePaintAction, pushState]);

    const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (!isPainting || activeTool !== 'seat:paint') return;
        handlePaintAction(e);
    }, [isPainting, activeTool, handlePaintAction]);

    const handleMouseUp = useCallback(() => {
        setIsPainting(false);
        setPaintMode(null);
        touchedPosRef.current.clear();
    }, []);

    return { handleMouseDown, handleMouseMove, handleMouseUp, isPainting };
};
