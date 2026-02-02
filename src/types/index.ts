export interface BaseElement {
    id: string;
    type: 'terrain' | 'label' | 'seat' | 'rect' | 'circle' | 'star' | 'arrow' | 'line';
    x: number;
    y: number;
    z: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
}

export interface Terrain extends BaseElement {
    type: 'terrain';
    points: number[]; // Rần rộ tương đối so với x, y
    color: string;
    label?: string;
    opacity: number;
    closed: boolean;
}

export interface Label extends BaseElement {
    type: 'label';
    text: string;
    fontSize: number;
    color: string;
    fontWeight?: string;
}

export interface Seat extends BaseElement {
    type: 'seat';
    tier: string;
    row?: string;
    number?: string;
    label?: string;
    status: 'available' | 'booked' | 'maintenance' | 'hold';
    isAccessible?: boolean;
}

export interface RectElement extends BaseElement {
    type: 'rect';
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface StarElement extends BaseElement {
    type: 'star';
    innerRadius: number;
    outerRadius: number;
    numPoints: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface CircleElement extends BaseElement {
    type: 'circle';
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface ArrowElement extends BaseElement {
    type: 'arrow';
    points: number[];
    stroke: string;
    strokeWidth: number;
}

export interface LineElement extends BaseElement {
    type: 'line';
    points: number[];
    stroke: string;
    strokeWidth: number;
}

export type StageElement = Terrain | Label | Seat | RectElement | CircleElement | StarElement | ArrowElement | LineElement;

export interface Stage {
    id: string;
    name: string;
    width: number;
    depth: number;
    gridColor: string;
    gridDensity: number;
    snapStrength: number;
    defaultTier: string;
    isVisible: boolean;
    lockAspectRatio: boolean;
    snapToGrid: boolean;
    sectionLabel: string;
    elements: StageElement[];
}

export interface EditorState {
    activeStageId: string | null;
    activeTool: 'select' | 'grid' | 'seat:single' | 'seat:line' | 'seat:region' | 'seat:paint' | 'delete' | 'terrain' | 'text' | 'pan' | 'rect' | 'circle' | 'star' | 'arrow' | 'line';
    selectedSeatIds: string[];
    selectedShapeId: string | null;
    selectedShapeType: StageElement['type'] | null;
    zoom: number;
    pan: { x: number; y: number };
    isPreview: boolean;
    // Flags to prevent selection clearing during drag/lasso operations
    isDraggingSeat: boolean;
    isLassoSelecting: boolean;
}

export interface ActivityLogEntry {
    id: string;
    message: string;
    timestamp: number;
    actor: 'system' | 'user';
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface Tier {
    id: string;
    name: string;
    color: string;
    price: number;
}
