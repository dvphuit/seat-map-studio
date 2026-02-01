import { useCallback, useState } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSeatStore } from '../stores/seatStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSelectors } from './useSelectors';
import { useSnapping } from './useSnapping';
import { useActivityLogStore } from '../stores/activityLogStore';

export const useSeatCreation = () => {
    const { activeTool, activeStage, defaultTierId } = useSelectors();
    const { addSeat, deleteSeat } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { getSnappedPos } = useSnapping();
    const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

    const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'seat:single') {
            if (ghostPos) setGhostPos(null);
            return;
        }

        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);
        setGhostPos(snapped);
    }, [activeTool, getSnappedPos, ghostPos]);

    const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (activeTool !== 'seat:single' || !activeStage) return;

        const stage = e.target.getStage();
        if (!stage) return;

        // Don't create if dragged (lasso check handled elsewhere, but draw usually just clicks)
        // Check if we clicked on valid area? (StageBackground check implies e.target is stage or background)
        // If we clicked on an existing seat, maybe don't add? 
        if (e.target.name() === 'seat') return;

        pushState(); // Save state before adding

        const pointer = stage.getRelativePointerPosition();
        if (!pointer) return;

        const snapped = getSnappedPos(pointer.x, pointer.y);

        // Check for collision with existing seats
        const collidingSeat = activeStage.elements.find(el =>
            el.type === 'seat' &&
            Math.abs(el.x - snapped.x) < 25 && // Half grid size tolerance
            Math.abs(el.y - snapped.y) < 25
        );

        if (collidingSeat) {
            deleteSeat(activeStage.id, collidingSeat.id);
            useActivityLogStore.getState().addLog('Overwrote existing seat', 'info');
        }

        addSeat(activeStage.id, {
            x: snapped.x,
            y: snapped.y,
            tier: defaultTierId,
            status: 'available',
            label: 'A-1' // Placeholder label logic
        });
    }, [activeTool, activeStage, getSnappedPos, addSeat]);

    return { ghostPos, handleMouseMove, handleMouseUp };
};
