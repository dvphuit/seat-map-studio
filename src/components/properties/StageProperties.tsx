import React from 'react';
import { useSelectors } from '../../hooks/useSelectors';
import { useStageStore } from '../../stores/stageStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useTierStore } from '../../stores/tierStore';
import { SliderControl } from './SliderControl';
import { ConstraintToggles } from './ConstraintToggles';
import { Section } from './shared/Section';
import { NumberInput } from './shared/NumberInput';

export const StageProperties: React.FC = () => {
    const { activeStage } = useSelectors();
    const { updateStage } = useStageStore();
    const { pushState } = useHistoryStore();
    const { tiers } = useTierStore();

    if (!activeStage) return null;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                <Section title="Stage Settings" icon="settings_input_component">
                    <SliderControl
                        label="Grid Density"
                        value={activeStage.gridDensity}
                        onChange={(val) => {
                            pushState();
                            updateStage(activeStage.id, { gridDensity: val });
                        }}
                        unit="px"
                    />

                    <SliderControl
                        label="Snap Strength"
                        value={activeStage.snapStrength}
                        onChange={(val) => {
                            pushState();
                            updateStage(activeStage.id, { snapStrength: val });
                        }}
                        icon="sensors_off"
                    />
                </Section>

                <Section title="Configuration" icon="tune">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Section Name</label>
                        <input
                            type="text"
                            value={activeStage.sectionLabel}
                            onChange={(e) => updateStage(activeStage.id, { sectionLabel: e.target.value })}
                            onBlur={() => pushState()}
                            className="w-full bg-[#0f1521] border border-white/5 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                            placeholder="e.g. Orchestra Section"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Default Seat Tier</label>
                        <div className="relative">
                            <select
                                value={activeStage.defaultTier}
                                onChange={(e) => {
                                    pushState();
                                    updateStage(activeStage.id, { defaultTier: e.target.value });
                                }}
                                className="w-full appearance-none bg-[#0f1521] border border-white/5 text-white rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm cursor-pointer hover:border-slate-500"
                            >
                                {tiers.map(tier => (
                                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-2.5 text-slate-500 material-symbols-outlined pointer-events-none text-lg">expand_more</span>
                        </div>
                    </div>
                </Section>

                <Section title="Dimensions" icon="aspect_ratio">
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                            label="Width"
                            value={activeStage.width}
                            onChange={(val) => {
                                pushState();
                                updateStage(activeStage.id, { width: val });
                            }}
                            unit="px"
                        />
                        <NumberInput
                            label="Depth"
                            value={activeStage.depth}
                            onChange={(val) => {
                                pushState();
                                updateStage(activeStage.id, { depth: val });
                            }}
                            unit="px"
                        />
                    </div>
                </Section>

                <ConstraintToggles
                    lockAspectRatio={activeStage.lockAspectRatio}
                    snapToGrid={activeStage.snapToGrid}
                    onChange={(key, val) => {
                        pushState();
                        updateStage(activeStage.id, { [key]: val });
                    }}
                />
            </div>
        </div>
    );
};
