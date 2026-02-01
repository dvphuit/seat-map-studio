import { Group, Rect, Circle, Star, Arrow, Line, Text } from 'react-konva';
import { useEditorStore } from '../../stores/editorStore';
import { SelectionBox } from './SelectionBox';
import { useSnapping } from '../../hooks/useSnapping';
import type { RectElement, CircleElement, StarElement, ArrowElement, LineElement } from '../../types';

type ShapeElement = RectElement | CircleElement | StarElement | ArrowElement | LineElement;

interface ToolPreviewsProps {
    cursorPos: { x: number; y: number };
    drawingShape: Partial<ShapeElement> | null;
    drawingPoints: number[];
    drawingCursor: { x: number; y: number } | null;
    selectionBox: { x: number; y: number; width: number; height: number; startX?: number; startY?: number } | null;
    ghostPos: { x: number; y: number; label?: string } | null;
    previewSeats: Array<{ x?: number; y?: number; label?: string }>;
    isGroupDrawing: boolean;
    isPainting: boolean;
}

export const ToolPreviews: React.FC<ToolPreviewsProps> = ({
    cursorPos,
    drawingShape,
    drawingPoints,
    drawingCursor,
    selectionBox,
    ghostPos,
    previewSeats,
    isGroupDrawing,
    isPainting
}) => {
    const { activeTool, isPreview } = useEditorStore();
    const { getSnappedPos } = useSnapping();

    if (isPreview) return null;

    return (
        <Group listening={false}>
            {/* Shape Drawing Preview */}
            {drawingShape && (
                <Group>
                    {drawingShape.type === 'rect' && (
                        <Rect
                            x={drawingShape.x}
                            y={drawingShape.y}
                            width={(drawingShape as any).width}
                            height={(drawingShape as any).height}
                            fill={drawingShape.fill}
                            stroke={drawingShape.stroke}
                            strokeWidth={drawingShape.strokeWidth}
                            listening={false}
                        />
                    )}
                    {drawingShape.type === 'circle' && (
                        <Circle
                            x={drawingShape.x}
                            y={drawingShape.y}
                            radius={(drawingShape as any).radius}
                            fill={drawingShape.fill}
                            stroke={drawingShape.stroke}
                            strokeWidth={drawingShape.strokeWidth}
                            listening={false}
                        />
                    )}
                    {drawingShape.type === 'star' && (
                        <Star
                            x={drawingShape.x}
                            y={drawingShape.y}
                            numPoints={(drawingShape as any).numPoints || 5}
                            innerRadius={(drawingShape as any).innerRadius || 0}
                            outerRadius={(drawingShape as any).outerRadius || 0}
                            fill={drawingShape.fill}
                            stroke={drawingShape.stroke}
                            strokeWidth={drawingShape.strokeWidth}
                            listening={false}
                        />
                    )}
                    {drawingShape.type === 'arrow' && (
                        <Arrow
                            x={drawingShape.x}
                            y={drawingShape.y}
                            points={(drawingShape as any).points || []}
                            stroke={drawingShape.stroke}
                            strokeWidth={drawingShape.strokeWidth}
                            fill={drawingShape.stroke}
                            pointerLength={10}
                            pointerWidth={10}
                            listening={false}
                        />
                    )}
                    {drawingShape.type === 'line' && (
                        <Line
                            x={drawingShape.x}
                            y={drawingShape.y}
                            points={(drawingShape as any).points || []}
                            stroke={drawingShape.stroke}
                            strokeWidth={drawingShape.strokeWidth}
                            listening={false}
                        />
                    )}
                </Group>
            )}

            {/* Terrain Preview Line */}
            {drawingPoints.length > 0 && activeTool === 'terrain' && (
                <Line
                    points={drawingCursor ? [...drawingPoints, drawingCursor.x, drawingCursor.y] : drawingPoints}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    closed={false}
                    listening={false}
                />
            )}

            {/* Selection Box */}
            {selectionBox && (
                <SelectionBox
                    x={selectionBox.x}
                    y={selectionBox.y}
                    width={selectionBox.width}
                    height={selectionBox.height}
                    visible={true}
                />
            )}

            {/* Ghost Seat for Single Mode */}
            {ghostPos && activeTool === 'seat:single' && (
                <Group>
                    <Circle
                        x={ghostPos.x}
                        y={ghostPos.y}
                        radius={14}
                        fill="rgba(59, 130, 246, 0.4)"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                    />
                    {ghostPos.label && (
                        <Text
                            text={ghostPos.label}
                            x={ghostPos.x - 14}
                            y={ghostPos.y - 13}
                            width={28}
                            height={28}
                            fontSize={8}
                            fontStyle="bold"
                            fill="rgba(255, 255, 255, 0.6)"
                            align="center"
                            verticalAlign="middle"
                            listening={false}
                            fontFamily="Inter, sans-serif"
                        />
                    )}
                </Group>
            )}

            {/* Group Seat Creation Preview */}
            {previewSeats.length > 0 && (
                <Group>
                    {previewSeats.map((s, i) => (
                        <Group key={i}>
                            <Circle
                                x={s.x || 0}
                                y={s.y || 0}
                                radius={14}
                                fill="rgba(59, 130, 246, 0.4)"
                                stroke="#3b82f6"
                                strokeWidth={1}
                                dash={[4, 4]}
                                listening={false}
                            />
                            {s.label && (
                                <Text
                                    text={s.label}
                                    x={(s.x || 0) - 14}
                                    y={(s.y || 0) - 13}
                                    width={28}
                                    height={28}
                                    fontSize={8}
                                    fontStyle="bold"
                                    fill="rgba(255, 255, 255, 0.6)"
                                    align="center"
                                    verticalAlign="middle"
                                    listening={false}
                                    fontFamily="Inter, sans-serif"
                                />
                            )}
                        </Group>
                    ))}
                    {isGroupDrawing && previewSeats[0] && (
                        <Line
                            points={[previewSeats[0].x || 0, previewSeats[0].y || 0, cursorPos.x, cursorPos.y]}
                            stroke="#3b82f6"
                            strokeWidth={1}
                            dash={[2, 2]}
                            opacity={0.5}
                        />
                    )}
                </Group>
            )}

            {/* Paint Ghost Cursor */}
            {activeTool === 'seat:paint' && (
                <Circle
                    x={getSnappedPos(cursorPos.x, cursorPos.y).x}
                    y={getSnappedPos(cursorPos.x, cursorPos.y).y}
                    radius={16}
                    fill={isPainting ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.1)"}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeAlpha={0.5}
                    dash={[2, 2]}
                    listening={false}
                />
            )}

            {/* Ghost Cursor for Terrain Mode */}
            {drawingCursor && activeTool === 'terrain' && (
                <Circle
                    x={drawingCursor.x}
                    y={drawingCursor.y}
                    radius={4}
                    fill="#3b82f6"
                    listening={false}
                />
            )}
        </Group>
    );
};
