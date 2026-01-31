import React, { useRef, useEffect, useCallback } from 'react';
import { Rect, Circle, Star, Arrow, Line, Transformer } from 'react-konva';
import Konva from 'konva';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import type { RectElement, CircleElement, StarElement, ArrowElement, LineElement, StageElement } from '../../types';
import { useSnapping } from '../../hooks/useSnapping';

interface ShapeItemProps {
    shape: RectElement | CircleElement | StarElement | ArrowElement | LineElement;
    isSelected: boolean;
    activeStageId: string;
    activeTool: string;
    selectShape: (id: string, type: StageElement['type']) => void;
    isPanning: boolean;
}

export const ShapeItem: React.FC<ShapeItemProps> = ({
    shape,
    isSelected,
    activeStageId,
    activeTool,
    selectShape,
    isPanning
}) => {
    const shapeRef = useRef<Konva.Shape | Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);

    const { getSnappedPos } = useSnapping();

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const snapped = getSnappedPos(e.target.x(), e.target.y());
        useStageStore.getState().updateElement(activeStageId, shape.id, {
            x: snapped.x,
            y: snapped.y,
        });
    }, [activeStageId, shape.id, getSnappedPos]);

    const handleTransformEnd = () => {
        if (shapeRef.current) {
            const node = shapeRef.current;
            const updates: Partial<StageElement> = {
                x: node.x(),
                y: node.y(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                rotation: node.rotation(),
            };

            useStageStore.getState().updateElement(activeStageId, shape.id, updates);
        }
    };

    const commonProps = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva ref typing is complex
        ref: shapeRef as React.RefObject<any>,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        scaleX: shape.scaleX,
        scaleY: shape.scaleY,
        draggable: activeTool === 'select',
        dragBoundFunc: (pos: { x: number; y: number }) => {
            const stage = shapeRef.current?.getStage();
            if (!stage) return pos;

            const transform = stage.getAbsoluteTransform().copy().invert();
            const localPos = transform.point(pos);
            const snappedLocal = getSnappedPos(localPos.x, localPos.y);
            return stage.getAbsoluteTransform().point(snappedLocal);
        },
        onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (activeTool === 'select') {
                e.cancelBubble = true;
                selectShape(shape.id, shape.type);
            } else if (activeTool === 'delete') {
                e.cancelBubble = true;
                useHistoryStore.getState().pushState();
                useStageStore.getState().deleteElement(activeStageId, shape.id);
            }
        },
        onTap: (e: Konva.KonvaEventObject<Event>) => {
            if (activeTool === 'select') {
                e.cancelBubble = true;
                selectShape(shape.id, shape.type);
            } else if (activeTool === 'delete') {
                e.cancelBubble = true;
                useHistoryStore.getState().pushState();
                useStageStore.getState().deleteElement(activeStageId, shape.id);
            }
        },
        onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (activeTool === 'delete') {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'no-drop';
            } else if (activeTool === 'select') {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'move';
            }
        },
        onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'default';
        },
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
        listening: !isPanning
    };

    const renderSpecificShape = () => {
        switch (shape.type) {
            case 'rect': {
                const r = shape as RectElement;
                return (
                    <Rect
                        {...commonProps}
                        width={r.width}
                        height={r.height}
                        fill={r.fill}
                        stroke={r.stroke}
                        strokeWidth={r.strokeWidth}
                        strokeScaleEnabled={false}
                    />
                );
            }
            case 'circle': {
                const c = shape as CircleElement;
                return (
                    <Circle
                        {...commonProps}
                        radius={c.radius}
                        fill={c.fill}
                        stroke={c.stroke}
                        strokeWidth={c.strokeWidth}
                        strokeScaleEnabled={false}
                    />
                );
            }
            case 'star': {
                const s = shape as StarElement;
                return (
                    <Star
                        {...commonProps}
                        numPoints={s.numPoints}
                        innerRadius={s.innerRadius}
                        outerRadius={s.outerRadius}
                        fill={s.fill}
                        stroke={s.stroke}
                        strokeWidth={s.strokeWidth}
                        strokeScaleEnabled={false}
                    />
                );
            }
            case 'arrow': {
                const a = shape as ArrowElement;
                return (
                    <Arrow
                        {...commonProps}
                        points={a.points}
                        stroke={a.stroke}
                        strokeWidth={a.strokeWidth}
                        fill={a.stroke}
                        strokeScaleEnabled={false}
                        pointerLength={10}
                        pointerWidth={10}
                    />
                );
            }
            case 'line': {
                const l = shape as LineElement;
                return (
                    <Line
                        {...commonProps}
                        points={l.points}
                        stroke={l.stroke}
                        strokeWidth={l.strokeWidth}
                        strokeScaleEnabled={false}
                    />
                );
            }
            default:
                return null;
        }
    };

    return (
        <React.Fragment>
            {renderSpecificShape()}
            {isSelected && activeTool === 'select' && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};
