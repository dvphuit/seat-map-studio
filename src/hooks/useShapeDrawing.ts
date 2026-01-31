import { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../stores/editorStore';
import { useStageStore } from '../stores/stageStore';
import type { RectElement, CircleElement, StarElement, ArrowElement, LineElement } from '../types';

/** Discriminated union for drawing preview - allows proper type narrowing */
export type DrawingShape =
    | (Partial<RectElement> & { type: 'rect' })
    | (Partial<CircleElement> & { type: 'circle' })
    | (Partial<StarElement> & { type: 'star' })
    | (Partial<ArrowElement> & { type: 'arrow' })
    | (Partial<LineElement> & { type: 'line' });

// --- Constants & Helpers ---

const MIN_SHAPE_SIZE = 5;
const DEFAULT_STROKE = '#3b82f6';
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_FILL = 'transparent';

const createBaseShape = (x: number, y: number) => ({
    x, y, z: 0, rotation: 0, scaleX: 1, scaleY: 1
});

const createInitialShape = (tool: string, x: number, y: number): DrawingShape | null => {
    const base = createBaseShape(x, y);
    const commonStyle = { fill: DEFAULT_FILL, stroke: DEFAULT_STROKE, strokeWidth: DEFAULT_STROKE_WIDTH };
    const lineStyle = { stroke: DEFAULT_STROKE, strokeWidth: DEFAULT_STROKE_WIDTH };

    switch (tool) {
        case 'rect':
            return { ...base, ...commonStyle, type: 'rect', width: 0, height: 0 };
        case 'circle':
            return { ...base, ...commonStyle, type: 'circle', radius: 0 };
        case 'star':
            return { ...base, ...commonStyle, type: 'star', numPoints: 5, innerRadius: 0, outerRadius: 0 };
        case 'arrow':
            return { ...base, ...lineStyle, type: 'arrow', points: [0, 0, 0, 0] };
        case 'line':
            return { ...base, ...lineStyle, type: 'line', points: [0, 0, 0, 0] };
        default:
            return null;
    }
};

const updateShapeGeometry = (shape: DrawingShape, dx: number, dy: number): DrawingShape => {
    switch (shape.type) {
        case 'rect':
            return { ...shape, width: dx, height: dy };
        case 'circle': {
            const radius = Math.sqrt(dx * dx + dy * dy);
            return { ...shape, radius };
        }
        case 'star': {
            const radius = Math.sqrt(dx * dx + dy * dy);
            return { ...shape, outerRadius: radius, innerRadius: radius / 2 };
        }
        case 'arrow':
        case 'line':
            return { ...shape, points: [0, 0, dx, dy] };
        default:
            return shape;
    }
};

const isValidShape = (shape: DrawingShape): boolean => {
    switch (shape.type) {
        case 'rect':
            return Math.abs(shape.width || 0) >= MIN_SHAPE_SIZE || Math.abs(shape.height || 0) >= MIN_SHAPE_SIZE;
        case 'circle':
            return (shape.radius || 0) >= MIN_SHAPE_SIZE;
        case 'star':
            return (shape.outerRadius || 0) >= MIN_SHAPE_SIZE;
        case 'arrow':
        case 'line': {
            const pts = shape.points || [0, 0, 0, 0];
            const dist = Math.sqrt(Math.pow(pts[2] - pts[0], 2) + Math.pow(pts[3] - pts[1], 2));
            return dist >= MIN_SHAPE_SIZE;
        }
        default:
            return false;
    }
};

// --- Hook Implementation ---

export const useShapeDrawing = () => {
    const { activeTool, activeStageId } = useEditorStore();
    const { addElement } = useStageStore();

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [drawingShape, setDrawingShape] = useState<DrawingShape | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const getPointerPos = (e: KonvaEventObject<any>) => {
        const stage = e.target.getStage();
        if (!stage) return { x: 0, y: 0 };
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        return transform.point(stage.getPointerPosition() || { x: 0, y: 0 });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const handleMouseDown = useCallback((e: KonvaEventObject<any>) => {
        if (!['rect', 'circle', 'star', 'arrow', 'line'].includes(activeTool)) return;

        const pos = getPointerPos(e);
        setStartPos(pos);
        setIsDrawing(true);

        const newShape = createInitialShape(activeTool, pos.x, pos.y);
        if (newShape) {
            setDrawingShape(newShape);
        }
    }, [activeTool]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const handleMouseMove = useCallback((e: KonvaEventObject<any>) => {
        if (!isDrawing || !drawingShape) return;

        const currentPos = getPointerPos(e);
        const dx = currentPos.x - startPos.x;
        const dy = currentPos.y - startPos.y;

        setDrawingShape(prev => prev ? updateShapeGeometry(prev, dx, dy) : null);
    }, [isDrawing, drawingShape, startPos]);

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !drawingShape || !activeStageId) return;

        if (isValidShape(drawingShape)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Store addElement has loose Omit types
            addElement(activeStageId, drawingShape as any);
        }

        setIsDrawing(false);
        setDrawingShape(null);
    }, [isDrawing, drawingShape, activeStageId, addElement]);

    return {
        drawingShape,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
};
