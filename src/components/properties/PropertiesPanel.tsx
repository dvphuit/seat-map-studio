import React from 'react';
import { useSelectors } from '../../hooks/useSelectors';
import { SeatProperties } from './SeatProperties';
import { TerrainProperties } from './TerrainProperties';
import { LabelProperties } from './LabelProperties';
import { useEditorStore } from '../../stores/editorStore';
import { StageProperties } from './StageProperties';
import { useTierStore } from '../../stores/tierStore';
import { RectProperties } from './RectProperties';
import { StarProperties } from './StarProperties';
import { LineProperties } from './LineProperties';
import { CircleProperties } from './CircleProperties';
import type { Seat, StageElement, Stage } from '../../types';

interface PropertiesPanelProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

/**
 * Object types that can be selected and edited in the properties panel
 */
type ObjectType = 'stage' | StageElement['type'];

/**
 * Properties component configuration
 */
interface PropertiesConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic component props vary per component
    component: React.ComponentType<any>;
    getTitle: (context: SelectionContext) => string;
    getTag?: (context: SelectionContext) => { text: string; color: string; isCustomColor?: boolean };
    getProps?: (context: SelectionContext) => Record<string, unknown>;
}

interface SelectionContext {
    selectedShapeId: string | null;
    selectedShapeType: StageElement['type'] | null;
    selectedSeats: Seat[];
    activeStage: Stage | null;
    activeTier?: { id: string; name: string; color: string; price: number };
}

/**
 * Registry: Maps object types to their corresponding property components
 */
const PROPERTIES_REGISTRY: Record<ObjectType, PropertiesConfig> = {
    terrain: {
        component: TerrainProperties,
        getTitle: () => 'Terrain',
        getTag: () => ({ text: 'SHAPE', color: 'emerald' })
    },
    label: {
        component: LabelProperties,
        getTitle: () => 'Label',
        getTag: () => ({ text: 'TEXT', color: 'blue' })
    },
    seat: {
        component: SeatProperties,
        getTitle: (ctx) => ctx.selectedSeats.length === 1
            ? 'Seat'
            : `${ctx.selectedSeats.length} Seats`,
        getTag: (ctx) => ctx.activeTier
            ? { text: ctx.activeTier.name, color: ctx.activeTier.color, isCustomColor: true }
            : { text: 'SEAT', color: 'blue' },
        getProps: (ctx) => ({ selectedSeats: ctx.selectedSeats }),
    },
    stage: {
        component: StageProperties,
        getTitle: () => 'Stage Settings',
        getTag: () => ({ text: 'STAGE', color: 'amber' })
    },
    rect: {
        component: RectProperties,
        getTitle: () => 'Rectangle',
        getTag: () => ({ text: 'RECT', color: 'indigo' })
    },
    circle: {
        component: CircleProperties,
        getTitle: () => 'Circle',
        getTag: () => ({ text: 'CIRCLE', color: 'indigo' })
    },
    star: {
        component: StarProperties,
        getTitle: () => 'Star',
        getTag: () => ({ text: 'STAR', color: 'indigo' })
    },
    arrow: {
        component: LineProperties,
        getTitle: () => 'Arrow',
        getTag: () => ({ text: 'ARROW', color: 'indigo' }),
        getProps: () => ({ type: 'arrow' })
    },
    line: {
        component: LineProperties,
        getTitle: () => 'Line',
        getTag: () => ({ text: 'LINE', color: 'indigo' }),
        getProps: () => ({ type: 'line' })
    },
};

/**
 * Determine current object type based on context
 * Priority: Terrain/Label > Seat > Stage
 */
const getObjectType = (context: SelectionContext): ObjectType => {
    // Check for terrain or label selection
    if (context.selectedShapeId && context.selectedShapeType) {
        return context.selectedShapeType; // 'terrain' or 'label'
    }
    // Check for seat selection
    if (context.selectedSeats.length > 0) {
        return 'seat';
    }
    // Default to stage
    return 'stage';
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ isExpanded = true, onToggle }) => {
    const { activeStage, selectedSeats } = useSelectors();
    const { selectedShapeId, selectedShapeType } = useEditorStore();
    const { tiers } = useTierStore();

    const activeTier = selectedSeats.length > 0
        ? tiers.find(t => t.id === selectedSeats[0].tier)
        : undefined;

    const context: SelectionContext = {
        selectedShapeId,
        selectedShapeType,
        selectedSeats,
        activeStage,
        activeTier
    };

    const objectType = getObjectType(context);
    const config = PROPERTIES_REGISTRY[objectType];
    const PropertiesComponent = config.component;
    const title = config.getTitle(context);
    const tag = config.getTag?.(context);
    const componentProps = config.getProps?.(context) || {};

    // No active stage - show empty state
    if (!activeStage) {
        return (
            <div
                className={`pointer-events-auto bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative ${isExpanded ? 'flex-1' : 'h-[60px] shrink-0 hover:border-white/20 cursor-pointer'}`}
                onClick={!isExpanded ? onToggle : undefined}
            >
                <div className="h-[60px] px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 text-lg">tune</span>
                        <span className="font-semibold text-slate-200 text-sm tracking-wide">Properties</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onToggle?.(); }} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">{isExpanded ? 'expand_more' : 'expand_less'}</span>
                    </button>
                </div>
                <div className={`flex-1 flex items-center justify-center text-slate-500 ${!isExpanded && 'hidden'}`}>
                    <span>No Stage Selected</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`pointer-events-auto bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col relative ${isExpanded ? 'flex-1' : 'h-[64px] shrink-0 hover:border-white/20 cursor-pointer'}`}
            onClick={!isExpanded ? onToggle : undefined}
        >
            {/* Header Area */}
            <div className="flex items-center justify-between px-6 h-[64px] shrink-0 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <h2 className="text-white text-base font-bold tracking-tight">{title}</h2>
                    {tag && isExpanded && (
                        <div
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${tag.isCustomColor ? '' : `bg-${tag.color}-500/10 text-${tag.color}-400 border-${tag.color}-500/20`
                                }`}
                            style={tag.isCustomColor ? {
                                color: tag.color,
                                backgroundColor: `${tag.color}15`,
                                borderColor: `${tag.color}30`
                            } : {}}
                        >
                            {tag.text}
                        </div>
                    )}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                    className="size-8 flex items-center justify-center text-slate-500 hover:text-white transition-all rounded-xl hover:bg-white/5 group"
                >
                    <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
                        expand_more
                    </span>
                </button>
            </div>

            {/* Expanded Content */}
            <div className={`flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-700/50 hover:scrollbar-thumb-slate-600 transition-all ${!isExpanded && 'hidden'}`}>
                <PropertiesComponent {...componentProps} />
            </div>
        </div>
    );
};
