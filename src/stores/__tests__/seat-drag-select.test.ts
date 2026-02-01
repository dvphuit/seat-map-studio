import { describe, it, expect, beforeEach } from 'vitest';
import { useStageStore } from '../stageStore';
import { useSeatStore } from '../seatStore';
import { useEditorStore } from '../editorStore';
import type { Seat } from '../../types';

describe('Seat Drag and Selection Tests', () => {
    const stageId = 'test-stage';
    const GRID_SIZE = 50;

    beforeEach(() => {
        // Reset stores
        useStageStore.setState({
            stages: {
                [stageId]: {
                    id: stageId,
                    name: 'Test Stage',
                    width: 1000, // 20 * 50
                    depth: 1000, // 20 * 50
                    gridColor: '#3b82f6',
                    gridDensity: GRID_SIZE,
                    snapStrength: 10,
                    defaultTier: 'Standard',
                    isVisible: true,
                    lockAspectRatio: false,
                    snapToGrid: true,
                    sectionLabel: 'Test Section',
                    elements: [],
                }
            },
            stageOrder: [stageId]
        });

        useEditorStore.setState({
            activeStageId: stageId,
            selectedSeatIds: [],
            activeTool: 'select',
            zoom: 1,
            pan: { x: 0, y: 0 },
            isPreview: false
        });
    });

    /**
     * Helper: Tạo ghế tại vị trí cụ thể
     */
    function createSeat(x: number, y: number): string {
        const { addSeat } = useSeatStore.getState();
        addSeat(stageId, {
            x,
            y,
            tier: 'Standard',
            status: 'available',
            label: `Seat-${x}-${y}`
        });

        const stage = useStageStore.getState().stages[stageId];
        const seat = stage.elements
            .filter(e => e.type === 'seat')
            .find(s => (s as Seat).x === x && (s as Seat).y === y) as Seat;

        return seat.id;
    }

    /**
     * Helper: Lấy tất cả seats
     */
    function getAllSeats(): Seat[] {
        const stage = useStageStore.getState().stages[stageId];
        return stage.elements.filter(e => e.type === 'seat') as Seat[];
    }

    /**
     * Helper: Lấy seat theo ID
     */
    function getSeatById(id: string): Seat | undefined {
        const stage = useStageStore.getState().stages[stageId];
        return stage.elements.find(e => e.id === id) as Seat | undefined;
    }

    /**
     * Helper: Select region (lasso selection)
     * Chọn tất cả seats trong vùng x1,y1 -> x2,y2
     */
    function selectRegion(x1: number, y1: number, x2: number, y2: number): string[] {
        const seats = getAllSeats();
        const selected = seats.filter(seat =>
            seat.x >= x1 && seat.x <= x2 &&
            seat.y >= y1 && seat.y <= y2
        );

        const selectedIds = selected.map(s => s.id);
        useEditorStore.getState().selectSeats(selectedIds);

        return selectedIds;
    }

    /**
     * Helper: Batch update positions (giống như drag end)
     */
    function batchMoveSeats(seatIds: string[], dx: number, dy: number) {
        const { batchUpdate } = useSeatStore.getState();
        const updates: Record<string, Partial<Seat>> = {};

        seatIds.forEach(id => {
            const seat = getSeatById(id);
            if (seat) {
                updates[id] = {
                    x: seat.x + dx,
                    y: seat.y + dy
                };
            }
        });

        batchUpdate(stageId, updates);
    }

    it('Test 1: Tạo 5 ghế gần nhau', () => {
        // Tạo 5 ghế ở vị trí (100, 100), (150, 100), (200, 100), (100, 150), (150, 150)
        const seat1 = createSeat(100, 100);
        const seat2 = createSeat(150, 100);
        const seat3 = createSeat(200, 100);
        const seat4 = createSeat(100, 150);
        const seat5 = createSeat(150, 150);

        const seats = getAllSeats();
        expect(seats.length).toBe(5);

        console.log('[Test 1] Created 5 seats:', seats.map(s => ({ id: s.id.slice(0, 8), x: s.x, y: s.y })));
    });

    it('Test 2: Select region 5 ghế', () => {
        // Tạo 5 ghế
        createSeat(100, 100);
        createSeat(150, 100);
        createSeat(200, 100);
        createSeat(100, 150);
        createSeat(150, 150);

        // Select region
        const selectedIds = selectRegion(90, 90, 210, 160);

        expect(selectedIds.length).toBe(5);
        expect(useEditorStore.getState().selectedSeatIds.length).toBe(5);

        console.log('[Test 2] Selected 5 seats:', selectedIds.map(id => id.slice(0, 8)));
    });

    it('Test 3: Move 5 ghế sang vị trí mới', () => {
        // Tạo 5 ghế
        const ids = [
            createSeat(100, 100),
            createSeat(150, 100),
            createSeat(200, 100),
            createSeat(100, 150),
            createSeat(150, 150)
        ];

        // Select all
        selectRegion(90, 90, 210, 160);

        // Move by delta (300, 200)
        batchMoveSeats(ids, 300, 200);

        // Verify new positions
        const seat1 = getSeatById(ids[0]);
        const seat2 = getSeatById(ids[1]);
        const seat3 = getSeatById(ids[2]);
        const seat4 = getSeatById(ids[3]);
        const seat5 = getSeatById(ids[4]);

        expect(seat1?.x).toBe(400);
        expect(seat1?.y).toBe(300);
        expect(seat2?.x).toBe(450);
        expect(seat2?.y).toBe(300);
        expect(seat3?.x).toBe(500);
        expect(seat3?.y).toBe(300);
        expect(seat4?.x).toBe(400);
        expect(seat4?.y).toBe(350);
        expect(seat5?.x).toBe(450);
        expect(seat5?.y).toBe(350);

        console.log('[Test 3] Moved seats to new positions:', [seat1, seat2, seat3, seat4, seat5].map(s => ({ x: s?.x, y: s?.y })));
    });

    it('Test 4: Select 5 ghế tại vị trí mới', () => {
        // Tạo 5 ghế
        const ids = [
            createSeat(100, 100),
            createSeat(150, 100),
            createSeat(200, 100),
            createSeat(100, 150),
            createSeat(150, 150)
        ];

        // Move to new position
        batchMoveSeats(ids, 300, 200);

        // Clear selection
        useEditorStore.getState().clearSelection();
        expect(useEditorStore.getState().selectedSeatIds.length).toBe(0);

        // Try to select at NEW position (400-500, 300-350)
        const selectedIds = selectRegion(390, 290, 510, 360);

        expect(selectedIds.length).toBe(5);
        expect(useEditorStore.getState().selectedSeatIds.length).toBe(5);

        console.log('[Test 4] Selected 5 seats at new position:', selectedIds.map(id => id.slice(0, 8)));

        // Verify we can't select at old position
        useEditorStore.getState().clearSelection();
        const oldPositionSelected = selectRegion(90, 90, 210, 160);
        expect(oldPositionSelected.length).toBe(0);

        console.log('[Test 4] Selecting at old position returns 0 seats (correct)');
    });

    it('Test 5: Select 3 ghế trong 5 ghế và move, kiểm tra vị trí', () => {
        // Tạo 5 ghế
        const ids = [
            createSeat(100, 100),
            createSeat(150, 100),
            createSeat(200, 100),
            createSeat(100, 150),
            createSeat(150, 150)
        ];

        // Move all to new position first
        batchMoveSeats(ids, 300, 200);

        // Select only 3 seats (the top row: 400,300 / 450,300 / 500,300)
        const selected3 = selectRegion(390, 290, 510, 310);
        expect(selected3.length).toBe(3);

        console.log('[Test 5] Selected 3 seats:', selected3.map(id => {
            const s = getSeatById(id);
            return { id: id.slice(0, 8), x: s?.x, y: s?.y };
        }));

        // Move these 3 seats by (100, 100)
        batchMoveSeats(selected3, 100, 100);

        // Verify positions of moved seats
        const movedSeats = selected3.map(id => getSeatById(id));
        expect(movedSeats[0]?.x).toBe(500); // 400 + 100
        expect(movedSeats[0]?.y).toBe(400); // 300 + 100
        expect(movedSeats[1]?.x).toBe(550); // 450 + 100
        expect(movedSeats[1]?.y).toBe(400); // 300 + 100
        expect(movedSeats[2]?.x).toBe(600); // 500 + 100
        expect(movedSeats[2]?.y).toBe(400); // 300 + 100

        console.log('[Test 5] After moving 3 seats:', movedSeats.map(s => ({ x: s?.x, y: s?.y })));

        // Verify positions of unmoved seats (should still be at 400,350 and 450,350)
        const unmovedIds = ids.filter(id => !selected3.includes(id));
        const unmovedSeats = unmovedIds.map(id => getSeatById(id));

        expect(unmovedSeats[0]?.x).toBe(400);
        expect(unmovedSeats[0]?.y).toBe(350);
        expect(unmovedSeats[1]?.x).toBe(450);
        expect(unmovedSeats[1]?.y).toBe(350);

        console.log('[Test 5] Unmoved seats remain at:', unmovedSeats.map(s => ({ x: s?.x, y: s?.y })));

        // Verify we can select the moved seats at their new position
        useEditorStore.getState().clearSelection();
        const reselected = selectRegion(490, 390, 610, 410);
        expect(reselected.length).toBe(3);

        console.log('[Test 5] Can re-select 3 moved seats at new position');
    });

    it('Test 6: Full integration test - all steps combined', () => {
        console.log('\n=== FULL INTEGRATION TEST ===\n');

        // Step 1: Create 5 seats
        console.log('Step 1: Creating 5 seats...');
        const ids = [
            createSeat(100, 100),
            createSeat(150, 100),
            createSeat(200, 100),
            createSeat(100, 150),
            createSeat(150, 150)
        ];
        expect(getAllSeats().length).toBe(5);
        console.log('✓ Created 5 seats');

        // Step 2: Select all 5
        console.log('\nStep 2: Selecting all 5 seats...');
        let selected = selectRegion(90, 90, 210, 160);
        expect(selected.length).toBe(5);
        console.log('✓ Selected 5 seats');

        // Step 3: Move all 5 to new position
        console.log('\nStep 3: Moving all 5 seats by (300, 200)...');
        batchMoveSeats(ids, 300, 200);
        const seat1After = getSeatById(ids[0]);
        expect(seat1After?.x).toBe(400);
        expect(seat1After?.y).toBe(300);
        console.log('✓ Moved all seats to new position');

        // Step 4: Can we select at new position?
        console.log('\nStep 4: Testing selection at new position...');
        useEditorStore.getState().clearSelection();
        selected = selectRegion(390, 290, 510, 360);
        expect(selected.length).toBe(5);
        console.log('✓ Can select all 5 seats at new position');

        // Step 5: Select 3 and move
        console.log('\nStep 5: Selecting 3 seats and moving...');
        useEditorStore.getState().clearSelection();
        const selected3 = selectRegion(390, 290, 510, 310);
        expect(selected3.length).toBe(3);
        batchMoveSeats(selected3, 100, 100);

        const movedSeat = getSeatById(selected3[0]);
        expect(movedSeat?.x).toBe(500);
        expect(movedSeat?.y).toBe(400);
        console.log('✓ Moved 3 seats successfully');

        // Final verification
        console.log('\nFinal verification:');
        const allSeats = getAllSeats();
        console.log('All seat positions:', allSeats.map(s => ({
            id: s.id.slice(0, 8),
            x: s.x,
            y: s.y,
            label: s.label
        })));

        expect(allSeats.length).toBe(5);
        console.log('\n✓ ALL TESTS PASSED\n');
    });
});
