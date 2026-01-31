import { useRef, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSeatStore } from '../stores/seatStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSnapping } from './useSnapping';
import type { Seat } from '../types';
import { useEditorStore } from '../stores/editorStore';

export const useSeatDrag = (selectedSeatIds: string[]) => {
    const { batchUpdate } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { getSnappedPos } = useSnapping();
    const { activeStageId } = useEditorStore();

    // Store initial positions of ALL selected seats when drag starts
    const initialPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const isDraggingRef = useRef(false);

    const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>, seats: Seat[]) => {
        // Only allow drag if the target is part of the selection or if it's the only one
        const draggedSeatId = e.target.attrs.id; // Assuming we set id on Konva node
        if (!selectedSeatIds.includes(draggedSeatId)) return;

        isDraggingRef.current = true;
        pushState(); // Save state before mutation

        const positions: Record<string, { x: number; y: number }> = {};
        seats.forEach(seat => {
            if (selectedSeatIds.includes(seat.id)) {
                positions[seat.id] = { x: seat.x, y: seat.y };
            }
        });
        initialPositionsRef.current = positions;
    }, [selectedSeatIds, pushState]);

    const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
        if (!isDraggingRef.current) return;

        // Visual feedback only - actual update happens on drag end for performance
        const draggedNode = e.target;
        const draggedId = draggedNode.attrs.id;

        // Make the dragged node snap visually
        const snapped = getSnappedPos(draggedNode.x(), draggedNode.y());
        draggedNode.position(snapped);

        const initialPos = initialPositionsRef.current[draggedId];
        if (!initialPos) return;

        const dx = snapped.x - initialPos.x;
        const dy = snapped.y - initialPos.y;

        // Move other selected nodes relative to the leader
        const layer = draggedNode.getLayer();
        if (layer) {
            selectedSeatIds.forEach(id => {
                if (id === draggedId) return; // Leader already moved itself
                const node = layer.findOne(`#${id}`);
                const start = initialPositionsRef.current[id];
                if (node && start) {
                    node.position({
                        x: start.x + dx,
                        y: start.y + dy
                    });
                }
            });
        }
    }, [selectedSeatIds, getSnappedPos]);

    const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        if (!isDraggingRef.current || !activeStageId) return;
        isDraggingRef.current = false;

        const draggedNode = e.target;
        const draggedId = draggedNode.attrs.id;

        // Final snap of leader
        const currentPos = { x: draggedNode.x(), y: draggedNode.y() };
        const snapped = getSnappedPos(currentPos.x, currentPos.y);

        const initialPos = initialPositionsRef.current[draggedId];
        if (!initialPos) return;

        const dx = snapped.x - initialPos.x;
        const dy = snapped.y - initialPos.y;

        // Update Store State
        const updates: Record<string, Partial<Seat>> = {};
        selectedSeatIds.forEach(id => {
            const start = initialPositionsRef.current[id];
            if (start) {
                updates[id] = {
                    x: start.x + dx,
                    y: start.y + dy
                };
            }
        });

        batchUpdate(activeStageId, updates);
    }, [selectedSeatIds, getSnappedPos, batchUpdate, activeStageId]);

    return { handleDragStart, handleDragMove, handleDragEnd };
};
