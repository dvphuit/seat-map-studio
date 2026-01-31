import { create } from 'zustand';
import type { Stage, StageElement } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useActivityLogStore } from './activityLogStore';

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

interface StageState {
    stages: Record<string, Stage>;
    stageOrder: string[];
    addStage: (stage: Omit<Stage, 'id' | 'elements'> & { elements?: StageElement[] }) => string;
    updateStage: (id: string, updates: Partial<Stage>) => void;
    deleteStage: (id: string) => void;
    reorderStages: (newOrder: string[]) => void;
    setStages: (stages: Record<string, Stage>, order: string[]) => void;

    // Generic Element Actions
    addElement: (stageId: string, element: DistributiveOmit<StageElement, 'id'>) => void;
    addElements: (stageId: string, elements: DistributiveOmit<StageElement, 'id'>[]) => void;
    updateElement: (stageId: string, elementId: string, updates: Partial<StageElement>) => void;
    updateElements: (stageId: string, updates: Record<string, Partial<StageElement>>) => void;
    deleteElement: (stageId: string, elementId: string) => void;
    deleteElements: (stageId: string, elementIds: string[]) => void;


}

export const useStageStore = create<StageState>((set) => ({
    stages: {
        'default-stage': {
            id: 'default-stage',
            name: 'Main Stage',
            width: 700,
            depth: 550,
            gridColor: '#3b82f6',
            gridDensity: 50,
            snapStrength: 10,
            defaultTier: 'Standard',
            isVisible: true,
            lockAspectRatio: false,
            snapToGrid: true,
            sectionLabel: 'Orchestra Section',
            elements: [],
        },
    },
    stageOrder: ['default-stage'],

    addStage: (stageData) => {
        const id = uuidv4();
        const newStage: Stage = {
            ...stageData,
            id,
            elements: stageData.elements || [],
        };
        set((state) => ({
            stages: { ...state.stages, [id]: newStage },
            stageOrder: [...state.stageOrder, id],
        }));
        useActivityLogStore.getState().addLog(`Added stage: ${newStage.name}`, 'success');
        return id;
    },

    updateStage: (id, updates) => {
        set((state) => {
            if (!state.stages[id]) return state;
            const stage = state.stages[id];

            if (updates.width !== undefined || updates.depth !== undefined) {
                useActivityLogStore.getState().addLog(`Resized stage: ${stage.name} to ${updates.width ?? stage.width}x${updates.depth ?? stage.depth}`, 'info');
            } else if (updates.gridColor !== undefined || updates.gridDensity !== undefined) {
                useActivityLogStore.getState().addLog(`Updated grid settings for ${stage.name}`, 'info');
            } else if (updates.name !== undefined) {
                useActivityLogStore.getState().addLog(`Renamed stage to: ${updates.name}`, 'info');
            } else {
                useActivityLogStore.getState().addLog(`Updated stage: ${stage.name}`, 'info');
            }

            return {
                stages: {
                    ...state.stages,
                    [id]: { ...state.stages[id], ...updates },
                },
            };
        });
    },

    deleteStage: (id) => {
        const stageName = useStageStore.getState().stages[id]?.name;
        set((state) => {
            const { [id]: _, ...remainingStages } = state.stages;
            return {
                stages: remainingStages,
                stageOrder: state.stageOrder.filter((stageId) => stageId !== id),
            };
        });
        if (stageName) useActivityLogStore.getState().addLog(`Deleted stage: ${stageName}`, 'warning');
    },

    reorderStages: (newOrder) => set({ stageOrder: newOrder }),

    setStages: (stages, order) => set({ stages, stageOrder: order }),

    // Generic Element Actions
    addElement: (stageId, elementData) => {
        const id = uuidv4();
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: [...stage.elements, { ...elementData, id } as StageElement]
                    }
                }
            };
        });
    },

    addElements: (stageId, elementsData) => {
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            const newElements = elementsData.map(e => ({ ...e, id: uuidv4() } as StageElement));
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: [...stage.elements, ...newElements]
                    }
                }
            };
        });
    },

    updateElement: (stageId, elementId, updates) => {
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: stage.elements.map(e => e.id === elementId ? { ...e, ...updates } as StageElement : e)
                    }
                }
            };
        });
    },

    updateElements: (stageId, updates) => {
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: stage.elements.map(e => updates[e.id] ? { ...e, ...updates[e.id] } as StageElement : e)
                    }
                }
            };
        });
    },

    deleteElement: (stageId, elementId) => {
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: stage.elements.filter(e => e.id !== elementId)
                    }
                }
            };
        });
    },

    deleteElements: (stageId, elementIds) => {
        set((state) => {
            const stage = state.stages[stageId];
            if (!stage) return state;
            const idsToDelete = new Set(elementIds);
            return {
                stages: {
                    ...state.stages,
                    [stageId]: {
                        ...stage,
                        elements: stage.elements.filter(e => !idsToDelete.has(e.id))
                    }
                }
            };
        });
    },


}));
