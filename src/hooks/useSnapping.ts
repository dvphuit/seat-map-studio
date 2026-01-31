import { useCallback } from 'react';
import { useSelectors } from './useSelectors';

export const useSnapping = () => {
    const { activeStage } = useSelectors();

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
            return {
                x: snapToGrid(x),
                y: snapToGrid(y),
            };
        },
        [snapToGrid]
    );

    return { snapToGrid, getSnappedPos };
};
