import { useRef, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSeatStore } from '../stores/seatStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSnapping } from './useSnapping';
import type { Seat } from '../types';
import { useEditorStore } from '../stores/editorStore';
import { useSelectors } from './useSelectors';
import { GRID_SIZE } from '../constants';
import { getSeatLabel } from '../utils/labels';

export const useSeatDrag = (selectedSeatIds: string[]) => {
    const { batchUpdate } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { getSnappedPos } = useSnapping();
    const { activeStageId, setIsDraggingSeat, selectSeats } = useEditorStore();
    const { activeStage } = useSelectors();

    // Store initial positions of ALL selected seats when drag starts
    const initialPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const isDraggingRef = useRef(false);

    const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>, seats: Seat[]) => {
        const draggedSeatId = e.target.attrs.id;

        console.log('[DEBUG:MOVE_SEATS] ========== DRAG START ==========');

        let effectiveSelection = selectedSeatIds;
        if (!selectedSeatIds.includes(draggedSeatId)) {
            console.log('[DEBUG:MOVE_SEATS] 💡 Dragged seat not in selection, auto-selecting');
            selectSeats([draggedSeatId]);
            effectiveSelection = [draggedSeatId];
        }

        isDraggingRef.current = true;
        setIsDraggingSeat(true); // Prevent selection clearing
        pushState(); // Save state before mutation

        const positions: Record<string, { x: number; y: number }> = {};
        seats.forEach(seat => {
            if (effectiveSelection.includes(seat.id)) {
                positions[seat.id] = { x: seat.x, y: seat.y };
            }
        });
        initialPositionsRef.current = positions;

        console.log('[DEBUG:MOVE_SEATS] ✅ Initial positions recorded', {
            seatCount: Object.keys(positions).length,
            draggedId: draggedSeatId
        });
    }, [selectedSeatIds, pushState, selectSeats, setIsDraggingSeat]);

    const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
        if (!isDraggingRef.current) return;

        // Visual feedback only - actual update happens on drag end for performance
        const draggedNode = e.target;
        const draggedId = draggedNode.attrs.id;

        // Make the dragged node snap visually
        const snapped = getSnappedPos(draggedNode.x(), draggedNode.y());

        const initialPos = initialPositionsRef.current[draggedId];
        if (!initialPos) return;

        let dx = snapped.x - initialPos.x;
        let dy = snapped.y - initialPos.y;

        console.log('[DEBUG:MOVE_SEATS] Drag move', {
            draggedId,
            currentPos: { x: draggedNode.x(), y: draggedNode.y() },
            snappedPos: snapped,
            initialPos,
            rawDelta: { dx, dy }
        });

        // Calculate group bounds and clamp delta to prevent overlap at edges
        const positions = Object.values(initialPositionsRef.current);
        if (positions.length > 0 && activeStage) {
            const minX = Math.min(...positions.map(p => p.x));
            const maxX = Math.max(...positions.map(p => p.x));
            const minY = Math.min(...positions.map(p => p.y));
            const maxY = Math.max(...positions.map(p => p.y));

            // Stage bounds with margins
            const stageMinX = GRID_SIZE;
            const stageMaxX = activeStage.width - GRID_SIZE;
            const stageMinY = GRID_SIZE;
            const stageMaxY = activeStage.depth - GRID_SIZE;

            // Clamp dx/dy so entire group stays within bounds
            const minDx = stageMinX - minX;
            const maxDx = stageMaxX - maxX;
            const oldDx = dx;
            dx = Math.max(minDx, Math.min(dx, maxDx));

            const minDy = stageMinY - minY;
            const maxDy = stageMaxY - maxY;
            const oldDy = dy;
            dy = Math.max(minDy, Math.min(dy, maxDy));

            if (dx !== oldDx || dy !== oldDy) {
                console.log('[DEBUG:MOVE_SEATS] ⚠️  Delta clamped to bounds', {
                    groupBounds: { minX, maxX, minY, maxY },
                    stageBounds: { stageMinX, stageMaxX, stageMinY, stageMaxY },
                    clampedDelta: { dx, dy },
                    originalDelta: { dx: oldDx, dy: oldDy }
                });
            }
        }

        // Set leader position with clamped delta
        const leaderPos = { x: initialPos.x + dx, y: initialPos.y + dy };
        draggedNode.position(leaderPos);

        // Update leader label visually
        const leaderLabelNode = (draggedNode as any).findOne('.seat-label');
        if (leaderLabelNode) {
            leaderLabelNode.text(getSeatLabel(leaderPos.x, leaderPos.y));
        }

        // Move other selected nodes relative to the leader
        const layer = draggedNode.getLayer();
        if (layer) {
            Object.keys(initialPositionsRef.current).forEach(id => {
                if (id === draggedId) return; // Leader already moved
                const node = layer.findOne(`#${id}`);
                const start = initialPositionsRef.current[id];
                if (node && start) {
                    // Apply same clamped delta to followers
                    const followerPos = { x: start.x + dx, y: start.y + dy };
                    node.position(followerPos);

                    // Update follower label visually
                    const labelNode = (node as any).findOne('.seat-label');
                    if (labelNode) {
                        labelNode.text(getSeatLabel(followerPos.x, followerPos.y));
                    }
                }
            });
        }
    }, [getSnappedPos, activeStage]);

    const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        console.log('[DEBUG:MOVE_SEATS] ========== DRAG END ==========');
        console.log('[DEBUG:MOVE_SEATS] Drag ended', {
            isDragging: isDraggingRef.current,
            activeStageId,
            initialPositionIds: Object.keys(initialPositionsRef.current),
            timestamp: new Date().toISOString()
        });

        if (!isDraggingRef.current || !activeStageId) {
            console.log('[DEBUG:MOVE_SEATS] ❌ Early return - isDragging:', isDraggingRef.current, 'activeStageId:', activeStageId);
            setIsDraggingSeat(false);
            return;
        }
        isDraggingRef.current = false;
        setIsDraggingSeat(false); // Allow selection clearing again

        const draggedNode = e.target;
        const draggedId = draggedNode.attrs.id;

        // Final snap of leader
        const currentPos = { x: draggedNode.x(), y: draggedNode.y() };
        const snapped = getSnappedPos(currentPos.x, currentPos.y);

        const initialPos = initialPositionsRef.current[draggedId];
        if (!initialPos) {
            console.log('[DEBUG:MOVE_SEATS] ❌ No initial position for dragged seat:', draggedId);
            return;
        }

        let dx = snapped.x - initialPos.x;
        let dy = snapped.y - initialPos.y;

        console.log('[DEBUG:MOVE_SEATS] Raw Delta:', { dx, dy });

        // Calculate group bounds from initial positions and clamp delta
        // to prevent seats from stacking at edges
        const positions = Object.values(initialPositionsRef.current);
        if (positions.length > 0 && activeStage) {
            const minX = Math.min(...positions.map(p => p.x));
            const maxX = Math.max(...positions.map(p => p.x));
            const minY = Math.min(...positions.map(p => p.y));
            const maxY = Math.max(...positions.map(p => p.y));

            // Stage bounds with margins (same as getSnappedPos)
            const stageMinX = GRID_SIZE;
            const stageMaxX = activeStage.width - GRID_SIZE;
            const stageMinY = GRID_SIZE;
            const stageMaxY = activeStage.depth - GRID_SIZE;

            // Clamp dx so group stays within bounds
            // Left bound: minX + dx >= stageMinX => dx >= stageMinX - minX
            // Right bound: maxX + dx <= stageMaxX => dx <= stageMaxX - maxX
            const minDx = stageMinX - minX;
            const maxDx = stageMaxX - maxX;
            dx = Math.max(minDx, Math.min(dx, maxDx));

            // Clamp dy so group stays within bounds
            const minDy = stageMinY - minY;
            const maxDy = stageMaxY - maxY;
            dy = Math.max(minDy, Math.min(dy, maxDy));
        }

        console.log('[DEBUG:MOVE_SEATS] Clamped Delta:', { dx, dy });

        // Validate delta
        if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
            console.error('[DEBUG:MOVE_SEATS] ❌ Invalid delta - using 0:', { dx, dy });
            dx = 0;
            dy = 0;
        }

        // Update Store State - use initialPositionsRef keys instead of selectedSeatIds
        // because selection might be cleared during drag
        const updates: Record<string, Partial<Seat>> = {};
        Object.keys(initialPositionsRef.current).forEach(id => {
            const start = initialPositionsRef.current[id];
            if (start) {
                // Apply delta directly (already clamped above)
                const rawPos = { x: start.x + dx, y: start.y + dy };
                const finalPos = getSnappedPos(rawPos.x, rawPos.y);

                // Validate final position
                if (!Number.isFinite(finalPos.x) || !Number.isFinite(finalPos.y)) {
                    console.error('[DEBUG:MOVE_SEATS] ❌ Invalid final position for seat:', id, finalPos);
                    return; // Skip this seat
                }

                updates[id] = {
                    ...finalPos,
                    label: getSeatLabel(finalPos.x, finalPos.y)
                };
            }
        });

        console.log('[DEBUG:MOVE_SEATS] ✅ Final updates to apply', {
            updateCount: Object.keys(updates).length,
            sampleUpdates: Object.entries(updates).slice(0, 3).map(([id, pos]) => ({ id, ...pos }))
        });

        if (Object.keys(updates).length === 0) {
            console.log('[DEBUG:MOVE_SEATS] ⚠️  No valid updates, skipping batchUpdate');
        } else {
            batchUpdate(activeStageId, updates);
            console.log('[DEBUG:MOVE_SEATS] ✅ batchUpdate called successfully');
        }

        // Clear the ref after use
        initialPositionsRef.current = {};
        console.log('[DEBUG:MOVE_SEATS] ========== DRAG COMPLETE ==========');
    }, [getSnappedPos, batchUpdate, activeStageId, activeStage]);

    return { handleDragStart, handleDragMove, handleDragEnd };
};
