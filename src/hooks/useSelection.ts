import { useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';

export const useSelection = () => {
    const {
        selectedSeatIds,
        selectSeats,
        addToSelection,
        removeFromSelection,
        clearSelection
    } = useEditorStore();

    const handleSelection = useCallback(
        (id: string, isMulti: boolean) => {
            if (isMulti) {
                if (selectedSeatIds.includes(id)) {
                    removeFromSelection([id]);
                } else {
                    addToSelection([id]);
                }
            } else {
                // If clicking an already selected seat without Shift, keep selection AS IS
                // unless it is the ONLY selected item (optimization)
                // Actually, standard behavior: clicking a selected item in a group selects ONLY that item
                // UNLESS we are about to drag. But drag logic is separate.
                // For simple click:
                selectSeats([id]);
            }
        },
        [selectedSeatIds, selectSeats, addToSelection, removeFromSelection]
    );

    const deselectAll = useCallback(() => {
        clearSelection();
    }, [clearSelection]);

    return {
        selectedSeatIds,
        handleSelection,
        deselectAll
    };
};
