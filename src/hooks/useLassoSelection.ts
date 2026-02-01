import { useState, useCallback, useRef, useEffect } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../stores/editorStore';
import { useSelectors } from './useSelectors';

export const useLassoSelection = () => {
    const { activeTool, selectSeats, addToSelection, setIsDraggingSeat } = useEditorStore();
    const { activeStageSeats } = useSelectors();

    const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const isSelectingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    // Use a ref for selectionBox to access current value in events without closure issues
    const selectionBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'select') return;
        if (e.target.name() === 'seat') return;

        console.log('[DEBUG:SELECT_REGION] Starting lasso selection');

        isSelectingRef.current = true;
        setIsDraggingSeat(true); // Reuse this flag to prevent Click-to-clear
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const box = { x: pointer.x, y: pointer.y, width: 0, height: 0 };
        startPosRef.current = { x: pointer.x, y: pointer.y };
        selectionBoxRef.current = box;
        setSelectionBox(box);
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

        const box = { x, y, width, height };
        selectionBoxRef.current = box;
        setSelectionBox(box);
    }, []);

    const finishSelection = useCallback((isShift: boolean) => {
        // Guard against double execution
        if (!isSelectingRef.current) return;
        isSelectingRef.current = false;

        const currentBox = selectionBoxRef.current;
        if (!currentBox) {
            console.log('[DEBUG:SELECT_REGION] Finishing selection - No box to process');
        } else {
            console.log('[DEBUG:SELECT_REGION] Completing lasso selection', { currentBox });

            const x1 = currentBox.x;
            const y1 = currentBox.y;
            const x2 = x1 + currentBox.width;
            const y2 = y1 + currentBox.height;

            const intersectedIds: string[] = [];
            if (activeStageSeats) {
                activeStageSeats.forEach(seat => {
                    if (seat.x >= x1 && seat.x <= x2 && seat.y >= y1 && seat.y <= y2) {
                        intersectedIds.push(seat.id);
                    }
                });
            }

            console.log('[DEBUG:SELECT_REGION] Lasso selection found seats', {
                count: intersectedIds.length,
                seatIds: intersectedIds
            });

            if (isShift) {
                addToSelection(intersectedIds);
            } else {
                selectSeats(intersectedIds);
            }
        }

        // Cleanup
        selectionBoxRef.current = null;
        startPosRef.current = null;
        setSelectionBox(null);

        // Small delay to ensure handleStageClick (which happens after mouseup) 
        // also sees the flag as true, then we reset it.
        setTimeout(() => {
            setIsDraggingSeat(false);
        }, 50);
    }, [activeStageSeats, selectSeats, addToSelection, setIsDraggingSeat]);

    const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
        finishSelection(e.evt.shiftKey);
    }, [finishSelection]);

    useEffect(() => {
        const handleGlobalMouseUp = (e: MouseEvent) => {
            if (isSelectingRef.current) {
                console.log('[DEBUG:SELECT_REGION] Global mouseup cleanup');
                finishSelection(e.shiftKey);
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [finishSelection]);

    return {
        selectionBox,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
};
