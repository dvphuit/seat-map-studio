import { create } from 'zustand';
import type { ActivityLogEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ActivityLogState {
    logs: ActivityLogEntry[];
    addLog: (message: string, type?: ActivityLogEntry['type'], actor?: ActivityLogEntry['actor']) => void;
    clearLogs: () => void;
}

export const useActivityLogStore = create<ActivityLogState>((set) => ({
    logs: [],

    addLog: (message, type = 'info', actor = 'user') =>
        set((state) => ({
            logs: [
                ...state.logs,
                {
                    id: uuidv4(),
                    message,
                    timestamp: Date.now(),
                    type,
                    actor,
                },
            ],
        })),

    clearLogs: () => set({ logs: [] }),
}));
