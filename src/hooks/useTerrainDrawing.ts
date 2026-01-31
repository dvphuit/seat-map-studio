import { useCallback, useState, useEffect } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useStageStore } from '../stores/stageStore';
import { useActivityLogStore } from '../stores/activityLogStore';
import { useSelectors } from './useSelectors';
import { useSnapping } from './useSnapping';

export const useTerrainDrawing = () => {
    const { activeTool, activeStage } = useSelectors();
    const { addElement } = useStageStore();
    const { getSnappedPos } = useSnapping();

    const [points, setPoints] = useState<number[]>([]);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

    // Reset when tool changes
    useEffect(() => {
        if (activeTool !== 'terrain') {
            setPoints([]);
            setCursorPos(null);
        }
    }, [activeTool]);

    const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'terrain') return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        // Snap cursor for drawing
        const snapped = getSnappedPos(pointer.x, pointer.y);
        setCursorPos(snapped);
    }, [activeTool, getSnappedPos]);

    const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'terrain' || !activeStage) return;

        // Prevent default selections
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);

        // Check if closing loop (near first point)
        if (points.length >= 4) { // At least 2 points (2 coords each = 4 numbers)
            const firstX = points[0];
            const firstY = points[1];
            const dist = Math.sqrt(Math.pow(snapped.x - firstX, 2) + Math.pow(snapped.y - firstY, 2));

            if (dist < 20) {
                // Close loop
                finishDrawing();
                return;
            }
        }

        setPoints(prev => [...prev, snapped.x, snapped.y]);
    }, [activeTool, activeStage, points, getSnappedPos]);

    const finishDrawing = useCallback(() => {
        if (!activeStage || points.length < 6) { // Need at least 3 points
            setPoints([]);
            return;
        }

        addElement(activeStage.id, {
            type: 'terrain',
            x: 0,
            y: 0,
            z: 0,
            points: points,
            color: '#3b82f6', // Default primary color
            opacity: 0.2,
            closed: true
        });
        useActivityLogStore.getState().addLog('Added terrain to stage', 'info');

        setPoints([]);
    }, [activeStage, points, addElement]);

    // Handle Enter/Esc
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeTool !== 'terrain') return;

            if (e.key === 'Enter') {
                finishDrawing();
            } else if (e.key === 'Escape') {
                setPoints([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTool, finishDrawing]);

    return {
        drawingPoints: points,
        drawingCursor: cursorPos,
        handleMouseMove,
        handleClick
    };
};
