import { useCallback } from 'react';
import { useSelectors } from './useSelectors';
import { GRID_SIZE } from '../constants';

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
            const density = GRID_SIZE; // Fixed grid size
            return Math.round(val / density) * density;
        },
        [activeStage]
    );

    const getSnappedPos = useCallback(
        (x: number, y: number) => {
            const snapped = {
                x: snapToGrid(x),
                y: snapToGrid(y),
            };

            if (!activeStage) return snapped;

            // Enforce margin to prevent sitting on border (0 or width)
            // Valid range is [GRID_SIZE, width - GRID_SIZE]
            // e.g. for width 500 (1000px): margin 50, valid [50, 450]
            const min = GRID_SIZE;
            const maxX = activeStage.width - GRID_SIZE;
            const maxY = activeStage.depth - GRID_SIZE;

            return {
                x: Math.max(min, Math.min(snapped.x, maxX)),
                y: Math.max(min, Math.min(snapped.y, maxY)),
            };
        },
        [snapToGrid, activeStage]
    );

    return { snapToGrid, getSnappedPos, clampToStage };
};
