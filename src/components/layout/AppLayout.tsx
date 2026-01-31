import React, { type ReactNode } from 'react';
import { Header } from './Header';
import { StageManager } from '../stage-manager/StageManager';
import { ToolDock } from '../tools/ToolDock';
import { RightSidebar } from './RightSidebar';

interface AppLayoutProps {
    children: ReactNode; // Main Canvas Content
}

import { useEditorStore } from '../../stores/editorStore';

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { isPreview } = useEditorStore();

    return (
        <div className="bg-background-dark text-slate-200 font-display overflow-hidden h-screen w-full flex flex-col relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-dot-pattern [background-size:32px_32px]"></div>

            <Header />

            <div className="flex-1 flex relative z-10 overflow-hidden">
                {/* Left Sidebar */}
                {!isPreview && (
                    <aside className="w-64 m-6 mr-0 flex flex-col gap-4 relative z-20 pointer-events-none transition-all duration-500 animate-in slide-in-from-left">
                        <div className="pointer-events-auto h-full flex flex-col gap-4">
                            <StageManager />
                            <ToolDock />
                        </div>
                    </aside>
                )}

                {/* Main Content (Canvas) */}
                <main className="flex-1 relative overflow-hidden perspective-[2000px]">
                    {children}
                    {/* {!isPreview && <VenueOverview />} */}
                </main>

                {/* Right Sidebar */}
                {!isPreview && <RightSidebar />}
            </div>
        </div>
    );
};

