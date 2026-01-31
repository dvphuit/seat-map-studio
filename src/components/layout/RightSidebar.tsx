import React, { useState } from 'react';
import { PropertiesPanel } from '../properties/PropertiesPanel';
import { ActivityLog } from '../activity/ActivityLog';

export const RightSidebar: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<'properties' | 'activity'>('properties');

    return (
        <aside className="w-80 m-6 ml-0 flex flex-col relative z-20 pointer-events-none h-full justify-start transition-all duration-500 animate-in slide-in-from-right overflow-hidden">
            <div className="pointer-events-auto h-full flex flex-col gap-4 overflow-hidden">
                <PropertiesPanel
                    isExpanded={expandedSection === 'properties'}
                    onToggle={() => setExpandedSection(prev => prev === 'properties' ? 'activity' : 'properties')}
                />
                <ActivityLog
                    isExpanded={expandedSection === 'activity'}
                    onToggle={() => setExpandedSection(prev => prev === 'activity' ? 'properties' : 'activity')}
                />
            </div>
        </aside>
    );
};
