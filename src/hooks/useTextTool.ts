import { useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useStageStore } from '../stores/stageStore';
import { useActivityLogStore } from '../stores/activityLogStore';
import { useSelectors } from './useSelectors';
import { useSnapping } from './useSnapping';

export const useTextTool = () => {
    const { activeTool, activeStage } = useSelectors();
    const { addElement } = useStageStore();
    const { getSnappedPos } = useSnapping();

    const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'text' || !activeStage) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        // Don't trigger if clicking on existing shape? 
        // Actually, maybe we want to label shapes? For now just place on canvas.

        const text = window.prompt("Enter label text:", "New Label");
        if (!text) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);

        addElement(activeStage.id, {
            type: 'label',
            text,
            x: snapped.x,
            y: snapped.y,
            z: 0,
            fontSize: 24,
            color: '#e2e8f0' // Slate-200
        });
        useActivityLogStore.getState().addLog('Added text label', 'info');

    }, [activeTool, activeStage, getSnappedPos, addElement]);

    return { handleClick };
};
