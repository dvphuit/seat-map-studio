import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../stores/editorStore';

const SCALE_BY = 1.1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

export const useCanvasZoom = () => {
    const { zoom, pan, setZoom, setPan } = useEditorStore();

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // Determine direction
        const direction = e.evt.deltaY > 0 ? -1 : 1;

        // Calculate new scale
        const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

        // Clamp scale
        if (newScale < MIN_ZOOM || newScale > MAX_ZOOM) {
            return;
        }

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setZoom(newScale);
        setPan(newPos);
    };

    return { zoom, pan, handleWheel };
};
