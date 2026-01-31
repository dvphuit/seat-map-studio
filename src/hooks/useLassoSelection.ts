import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../stores/editorStore';
import { useSelectors } from './useSelectors';

export const useLassoSelection = () => {
    const { activeTool, selectSeats, addToSelection } = useEditorStore();
    const { activeStageSeats } = useSelectors();

    const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const isSelectingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'select') return;

        // If clicking on stage (not on a shape), start lasso
        // Konva Stage is always the target if we click background
        // But we should check if e.target === e.target.getStage() or StageBackground
        // Actually, we usually attach this handler to the Stage.

        // Prevent if clicking on a seat (handled by Seat click)
        if (e.target.name() === 'seat') return;

        isSelectingRef.current = true;
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        startPosRef.current = { x: pointer.x, y: pointer.y };
        setSelectionBox({ x: pointer.x, y: pointer.y, width: 0, height: 0 });
    }, [activeTool]);

    const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (!isSelectingRef.current || !startPosRef.current) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const x = Math.min(startPosRef.current.x, pointer.x);
        const y = Math.min(startPosRef.current.y, pointer.y);
        const width = Math.abs(pointer.x - startPosRef.current.x);
        const height = Math.abs(pointer.y - startPosRef.current.y);

        setSelectionBox({ x, y, width, height });
    }, []);

    const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (!isSelectingRef.current || !selectionBox) return;
        isSelectingRef.current = false;

        // Calculate intersection
        const x1 = selectionBox.x;
        const y1 = selectionBox.y;
        const x2 = x1 + selectionBox.width;
        const y2 = y1 + selectionBox.height;

        const intersectedIds: string[] = [];

        if (activeStageSeats) {
            activeStageSeats.forEach(seat => {
                // Simple point-in-rect check
                // For better accuracy, we could check circle-in-rect, but center point is usually enough for UX
                if (seat.x >= x1 && seat.x <= x2 && seat.y >= y1 && seat.y <= y2) {
                    intersectedIds.push(seat.id);
                }
            });
        }

        const isShift = e.evt.shiftKey;
        if (isShift) {
            addToSelection(intersectedIds);
        } else {
            selectSeats(intersectedIds);
        }

        setSelectionBox(null);
        startPosRef.current = null;
    }, [selectionBox, activeStageSeats, selectSeats, addToSelection]);

    return {
        selectionBox,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
};
