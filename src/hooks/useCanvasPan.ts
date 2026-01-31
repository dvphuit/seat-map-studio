import { useState, useEffect, useMemo } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../stores/editorStore';

export const useCanvasPan = () => {
    const { setPan, activeTool } = useEditorStore();
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isMiddleMouseDown, setIsMiddleMouseDown] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) {
                // Only prevent default if we're not typing in an input
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsSpacePressed(true);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 1) { // Middle mouse button
                setIsMiddleMouseDown(true);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 1) {
                setIsMiddleMouseDown(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Compute isDraggable directly - no setState needed, avoids cascading renders
    const isDraggable = useMemo(
        () => isSpacePressed || isMiddleMouseDown || activeTool === 'pan',
        [isSpacePressed, isMiddleMouseDown, activeTool]
    );

    // Update cursor based on panning state
    useEffect(() => {
        document.body.style.cursor = isDraggable ? 'grab' : 'default';
    }, [isDraggable]);

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        if (e.target !== e.target.getStage()) return;
        document.body.style.cursor = 'grabbing';
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        if (e.target !== e.target.getStage()) return;

        document.body.style.cursor = isDraggable ? 'grab' : 'default';

        setPan({
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    return {
        isDraggable,
        handleDragStart,
        handleDragEnd,
    };
};
