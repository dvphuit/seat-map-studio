import { describe, it, expect, beforeEach } from 'vitest';
import { useStageStore } from '../stageStore';
import { useSeatStore } from '../seatStore';
import { useHistoryStore } from '../historyStore';
import { useActivityLogStore } from '../activityLogStore';
import type { Seat, Terrain, Label } from '../../types';

describe('SeatStudio Stores', () => {

    const defaultStageId = 'default-stage';

    beforeEach(() => {
        // Reset stores
        useStageStore.setState({
            stages: {
                [defaultStageId]: {
                    id: defaultStageId,
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
                    sectionLabel: 'Main Section',
                    elements: [],
                }
            },
            stageOrder: [defaultStageId]
        });
        useHistoryStore.setState({ past: [], future: [] });
        useActivityLogStore.setState({ logs: [] });
    });

    it('should add and update stage', () => {
        const { addStage, updateStage } = useStageStore.getState();
        const id = addStage({
            name: 'New Stage',
            width: 500,
            depth: 500,
            gridColor: '#000',
            gridDensity: 10,
            snapStrength: 5,
            defaultTier: 'VIP',
            isVisible: true,
            lockAspectRatio: true,
            snapToGrid: true,
            sectionLabel: 'New Section',
            elements: [],
        });

        expect(useStageStore.getState().stages[id]).toBeDefined();
        expect(useStageStore.getState().stages[id].name).toBe('New Stage');
        expect(useStageStore.getState().stages[id].elements).toEqual([]);

        updateStage(id, { name: 'Updated Stage' });
        expect(useStageStore.getState().stages[id].name).toBe('Updated Stage');
    });

    it('should add and update terrain and labels', () => {
        const { addElement, updateElement } = useStageStore.getState();

        // Terrain
        addElement(defaultStageId, {
            type: 'terrain',
            x: 0,
            y: 0,
            z: 0,
            points: [0, 0, 100, 0, 100, 100],
            color: 'red',
            opacity: 0.5,
            closed: true
        });

        let stage = useStageStore.getState().stages[defaultStageId];
        const terrain = stage.elements.find(e => e.type === 'terrain') as Terrain;
        expect(terrain).toBeDefined();
        expect(terrain.color).toBe('red');

        updateElement(defaultStageId, terrain.id, { color: 'blue' });
        stage = useStageStore.getState().stages[defaultStageId];
        const updatedTerrain = stage.elements.find(e => e.id === terrain.id) as Terrain;
        expect(updatedTerrain.color).toBe('blue');

        // Label
        addElement(defaultStageId, {
            type: 'label',
            text: 'Test Label',
            x: 50,
            y: 50,
            z: 0,
            fontSize: 20,
            color: 'white'
        });

        stage = useStageStore.getState().stages[defaultStageId];
        const label = stage.elements.find(e => e.type === 'label') as Label;
        expect(label).toBeDefined();
        expect(label.text).toBe('Test Label');

        updateElement(defaultStageId, label.id, { text: 'Updated Label' });
        stage = useStageStore.getState().stages[defaultStageId];
        const updatedLabel = stage.elements.find(e => e.id === label.id) as Label;
        expect(updatedLabel.text).toBe('Updated Label');
    });

    it('should add seats and update log', () => {
        const { addSeat } = useSeatStore.getState();

        // New signature: addSeat(stageId, seatData)
        // seatData no longer needs stageId
        addSeat(defaultStageId, {
            x: 10,
            y: 10,
            tier: 'Standard',
            status: 'available'
        });

        const stage = useStageStore.getState().stages[defaultStageId];
        const seat = stage.elements.find(e => e.type === 'seat') as Seat;

        expect(seat).toBeDefined();
        expect(seat.x).toBe(10);
        expect(seat.tier).toBe('Standard');

        // Check logs
        const logs = useActivityLogStore.getState().logs;
        expect(logs.length).toBeGreaterThan(0);
        expect(logs[logs.length - 1].message).toBe('Added a seat');
    });

    it('should handle undo/redo correctly', () => {
        const { pushState, undo, redo } = useHistoryStore.getState();
        const { addSeat, moveSeat } = useSeatStore.getState();

        // 1. Push state (Checkpoint 0: No seats)
        pushState();

        // 2. Add seat
        addSeat(defaultStageId, { x: 0, y: 0, tier: 'A', status: 'available' });

        let stage = useStageStore.getState().stages[defaultStageId];
        let seat = stage.elements.find(e => e.type === 'seat') as Seat;
        const seatId = seat.id;

        // 3. Push state (Checkpoint 1: One seat at 0,0)
        pushState();

        // 4. Move seat
        moveSeat(defaultStageId, seatId, 100, 100);

        stage = useStageStore.getState().stages[defaultStageId];
        seat = stage.elements.find(e => e.id === seatId) as Seat;
        expect(seat.x).toBe(100);

        // 5. Undo (Should go back to Checkpoint 1: Seat at 0,0)
        undo();
        stage = useStageStore.getState().stages[defaultStageId];
        seat = stage.elements.find(e => e.id === seatId) as Seat;
        expect(seat.x).toBe(0);

        // 6. Undo (Should go back to Checkpoint 0: No seats)
        undo();
        stage = useStageStore.getState().stages[defaultStageId];
        seat = stage.elements.find(e => e.id === seatId) as Seat;
        expect(seat).toBeUndefined();

        // 7. Redo (Should go back to Checkpoint 1: Seat at 0,0)
        redo();
        stage = useStageStore.getState().stages[defaultStageId];
        seat = stage.elements.find(e => e.id === seatId) as Seat;
        expect(seat).toBeDefined();
        expect(seat.x).toBe(0);

        // 8. Redo again (Should restore moved state)
        redo();
        stage = useStageStore.getState().stages[defaultStageId];
        seat = stage.elements.find(e => e.id === seatId) as Seat;
        expect(seat.x).toBe(100);
    });
});
