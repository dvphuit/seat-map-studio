import { create } from 'zustand';
import type { EditorState, StageElement } from '../types';
import { useStageStore } from './stageStore';
import { useActivityLogStore } from './activityLogStore';

interface EditorStore extends EditorState {
    setActiveStage: (id: string | null) => void;
    setTool: (tool: EditorState['activeTool']) => void;
    selectSeats: (ids: string[]) => void;
    addToSelection: (ids: string[]) => void;
    removeFromSelection: (ids: string[]) => void;
    clearSelection: () => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    togglePreview: () => void;
    selectShape: (id: string | null, type: StageElement['type'] | null) => void;
    // Flags to prevent selection clearing during drag/lasso operations
    isDraggingSeat: boolean;
    setIsDraggingSeat: (isDragging: boolean) => void;
    isLassoSelecting: boolean;
    setIsLassoSelecting: (isSelecting: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
    activeStageId: 'default-stage',
    activeTool: 'select',
    selectedSeatIds: [],
    selectedShapeId: null,
    selectedShapeType: null,
    zoom: 1,
    pan: { x: 280, y: 120 },
    isPreview: false,
    isDraggingSeat: false,
    isLassoSelecting: false,

    setActiveStage: (id) => {
        set({ activeStageId: id, selectedSeatIds: [], selectedShapeId: null, selectedShapeType: null });
        if (id) {
            const stage = useStageStore.getState().stages[id];
            if (stage) {
                useActivityLogStore.getState().addLog(`Entered stage: ${stage.name}`, 'info', 'system');
            }
        }
    },
    setTool: (tool) => set({ activeTool: tool, selectedShapeId: null, selectedShapeType: null }),
    selectSeats: (ids) => {
        console.log('[DEBUG:SELECT_REGION] Selecting seats', {
            seatIds: ids,
            count: ids.length,
            timestamp: new Date().toISOString()
        });
        set({ selectedSeatIds: ids, selectedShapeId: null, selectedShapeType: null });
    },
    addToSelection: (ids) =>
        set((state) => {
            const newSelection = [...new Set([...state.selectedSeatIds, ...ids])];
            console.log('[DEBUG:SELECT_REGION] Adding to selection', {
                addedIds: ids,
                addedCount: ids.length,
                previousCount: state.selectedSeatIds.length,
                newCount: newSelection.length,
                timestamp: new Date().toISOString()
            });
            return {
                selectedSeatIds: newSelection,
                selectedShapeId: null,
                selectedShapeType: null
            };
        }),
    removeFromSelection: (ids) =>
        set((state) => ({
            selectedSeatIds: state.selectedSeatIds.filter((id) => !ids.includes(id)),
        })),
    clearSelection: () => {
        console.log('[DEBUG:SELECT_REGION] Clearing selection', {
            timestamp: new Date().toISOString()
        });
        set({ selectedSeatIds: [], selectedShapeId: null, selectedShapeType: null });
    },
    setZoom: (zoom) => set({ zoom }),
    setPan: (pan) => set({ pan }),
    togglePreview: () => set((state) => ({ isPreview: !state.isPreview })),
    selectShape: (id, type) => set({ selectedShapeId: id, selectedShapeType: type, selectedSeatIds: [] }),
    setIsDraggingSeat: (isDragging) => set({ isDraggingSeat: isDragging }),
    setIsLassoSelecting: (isSelecting) => set({ isLassoSelecting: isSelecting }),
}));
