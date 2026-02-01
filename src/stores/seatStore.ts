import { create } from 'zustand';
import type { Seat } from '../types';
import { useStageStore } from './stageStore';
import { useActivityLogStore } from './activityLogStore';

interface SeatActions {
    // Actions now require stageId because Seat doesn't have it anymore
    addSeat: (stageId: string, seat: Omit<Seat, 'id' | 'type' | 'z' | 'stageId'>) => void;
    addSeats: (stageId: string, seats: Omit<Seat, 'id' | 'type' | 'z' | 'stageId'>[]) => void;
    updateSeat: (stageId: string, id: string, updates: Partial<Seat>) => void;
    deleteSeat: (stageId: string, id: string) => void;
    deleteSeats: (stageId: string, ids: string[]) => void;
    moveSeat: (stageId: string, id: string, x: number, y: number) => void;
    batchUpdate: (stageId: string, updates: Record<string, Partial<Seat>>) => void;
}

// This store is now stateless effectively, acting as a collection of actions
// that manipulate the StageStore.
export const useSeatStore = create<SeatActions>(() => ({
    addSeat: (stageId, seatData) => {
        console.log('[DEBUG:DRAW_SEATS] Adding single seat', {
            stageId,
            position: { x: seatData.x, y: seatData.y },
            tier: seatData.tier,
            label: seatData.label,
            timestamp: new Date().toISOString()
        });
        useStageStore.getState().addElement(stageId, {
            ...seatData,
            type: 'seat',
            z: 0 // Default Z for seats
        });
        useActivityLogStore.getState().addLog('Added a seat', 'success');
        console.log('[DEBUG:DRAW_SEATS] Single seat added successfully');
    },

    addSeats: (stageId, seatsData) => {
        console.log('[DEBUG:DRAW_SEATS] Adding multiple seats', {
            stageId,
            count: seatsData.length,
            firstSeat: seatsData[0] ? { x: seatsData[0].x, y: seatsData[0].y, label: seatsData[0].label } : null,
            lastSeat: seatsData[seatsData.length - 1] ? {
                x: seatsData[seatsData.length - 1].x,
                y: seatsData[seatsData.length - 1].y,
                label: seatsData[seatsData.length - 1].label
            } : null,
            timestamp: new Date().toISOString()
        });
        useStageStore.getState().addElements(stageId, seatsData.map(seat => ({ ...seat, type: 'seat', z: 0 })));
        useActivityLogStore.getState().addLog(`Added ${seatsData.length} seats`, 'success');
        console.log('[DEBUG:DRAW_SEATS] Multiple seats added successfully');
    },

    updateSeat: (stageId, id, updates) => {
        useStageStore.getState().updateElement(stageId, id, updates);
    },

    deleteSeat: (stageId, id) => {
        useStageStore.getState().deleteElement(stageId, id);
        useActivityLogStore.getState().addLog('Deleted a seat', 'warning');
    },

    deleteSeats: (stageId, ids) => {
        useStageStore.getState().deleteElements(stageId, ids);
        useActivityLogStore.getState().addLog(`Deleted ${ids.length} seats`, 'warning');
    },

    moveSeat: (stageId, id, x, y) => {
        useStageStore.getState().updateElement(stageId, id, { x, y });
    },

    batchUpdate: (stageId, updates) => {
        useStageStore.getState().updateElements(stageId, updates);
    }
}));
