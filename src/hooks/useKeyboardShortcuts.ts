import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSeatStore } from '../stores/seatStore';
import { useStageStore } from '../stores/stageStore';
import { useSelectors } from './useSelectors';
import { TOOLS } from '../constants/tools';
import type { Seat } from '../types';
import { getSeatLabel } from '../utils/labels';

const PASTE_OFFSET = 20;

export const useKeyboardShortcuts = () => {
    const { setTool, activeTool, selectedSeatIds, clearSelection, selectSeats, activeStageId, selectedShapeId } = useEditorStore();
    const { undo, redo, canUndo, canRedo, pushState } = useHistoryStore();
    const { deleteSeats, addSeats } = useSeatStore();
    const { activeStageSeats } = useSelectors();

    // Session clipboard
    const clipboardRef = useRef<Omit<Seat, 'id'>[]>([]);

    const handleToolSwitch = useCallback((e: KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        const toolMatch = TOOLS.find(t =>
            e.key.toLowerCase() === t.key || e.key === t.shortcut
        );

        if (toolMatch) {
            e.preventDefault();
            setTool(toolMatch.id);
        }
    }, [setTool]);

    const handleHistory = useCallback((e: KeyboardEvent) => {
        if (!(e.metaKey || e.ctrlKey)) return;

        const key = e.key.toLowerCase();
        if (key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                if (canRedo()) redo();
            } else {
                if (canUndo()) undo();
            }
        } else if (key === 'y') {
            e.preventDefault();
            if (canRedo()) redo();
        }
    }, [undo, redo, canUndo, canRedo]);

    const handleClipboard = useCallback((e: KeyboardEvent) => {
        if (!(e.metaKey || e.ctrlKey)) return;

        const key = e.key.toLowerCase();

        // Copy
        if (key === 'c') {
            e.preventDefault();
            if (selectedSeatIds.length > 0 && activeStageSeats) {
                const toCopy = activeStageSeats
                    .filter(s => selectedSeatIds.includes(s.id))
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map(({ id: _id, ...rest }) => rest);
                clipboardRef.current = toCopy;
            }
        }

        // Paste
        if (key === 'v') {
            e.preventDefault();
            if (clipboardRef.current.length > 0 && activeStageId) {
                pushState();
                const newSeats = clipboardRef.current.map(seat => {
                    const newX = seat.x + PASTE_OFFSET;
                    const newY = seat.y + PASTE_OFFSET;
                    return {
                        ...seat,
                        x: newX,
                        y: newY,
                        label: getSeatLabel(newX, newY)
                    };
                });
                addSeats(activeStageId, newSeats);
                // Update clipboard to allow daisy-chain pasting
                clipboardRef.current = newSeats;
            }
        }
    }, [selectedSeatIds, activeStageSeats, activeStageId, addSeats, pushState]);

    const handleDelete = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Backspace' && e.key !== 'Delete') return;
        if (!activeStageId) return;

        if (selectedSeatIds.length > 0) {
            pushState();
            deleteSeats(activeStageId, selectedSeatIds);
            clearSelection();
        } else if (selectedShapeId) {
            pushState();
            useStageStore.getState().deleteElement(activeStageId, selectedShapeId);
            clearSelection();
        }
    }, [activeStageId, selectedSeatIds, selectedShapeId, deleteSeats, clearSelection, pushState]);

    const handleSelection = useCallback((e: KeyboardEvent) => {
        // Escape
        if (e.key === 'Escape') {
            clearSelection();
            if (activeTool !== 'select') setTool('select');
        }

        // Select All (Cmd+A)
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            if (activeStageSeats) {
                selectSeats(activeStageSeats.map(s => s.id));
            }
        }
    }, [activeTool, setTool, clearSelection, activeStageSeats, selectSeats]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            handleToolSwitch(e);
            handleHistory(e);
            handleClipboard(e);
            handleDelete(e);
            handleSelection(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleToolSwitch, handleHistory, handleClipboard, handleDelete, handleSelection]);
};
