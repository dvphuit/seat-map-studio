import { useStageStore } from '../stores/stageStore';
import { useEditorStore } from '../stores/editorStore';
import { useMemo } from 'react';
import type { Seat } from '../types';

export const useSelectors = () => {
    const stages = useStageStore((state) => state.stages);

    const activeStageId = useEditorStore((state) => state.activeStageId);
    const selectedSeatIds = useEditorStore((state) => state.selectedSeatIds);

    const activeStage = useMemo(() => {
        return activeStageId ? stages[activeStageId] : null;
    }, [stages, activeStageId]);

    const activeStageSeats = useMemo(() => {
        if (!activeStage) return [];
        return activeStage.elements.filter((el): el is Seat => el.type === 'seat');
    }, [activeStage]);

    const selectedSeats = useMemo(() => {
        if (!activeStage) return [];
        // Map selectedSeatIds to actual Seat objects found in activeStage.elements
        return activeStage.elements.filter((el): el is Seat =>
            el.type === 'seat' && selectedSeatIds.includes(el.id)
        );
    }, [activeStage, selectedSeatIds]);

    const activeTool = useEditorStore((state) => state.activeTool);

    return {
        activeStage,
        activeStageSeats,
        selectedSeats,
        selectedSeatIds,
        activeTool,
    };
};
