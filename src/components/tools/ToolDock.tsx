import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { ToolButton } from './ToolButton';
import { TOOL_GROUPS } from '../../constants/tools';

export const ToolDock: React.FC = () => {
    const { activeTool, setTool } = useEditorStore();

    return (
        <div className="bg-slate-glass backdrop-blur-3xl border border-white/10 rounded-2xl p-2 flex flex-col gap-3 shadow-glass w-full">
            {TOOL_GROUPS.map((group, index) => (
                <div key={group.id} className="flex flex-col gap-2">
                    <div className={`px-1 py-0.5 border-b border-white/5 mb-1 ${index > 0 ? 'mt-1' : ''}`}>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            {group.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 justify-items-center">
                        {group.tools.map((tool) => (
                            <ToolButton
                                key={tool.id}
                                tool={tool.id}
                                icon={tool.icon}
                                shortcut={tool.shortcut}
                                isActive={activeTool === tool.id}
                                onClick={() => setTool(tool.id)}
                                isDestructive={tool.isDestructive}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
