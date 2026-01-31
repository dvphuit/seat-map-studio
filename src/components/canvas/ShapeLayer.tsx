import React from 'react';
import { Group } from 'react-konva';
import { useStageStore } from '../../stores/stageStore';
import { useEditorStore } from '../../stores/editorStore';
import type { RectElement, CircleElement, StarElement, ArrowElement, LineElement } from '../../types';
import { ShapeItem } from './ShapeItem';

interface ShapeLayerProps {
    isPanning?: boolean;
}

export const ShapeLayer: React.FC<ShapeLayerProps> = ({ isPanning = false }) => {
    const { stages } = useStageStore();
    const { activeStageId, selectedShapeId, selectShape, activeTool } = useEditorStore();

    if (!activeStageId || !stages[activeStageId]) return null;

    const shapeElements = stages[activeStageId].elements.filter(
        (e) => ['rect', 'circle', 'star', 'arrow', 'line'].includes(e.type)
    );

    return (
        <Group>
            {shapeElements.map((shape) => (
                <ShapeItem
                    key={shape.id}
                    shape={shape as RectElement | CircleElement | StarElement | ArrowElement | LineElement}
                    isSelected={selectedShapeId === shape.id}
                    activeStageId={activeStageId}
                    activeTool={activeTool}
                    selectShape={selectShape}
                    isPanning={isPanning}
                />
            ))}
        </Group>
    );
};
