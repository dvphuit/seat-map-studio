import { z } from 'zod';

export const BaseElementSchema = z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    z: z.number().default(0),
});

export const TerrainSchema = BaseElementSchema.extend({
    type: z.literal('terrain'),
    points: z.array(z.number()),
    color: z.string(),
    label: z.string().optional(),
    opacity: z.number(),
    closed: z.boolean(),
});

export const LabelSchema = BaseElementSchema.extend({
    type: z.literal('label'),
    text: z.string(),
    fontSize: z.number(),
    color: z.string(),
    fontWeight: z.string().optional(),
    rotation: z.number().optional(),
});

export const SeatSchema = BaseElementSchema.extend({
    type: z.literal('seat'),
    tier: z.string(),
    row: z.string().optional(),
    number: z.string().optional(),
    label: z.string().optional(),
    status: z.enum(['available', 'booked', 'maintenance', 'hold']).default('available'),
    isAccessible: z.boolean().optional(),
});

export const RectSchema = BaseElementSchema.extend({
    type: z.literal('rect'),
    width: z.number(),
    height: z.number(),
    fill: z.string(),
    stroke: z.string(),
    strokeWidth: z.number(),
    rotation: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
});

export const CircleSchema = BaseElementSchema.extend({
    type: z.literal('circle'),
    radius: z.number(),
    fill: z.string(),
    stroke: z.string(),
    strokeWidth: z.number(),
    rotation: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
});

export const StarSchema = BaseElementSchema.extend({
    type: z.literal('star'),
    innerRadius: z.number(),
    outerRadius: z.number(),
    numPoints: z.number(),
    fill: z.string(),
    stroke: z.string(),
    strokeWidth: z.number(),
    rotation: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
});

export const ArrowSchema = BaseElementSchema.extend({
    type: z.literal('arrow'),
    points: z.array(z.number()),
    stroke: z.string(),
    strokeWidth: z.number(),
    rotation: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
});

export const LineSchema = BaseElementSchema.extend({
    type: z.literal('line'),
    points: z.array(z.number()),
    stroke: z.string(),
    strokeWidth: z.number(),
    rotation: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
});

export const StageElementSchema = z.discriminatedUnion('type', [
    TerrainSchema,
    LabelSchema,
    SeatSchema,
    RectSchema,
    CircleSchema,
    StarSchema,
    ArrowSchema,
    LineSchema,
]);

export const StageSchema = z.object({
    id: z.string(),
    name: z.string(),
    width: z.number(),
    depth: z.number(),
    gridColor: z.string(),
    gridDensity: z.number(),
    snapStrength: z.number(),
    defaultTier: z.string(),
    isVisible: z.boolean(),
    lockAspectRatio: z.boolean(),
    snapToGrid: z.boolean(),
    sectionLabel: z.string(),
    elements: z.array(StageElementSchema).default([]),
});

export const ExportSchema = z.object({
    version: z.string(),
    exportedAt: z.string(),
    stages: z.array(StageSchema),
});

export type ExportData = z.infer<typeof ExportSchema>;
