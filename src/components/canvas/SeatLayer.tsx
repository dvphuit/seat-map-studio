import React from 'react';
import { Group } from 'react-konva';
import { useSelectors } from '../../hooks/useSelectors';
import { useSelection } from '../../hooks/useSelection';
import { useSeatDrag } from '../../hooks/useSeatDrag';
import { Seat } from './Seat';
import { useSeatStore } from '../../stores/seatStore';
import { useEditorStore } from '../../stores/editorStore';
import { useHistoryStore } from '../../stores/historyStore';

interface SeatLayerProps {
    isPanning?: boolean;
}

export const SeatLayer: React.FC<SeatLayerProps> = ({ isPanning = false }) => {
    const { activeStageSeats, activeTool } = useSelectors();
    const { deleteSeat } = useSeatStore();
    const { activeStageId } = useEditorStore();

    // Hooks
    const { selectedSeatIds, handleSelection } = useSelection();

    const { handleDragStart, handleDragMove, handleDragEnd } = useSeatDrag(selectedSeatIds);

    const isSelectTool = activeTool === 'select';
    const isDeleteMode = activeTool === 'delete';

    if (!activeStageSeats || activeStageSeats.length === 0) return null;

    return (
        <Group>
            {activeStageSeats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);

                return (
                    <Seat
                        key={seat.id}
                        seat={seat}
                        isSelected={isSelected}
                        isDraggable={isSelectTool}
                        isDeleteMode={isDeleteMode}
                        onSelect={handleSelection}
                        onDelete={(id) => {
                            if (activeStageId) {
                                useHistoryStore.getState().pushState();
                                deleteSeat(activeStageId, id);
                            }
                        }}
                        onDragStart={(e) => handleDragStart(e, activeStageSeats)}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        listening={!isPanning}
                    />
                );
            })}
        </Group>
    );
};
