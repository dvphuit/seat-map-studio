import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Tier } from '../types';
import { useActivityLogStore } from './activityLogStore';

interface TierState {
    tiers: Tier[];
    addTier: (tier: Omit<Tier, 'id'>) => string;
    updateTier: (id: string, updates: Partial<Tier>) => void;
    deleteTier: (id: string) => void;
    setTiers: (tiers: Tier[]) => void;
}

export const useTierStore = create<TierState>((set) => ({
    tiers: [
        { id: 'standard', name: 'Standard', color: '#64748b', price: 50 },
        { id: 'premium', name: 'Premium', color: '#3b82f6', price: 100 },
        { id: 'vip', name: 'VIP', color: '#f59e0b', price: 200 },
    ],

    addTier: (tierData) => {
        const id = uuidv4();
        const newTier: Tier = { ...tierData, id };
        set((state) => ({
            tiers: [...state.tiers, newTier],
        }));
        useActivityLogStore.getState().addLog(`Added seat category: ${newTier.name}`, 'success');
        return id;
    },

    updateTier: (id, updates) => {
        set((state) => ({
            tiers: state.tiers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
    },

    deleteTier: (id) => {
        set((state) => {
            const tierToDelete = state.tiers.find(t => t.id === id);
            if (tierToDelete) {
                useActivityLogStore.getState().addLog(`Deleted category: ${tierToDelete.name}`, 'warning');
            }
            return {
                tiers: state.tiers.filter((t) => t.id !== id),
            };
        });
    },

    setTiers: (tiers) => set({ tiers }),
}));
