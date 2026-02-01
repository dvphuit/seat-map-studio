import React, { useMemo } from 'react';
import { Rect, Text, Group, Line, Circle, Shape } from 'react-konva';
import Konva from 'konva';
import { useSelectors } from '../../hooks/useSelectors';

import { GRID_SIZE } from '../../constants';

const THEME_COLOR = '#3b82f6'; // distinct blue
const BG_COLOR = '#050a14'; // very dark blue/black
const GRID_COLOR = '#3b82f6'; // distinct blue (solid)

export const StageBackground: React.FC = () => {
    const { activeStage } = useSelectors();

    // Grid rendering optimization
    const GridShape = useMemo(() => {
        if (!activeStage) return null;
        const { width, depth, gridColor } = activeStage;

        // Use stage config or fallbacks
        const color = gridColor || GRID_COLOR;
        const size = GRID_SIZE; // Fixed 50px as per requirement

        return (
            <Shape
                stroke={color}
                strokeWidth={1}
                dash={[4, 4]}
                opacity={0.08} // 8% opacity for subtle grid lines
                sceneFunc={(context: Konva.Context, shape: Konva.Shape) => {
                    context.beginPath();

                    // Vertical Lines
                    for (let i = 0; i <= width; i += size) {
                        context.moveTo(i, 0);
                        context.lineTo(i, depth);
                    }

                    // Horizontal Lines
                    for (let j = 0; j <= depth; j += size) {
                        context.moveTo(0, j);
                        context.lineTo(width, j);
                    }

                    // Konva specific drawing - uses props passed to Shape
                    context.fillStrokeShape(shape);
                }}
                listening={false}
            />
        );
    }, [activeStage]);

    // Intersection dots rendering
    const IntersectionDots = useMemo(() => {
        if (!activeStage) return null;
        const { width, depth, gridColor } = activeStage;
        const color = gridColor || GRID_COLOR;
        const size = GRID_SIZE;

        return (
            <Shape
                fill={color}
                opacity={0.3}
                sceneFunc={(context, shape) => {
                    context.beginPath();
                    // Draw circles at every grid intersection
                    for (let i = 0; i <= width; i += size) {
                        for (let j = 0; j <= depth; j += size) {
                            context.moveTo(i + 2, j);
                            context.arc(i, j, 2, 0, Math.PI * 2, false);
                        }
                    }
                    context.fillStrokeShape(shape);
                }}
                listening={false}
            />
        );
    }, [activeStage]);

    if (!activeStage) return null;

    const { width, depth, name } = activeStage;
    const centerX = width / 2;
    const centerY = depth / 2;

    // Dimensions
    const badgeHeight = 30;

    // Calculate dynamic badge width based on name
    const title = name ? name.toUpperCase() : 'MAIN STAGE';
    const charWidth = 10; // Approximate width per char for 12px font bold
    const tracking = 2;
    const horizontalPadding = 50; // Space for circle icon + margins
    const badgeWidth = title.length * (charWidth + tracking) + horizontalPadding;

    return (
        <Group listening={false}>
            {/* 1. Deep Dark Background */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={depth}
                fill={BG_COLOR}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: depth }}
                fillLinearGradientColorStops={[0, '#0f172a', 1, '#020617']}
            />

            {/* 2. The Grid (Dashed) */}
            {GridShape}
            {IntersectionDots}

            {/* 3. Center Axes (Solid, Brighter) */}
            {/* Vertical Axis */}
            <Line
                points={[centerX, 0, centerX, depth]}
                stroke={THEME_COLOR}
                strokeWidth={1}
                opacity={0.5}
            />
            {/* Horizontal Axis */}
            <Line
                points={[0, centerY, width, centerY]}
                stroke={THEME_COLOR}
                strokeWidth={1}
                opacity={0.5}
            />

            {/* 4. Stage Outline (Dashed) */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={depth}
                stroke={THEME_COLOR}
                strokeWidth={2}
                dash={[10, 10]}
                opacity={0.6}
            />

            {/* 5. Top Badge Section (Centered on top edge) */}
            <Group x={centerX} y={0}>
                {/* The "Pill" Badge centered at (0,0) of this group, 
                    so it straddles the line y=0 if we offset y by -height/2 */}
                <Group x={-badgeWidth / 2} y={-badgeHeight / 2}>
                    {/* Badge Background */}
                    <Rect
                        width={badgeWidth}
                        height={badgeHeight}
                        fill={BG_COLOR}
                        cornerRadius={badgeHeight / 2}
                        stroke={THEME_COLOR}
                        strokeWidth={1}
                        shadowColor={THEME_COLOR}
                        shadowBlur={10}
                        shadowOpacity={0.6}
                    />

                    {/* Content inside Badge */}
                    <Group x={15} y={5}>
                        <Circle
                            x={10}
                            y={10}
                            radius={4}
                            fill={THEME_COLOR}
                            shadowColor={THEME_COLOR}
                            shadowBlur={5}
                        />
                        <Text
                            x={25}
                            y={4}
                            text={title}
                            fontSize={12}
                            fontStyle="bold"
                            fill="#e2e8f0"
                            fontFamily="Inter, sans-serif"
                            letterSpacing={tracking}
                            width={badgeWidth - 40} // subtract padding/icon space
                            align="left"
                        />
                    </Group>
                </Group>
            </Group>


            {/* 6. Bottom Label Section (Orchestra Pit) */}
            <Group y={depth - 40}>
                <Group x={centerX} y={0}>
                    {/* A subtle glow under the text */}
                    <Rect
                        x={-100}
                        y={0}
                        width={200}
                        height={40}
                        fillLinearGradientStartPoint={{ x: 0, y: 40 }}
                        fillLinearGradientEndPoint={{ x: 0, y: 0 }}
                        fillLinearGradientColorStops={[0, 'rgba(59, 130, 246, 0.2)', 1, 'transparent']}
                        opacity={0.5}
                    />

                    <Text
                        x={-100} // Centered relative to group
                        y={5}
                        width={200}
                        text="ORCHESTRA PIT"
                        align="center"
                        fontSize={10}
                        fontStyle="bold"
                        fill={THEME_COLOR}
                        opacity={0.6}
                        fontFamily="Inter, sans-serif"
                        letterSpacing={3}
                    />

                    {/* Curved Line / Lip at bottom */}
                    {/* Using a Line with tension for curve */}
                    <Line
                        points={[-150, 20, -100, 35, 100, 35, 150, 20]}
                        stroke={THEME_COLOR}
                        strokeWidth={2}
                        tension={0.4}
                        opacity={0.3}
                    />
                </Group>
            </Group>
        </Group>
    );
};
