import type { EditorState } from '../types';

export interface ToolConfig {
    id: EditorState['activeTool'];
    icon: string;
    shortcut: string;
    key: string;
    isDestructive?: boolean;
}

export interface ToolGroup {
    id: string;
    label: string;
    tools: ToolConfig[];
}

export const TOOL_GROUPS: ToolGroup[] = [
    {
        id: 'mouse',
        label: 'Mouse',
        tools: [
            { id: 'select', icon: 'near_me', shortcut: '1', key: 'v' },
            { id: 'pan', icon: 'pan_tool', shortcut: '2', key: 'h' },
            { id: 'delete', icon: 'delete_sweep', shortcut: '5', key: 'x', isDestructive: true },
            { id: 'grid', icon: 'grid_on', shortcut: '3', key: 'g' },
        ]
    },
    {
        id: 'seat',
        label: 'Seat',
        tools: [
            { id: 'seat:single', icon: 'event_seat', shortcut: '4', key: 'd' },
            { id: 'seat:line', icon: 'linear_scale', shortcut: 'Q', key: 'q' },
            { id: 'seat:region', icon: 'grid_4x4', shortcut: 'W', key: 'w' },
            { id: 'seat:paint', icon: 'brush', shortcut: 'P', key: 'b' },
        ]
    },
    {
        id: 'shape',
        label: 'Shape',
        tools: [
            { id: 'terrain', icon: 'polyline', shortcut: '6', key: 'p' },
            { id: 'text', icon: 'title', shortcut: '7', key: 't' },
            { id: 'rect', icon: 'rectangle', shortcut: '8', key: 'r' },
            { id: 'circle', icon: 'circle', shortcut: '9', key: 'c' },
            { id: 'star', icon: 'star', shortcut: '0', key: 's' },
            { id: 'arrow', icon: 'arrow_right_alt', shortcut: '-', key: 'a' },
            { id: 'line', icon: 'horizontal_rule', shortcut: '=', key: 'l' },
        ]
    }
];

export const TOOLS: ToolConfig[] = TOOL_GROUPS.flatMap(group => group.tools);
