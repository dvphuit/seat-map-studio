import React, { useRef, useEffect } from 'react';
import { Group, Line, Transformer } from 'react-konva';
import { useStageStore } from '../../stores/stageStore';
import { useEditorStore } from '../../stores/editorStore';
import { useHistoryStore } from '../../stores/historyStore';
import Konva from 'konva';

import type { Terrain } from '../../types';

interface TerrainLayerProps {
    isPanning?: boolean;
}

export const TerrainLayer: React.FC<TerrainLayerProps> = ({ isPanning = false }) => {
    const { stages } = useStageStore();
    const { activeStageId, selectedShapeId, selectShape, activeTool } = useEditorStore();

    if (!activeStageId || !stages[activeStageId]) return null;

    const terrainElements = stages[activeStageId].elements.filter(
        (e): e is Terrain => e.type === 'terrain'
    );

    return (
        <Group>
            {terrainElements.map((terrain) => (
                <TerrainItem
                    key={terrain.id}
                    terrain={terrain}
                    isSelected={selectedShapeId === terrain.id}
                    activeStageId={activeStageId}
                    activeTool={activeTool}
                    selectShape={selectShape}
                    isPanning={isPanning}
                />
            ))}
        </Group>
    );
};

interface TerrainItemProps {
    terrain: Terrain;
    isSelected: boolean;
    activeStageId: string;
    activeTool: string;
    selectShape: (id: string, type: 'terrain') => void;
    isPanning: boolean;
}

const TerrainItem: React.FC<TerrainItemProps> = ({
    terrain,
    isSelected,
    activeStageId,
    activeTool,
    selectShape,
    isPanning
}) => {
    const shapeRef = useRef<Konva.Line>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const { x, y, points, rotation, scaleX, scaleY, closed, color, opacity } = terrain;

    // Calculate bounding box to find the center
    const { offsetX, offsetY } = React.useMemo(() => {
        if (points.length === 0) return { offsetX: 0, offsetY: 0 };

        let minX = points[0], maxX = points[0];
        let minY = points[1], maxY = points[1];

        for (let i = 0; i < points.length; i += 2) {
            minX = Math.min(minX, points[i]);
            maxX = Math.max(maxX, points[i]);
            minY = Math.min(minY, points[i + 1]);
            maxY = Math.max(maxY, points[i + 1]);
        }

        return {
            offsetX: (minX + maxX) / 2,
            offsetY: (minY + maxY) / 2,
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }, [points]);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        // When offset is used, x and y represent the center point. 
        // We subtract the offset to store the "top-left" logical position consistent with points.
        useStageStore.getState().updateElement(activeStageId, terrain.id, {
            x: e.target.x() - offsetX,
            y: e.target.y() - offsetY,
        });
    };

    const handleTransformEnd = () => {
        if (shapeRef.current) {
            const node = shapeRef.current;
            useStageStore.getState().updateElement(activeStageId, terrain.id, {
                x: node.x() - offsetX,
                y: node.y() - offsetY,
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                rotation: node.rotation(),
            });
        }
    };

    return (
        <React.Fragment>
            <Line
                ref={shapeRef}
                x={x + offsetX}
                y={y + offsetY}
                offsetX={offsetX}
                offsetY={offsetY}
                scaleX={scaleX ?? 1}
                scaleY={scaleY ?? 1}
                rotation={rotation ?? 0}
                points={points}
                closed={closed}
                stroke={isSelected ? '#00f0ff' : color}
                fill={color}
                opacity={opacity}
                strokeWidth={isSelected ? 3 : 2}
                dash={[10, 5]}
                shadowColor="#00f0ff"
                shadowBlur={isSelected ? 10 : 0}
                shadowOpacity={isSelected ? 0.5 : 0}
                draggable={activeTool === 'select'}
                onClick={(e) => {
                    if (activeTool === 'select') {
                        e.cancelBubble = true;
                        selectShape(terrain.id, 'terrain');
                    } else if (activeTool === 'delete') {
                        e.cancelBubble = true;
                        useHistoryStore.getState().pushState();
                        useStageStore.getState().deleteElement(activeStageId, terrain.id);
                    }
                }}
                onTap={(e) => {
                    if (activeTool === 'select') {
                        e.cancelBubble = true;
                        selectShape(terrain.id, 'terrain');
                    } else if (activeTool === 'delete') {
                        e.cancelBubble = true;
                        useHistoryStore.getState().pushState();
                        useStageStore.getState().deleteElement(activeStageId, terrain.id);
                    }
                }}
                onMouseEnter={(e) => {
                    if (activeTool === 'delete') {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'no-drop';
                    }
                }}
                onMouseLeave={(e) => {
                    if (activeTool === 'delete') {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'default';
                    }
                }}
                listening={!isPanning}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
            />
            {isSelected && activeTool === 'select' && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Limit minimum size
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

