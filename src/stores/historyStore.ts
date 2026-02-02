import { create } from 'zustand';
import type { Stage } from '../types';
import { useStageStore } from './stageStore';

// Maximum number of history snapshots to keep
const MAX_HISTORY_SIZE = 50;

// Deep clone helper using structuredClone (modern browsers) or fallback
const deepClone = <T>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    // Fallback for older environments
    return JSON.parse(JSON.stringify(obj));
};

interface Snapshot {
    stages: Record<string, Stage>;
    stageOrder: string[];
}

interface HistoryState {
    past: Snapshot[];
    future: Snapshot[];

    // Actions
    pushState: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    past: [],
    future: [],

    pushState: () => {
        const stageState = useStageStore.getState();

        // Deep clone to prevent mutations from corrupting history
        const currentSnapshot: Snapshot = {
            stages: deepClone(stageState.stages),
            stageOrder: [...stageState.stageOrder],
        };

        set((state) => ({
            // Keep only the last MAX_HISTORY_SIZE snapshots
            past: [...state.past.slice(-MAX_HISTORY_SIZE + 1), currentSnapshot],
            future: [], // Clear future when new state is pushed
        }));
    },

    undo: () => {
        const { past, future } = get();
        if (past.length === 0) return;

        const previousSnapshot = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        // Capture current state to push to future (with deep clone)
        const stageState = useStageStore.getState();
        const currentSnapshot: Snapshot = {
            stages: deepClone(stageState.stages),
            stageOrder: [...stageState.stageOrder],
        };

        set({
            past: newPast,
            future: [currentSnapshot, ...future],
        });

        // Apply previous snapshot
        useStageStore.getState().setStages(previousSnapshot.stages, previousSnapshot.stageOrder);
    },

    redo: () => {
        const { past, future } = get();
        if (future.length === 0) return;

        const nextSnapshot = future[0];
        const newFuture = future.slice(1);

        // Capture current state to push to past (with deep clone)
        const stageState = useStageStore.getState();
        const currentSnapshot: Snapshot = {
            stages: deepClone(stageState.stages),
            stageOrder: [...stageState.stageOrder],
        };

        set({
            past: [...past, currentSnapshot],
            future: newFuture,
        });

        // Apply next snapshot
        useStageStore.getState().setStages(nextSnapshot.stages, nextSnapshot.stageOrder);
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    clearHistory: () => set({ past: [], future: [] }),
}));
