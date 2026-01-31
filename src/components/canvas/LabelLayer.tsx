import React from 'react';
import { Group, Text } from 'react-konva';
import Konva from 'konva';
import { useStageStore } from '../../stores/stageStore';
import { useEditorStore } from '../../stores/editorStore';
import { useHistoryStore } from '../../stores/historyStore';
import type { Label } from '../../types';

interface LabelLayerProps {
    isPanning?: boolean;
}

export const LabelLayer: React.FC<LabelLayerProps> = ({ isPanning = false }) => {
    const { stages } = useStageStore();
    const { activeStageId, selectedShapeId, selectShape, activeTool } = useEditorStore();

    if (!activeStageId || !stages[activeStageId]) return null;

    const labelElements = stages[activeStageId].elements.filter(
        (e): e is Label => e.type === 'label'
    );

    return (
        <Group>
            {labelElements.map((label) => (
                <LabelItem
                    key={label.id}
                    label={label}
                    isSelected={selectedShapeId === label.id}
                    activeStageId={activeStageId}
                    activeTool={activeTool}
                    selectShape={selectShape}
                    isPanning={isPanning}
                />
            ))}
        </Group>
    );
};

interface LabelItemProps {
    label: Label;
    isSelected: boolean;
    activeStageId: string;
    activeTool: string;
    selectShape: (id: string, type: 'label') => void;
    isPanning: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
    label,
    isSelected,
    activeStageId,
    activeTool,
    selectShape,
    isPanning
}) => {
    const textRef = React.useRef<Konva.Text>(null);

    React.useEffect(() => {
        if (textRef.current) {
            const node = textRef.current;
            node.offsetX(node.width() / 2);
            node.offsetY(node.height() / 2);
        }
    }, [label.text, label.fontSize, label.fontWeight]);

    return (
        <Text
            ref={textRef}
            x={label.x}
            y={label.y}
            text={label.text}
            fontSize={label.fontSize}
            fill={isSelected ? '#00f0ff' : label.color}
            fontFamily="Inter, sans-serif"
            fontStyle={label.fontWeight || 'normal'}
            rotation={label.rotation || 0}
            shadowColor="#00f0ff"
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.5 : 0}
            onClick={(e) => {
                if (activeTool === 'select') {
                    e.cancelBubble = true;
                    selectShape(label.id, 'label');
                } else if (activeTool === 'delete') {
                    e.cancelBubble = true;
                    useHistoryStore.getState().pushState();
                    useStageStore.getState().deleteElement(activeStageId, label.id);
                }
            }}
            onTap={(e) => {
                if (activeTool === 'select') {
                    e.cancelBubble = true;
                    selectShape(label.id, 'label');
                } else if (activeTool === 'delete') {
                    e.cancelBubble = true;
                    useHistoryStore.getState().pushState();
                    useStageStore.getState().deleteElement(activeStageId, label.id);
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
            draggable={activeTool === 'select'}
            onDragEnd={(e) => {
                useStageStore.getState().updateElement(activeStageId, label.id, {
                    x: e.target.x(),
                    y: e.target.y()
                });
            }}
        />
    );
};
