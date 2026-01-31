import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useEditorStore } from '../../stores/editorStore';
import { useCanvasZoom } from '../../hooks/useCanvasZoom';
import { useCanvasPan } from '../../hooks/useCanvasPan';
import { StageBackground } from './StageBackground';
import { SeatLayer } from './SeatLayer';
import type { KonvaEventObject } from 'konva/lib/Node';

import { CursorIndicator } from './CursorIndicator';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useLassoSelection } from '../../hooks/useLassoSelection';
import { useSeatCreation } from '../../hooks/useSeatCreation';
import { useSeatGroupCreation } from '../../hooks/useSeatGroupCreation';
import { useSeatPaint } from '../../hooks/useSeatPaint';
import { setStageRef } from '../../utils/canvasRef';
import Konva from 'konva';

import { useTerrainDrawing } from '../../hooks/useTerrainDrawing';
import { useTextTool } from '../../hooks/useTextTool';
import { TerrainLayer } from './TerrainLayer';
import { LabelLayer } from './LabelLayer';
import { ShapeLayer } from './ShapeLayer';
import { useShapeDrawing } from '../../hooks/useShapeDrawing';
import { ToolPreviews } from './ToolPreviews';

export const EditorCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageInstanceRef = useRef<Konva.Stage>(null);
    const { zoom, pan, clearSelection, activeTool, isPreview } = useEditorStore();

    useEffect(() => {
        if (stageInstanceRef.current) {
            setStageRef(stageInstanceRef.current);
        }
        return () => setStageRef(null);
    }, []);

    // Hooks
    useKeyboardShortcuts();
    const { handleWheel } = useCanvasZoom();
    const { isDraggable, handleDragStart: handlePanStart, handleDragEnd: handlePanEnd } = useCanvasPan();
    const { selectionBox, handleMouseDown: handleLassoDown, handleMouseMove: handleLassoMove, handleMouseUp: handleLassoUp } = useLassoSelection();
    const { ghostPos, handleMouseMove: handleDrawMove, handleMouseUp: handleDrawUp } = useSeatCreation();
    const { previewSeats, handleMouseDown: handleGroupDown, handleMouseMove: handleGroupMove, handleMouseUp: handleGroupUp, isDrawing: isGroupDrawing } = useSeatGroupCreation();
    const { handleMouseDown: handlePaintDown, handleMouseMove: handlePaintMove, handleMouseUp: handlePaintUp, isPainting } = useSeatPaint();

    // New Tools Hooks
    const { drawingPoints, drawingCursor, handleMouseMove: handleTerrainMove, handleClick: handleTerrainClick } = useTerrainDrawing();
    const { handleClick: handleTextClick } = useTextTool();
    const { drawingShape, handleMouseDown: handleShapeDown, handleMouseMove: handleShapeMove, handleMouseUp: handleShapeUp } = useShapeDrawing();

    // Cursor Tracking
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const handleStageMouseMove = (e: KonvaEventObject<any>) => {
        // Cursor Update
        const stage = e.target.getStage();
        if (stage) {
            const pointer = stage.getPointerPosition();
            if (pointer) {
                const transform = stage.getAbsoluteTransform().copy();
                transform.invert();
                const pos = transform.point(pointer);
                setCursorPos({ x: pos.x, y: pos.y });
            }
        }

        // Tool Logic
        if (!isPreview) {
            handleLassoMove(e);
            handleDrawMove(e);
            handleTerrainMove(e);
            handleShapeMove(e);
            handleGroupMove(e);
            handlePaintMove(e);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const handleStageMouseDown = (e: KonvaEventObject<any>) => {
        if (isPreview) return;
        // Pan logic is handled by 'draggable' prop but we can intercept here if needed
        handleLassoDown(e);
        handleShapeDown(e);
        handleGroupDown(e);
        handlePaintDown(e);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Konva event typing
    const handleStageMouseUp = (e: KonvaEventObject<any>) => {
        if (isPreview) return;
        handleLassoUp(e);
        handleDrawUp(e);
        handleShapeUp();
        handleGroupUp();
        handlePaintUp();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStageClick = (e: KonvaEventObject<any>) => {
        if (isPreview) return;

        handleTerrainClick(e);
        handleTextClick(e);

        // If clicked on stage background (not a shape), clear selection
        if (e.target === e.target.getStage() && activeTool === 'select' && !selectionBox) {
            clearSelection();
        }
    };

    // Auto-resize Logic
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full bg-slate-950 overflow-hidden relative focus:outline-none" tabIndex={0}>
            {size.width > 0 && (
                <Stage
                    ref={stageInstanceRef}
                    width={size.width}
                    height={size.height}
                    scaleX={zoom}
                    scaleY={zoom}
                    x={pan.x}
                    y={pan.y}
                    draggable={isDraggable}
                    onWheel={handleWheel}
                    onDragStart={handlePanStart}
                    onDragEnd={handlePanEnd}
                    onMouseMove={handleStageMouseMove}
                    onMouseDown={handleStageMouseDown}
                    onMouseUp={handleStageMouseUp}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                >

                    {/* Static Layer - Grid and persistent elements */}
                    <Layer listening={false}>
                        <StageBackground />
                    </Layer>

                    {/* Content Layer - Interactive elements */}
                    <Layer>
                        <TerrainLayer isPanning={isDraggable} />
                        <SeatLayer isPanning={isDraggable} />
                        <ShapeLayer isPanning={isDraggable} />
                        <LabelLayer isPanning={isDraggable} />
                    </Layer>

                    {/* Overlay Layer - Drawing previews and interactions */}
                    <Layer listening={false}>
                        <ToolPreviews
                            cursorPos={cursorPos}
                            drawingShape={drawingShape}
                            drawingPoints={drawingPoints}
                            drawingCursor={drawingCursor}
                            selectionBox={selectionBox}
                            ghostPos={ghostPos}
                            previewSeats={previewSeats}
                            isGroupDrawing={isGroupDrawing}
                            isPainting={isPainting}
                        />
                    </Layer>
                </Stage>
            )}

            {!isPreview && <CursorIndicator x={cursorPos.x} y={cursorPos.y} />}

            {!isPreview && (
                <div className="absolute bottom-4 right-4 pointer-events-none text-slate-500 text-xs bg-black/50 p-2 rounded backdrop-blur-sm transition-opacity">
                    {activeTool.startsWith('seat:') && activeTool !== 'seat:single' && activeTool !== 'seat:paint' ? 'Click and Drag to Draw Group • ' : ''}
                    {activeTool === 'seat:paint' ? 'Drag to Paint Seats • Start on seat to Erase • ' : ''}
                    {activeTool === 'seat:single' ? 'Click to Place Seat • ' : ''}
                    {activeTool === 'terrain' ? 'Click to Add Points • Ent/DblClick to Close • ' : ''}
                    {['rect', 'circle', 'star', 'arrow', 'line'].includes(activeTool) ? 'Click and Drag to Draw Shape • ' : ''}
                    Scroll: Zoom • Space+Drag: Pan • V: Select • Del: Delete
                </div>
            )}

            {isPreview && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full backdrop-blur-md animate-pulse">
                    Preview Mode: View Only
                </div>
            )}
        </div>
    );
};
