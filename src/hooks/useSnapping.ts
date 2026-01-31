import { useCallback } from 'react';
import { useSelectors } from './useSelectors';

export const useSnapping = () => {
    const { activeStage } = useSelectors();

    const clampToStage = useCallback(
        (x: number, y: number) => {
            if (!activeStage) return { x, y };
            return {
                x: Math.max(0, Math.min(x, activeStage.width)),
                y: Math.max(0, Math.min(y, activeStage.depth)),
            };
        },
        [activeStage]
    );

    const snapToGrid = useCallback(
        (val: number) => {
            if (!activeStage || !activeStage.snapToGrid) return val;
            const density = activeStage.gridDensity;
            return Math.round(val / density) * density;
        },
        [activeStage]
    );

    const getSnappedPos = useCallback(
        (x: number, y: number) => {
            const clamped = clampToStage(x, y);
            return {
                x: snapToGrid(clamped.x),
                y: snapToGrid(clamped.y),
            };
        },
        [snapToGrid, clampToStage]
    );

    return { snapToGrid, getSnappedPos, clampToStage };
};
