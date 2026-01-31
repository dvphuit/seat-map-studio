import React from 'react';
import { useSeatStore } from '../../stores/seatStore';
import { useHistoryStore } from '../../stores/historyStore';
import { useTierStore } from '../../stores/tierStore';
import { useEditorStore } from '../../stores/editorStore';
import { DeleteButton } from './shared/DeleteButton';
import { NumberInput } from './shared/NumberInput';
import type { Seat } from '../../types';

interface SeatPropertiesProps {
    selectedSeats: Seat[];
}

export const SeatProperties: React.FC<SeatPropertiesProps> = ({ selectedSeats }) => {
    const { batchUpdate, updateSeat, deleteSeats } = useSeatStore();
    const { pushState } = useHistoryStore();
    const { activeStageId, clearSelection } = useEditorStore();
    const { tiers, addTier, updateTier, deleteTier } = useTierStore();

    if (selectedSeats.length === 0 || !activeStageId) return null;

    const isSingle = selectedSeats.length === 1;
    const firstSeat = selectedSeats[0];
    const activeTier = tiers.find(t => t.id === firstSeat.tier);

    // Check common values for multi-select
    const commonTierId = selectedSeats.every(s => s.tier === firstSeat.tier) ? firstSeat.tier : '';
    const commonStatus = selectedSeats.every(s => s.status === firstSeat.status) ? firstSeat.status : '';

    const handleSeatUpdate = (updates: Partial<Seat>) => {
        pushState();
        if (isSingle) {
            updateSeat(activeStageId, firstSeat.id, updates);
        } else {
            const batchUpdates: Record<string, Partial<Seat>> = {};
            selectedSeats.forEach(seat => {
                batchUpdates[seat.id] = updates;
            });
            batchUpdate(activeStageId, batchUpdates);
        }
    };

    const handleDelete = () => {
        pushState();
        deleteSeats(activeStageId, selectedSeats.map(s => s.id));
        clearSelection();
    };

    const handleAddTier = () => {
        addTier({
            name: 'New Tier',
            color: '#3b82f6',
            price: 100
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="space-y-5">
                {/* Row & Number */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Row</label>
                        <input
                            type="text"
                            value={isSingle ? (firstSeat.row || '') : ''}
                            placeholder={!isSingle ? 'Multiple' : 'G'}
                            onChange={(e) => handleSeatUpdate({ row: e.target.value })}
                            className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Number</label>
                        <input
                            type="text"
                            value={isSingle ? (firstSeat.number || '') : ''}
                            placeholder={!isSingle ? 'Multiple' : '14'}
                            onChange={(e) => handleSeatUpdate({ number: e.target.value })}
                            className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <div className="relative">
                        <select
                            value={commonStatus}
                            onChange={(e) => handleSeatUpdate({ status: e.target.value as any })}
                            className="w-full appearance-none bg-[#0a0f18] border border-white/5 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-sm cursor-pointer capitalize"
                        >
                            <option value="" disabled hidden>Select Status</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="hold">Hold</option>
                        </select>
                        <span className="absolute right-3 top-2.5 text-slate-500 material-symbols-outlined pointer-events-none text-lg">expand_more</span>
                    </div>
                </div>

                {/* Category Group */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                    {/* Row 1: Title + Label + Add */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                            {activeTier && (
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
                                    {activeTier.name}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleAddTier}
                            className="size-6 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                            title="Add Category"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>

                    {/* Row 2: Category List */}
                    <div className="bg-[#0a0f18] border border-white/5 rounded-2xl p-3">
                        <div className="flex flex-wrap gap-3">
                            {tiers.map((tier) => (
                                <div key={tier.id} className="relative group/tier">
                                    <button
                                        onClick={() => handleSeatUpdate({ tier: tier.id })}
                                        className={`size-8 rounded-full border-2 transition-all relative z-10 ${commonTierId === tier.id ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: tier.color }}
                                        title={tier.name}
                                    >
                                        {commonTierId === tier.id && (
                                            <div className="absolute -inset-1 border border-white/20 rounded-full animate-pulse" />
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Delete category "${tier.name}"?`)) {
                                                deleteTier(tier.id);
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 z-20 size-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/tier:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CRUD Details for Selected Category */}
                    {activeTier && (
                        <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                            {/* Row 3: Color Box */}
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</label>
                                <div className="flex items-center gap-3 bg-[#0a0f18] border border-white/5 rounded-xl px-3 py-1.5 min-w-[120px]">
                                    <div className="relative size-5 rounded-md overflow-hidden border border-white/10">
                                        <input
                                            type="color"
                                            value={activeTier.color}
                                            onChange={(e) => updateTier(activeTier.id, { color: e.target.value })}
                                            className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase">{activeTier.color}</span>
                                </div>
                            </div>

                            {/* Row 4: Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                                <input
                                    type="text"
                                    value={activeTier.name}
                                    onChange={(e) => updateTier(activeTier.id, { name: e.target.value })}
                                    className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                                    placeholder="Tier Name"
                                />
                            </div>

                            {/* Row 5: Price */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-slate-600 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={activeTier.price}
                                        onChange={(e) => updateTier(activeTier.id, { price: Number(e.target.value) })}
                                        className="w-full bg-[#0a0f18] border border-white/5 text-white rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                        label="Pos X"
                        value={isSingle ? Math.round(firstSeat.x) : ''}
                        onChange={() => { }}
                        readOnly
                        unit="px"
                        placeholder={!isSingle ? '-' : ''}
                    />
                    <NumberInput
                        label="Pos Y"
                        value={isSingle ? Math.round(firstSeat.y) : ''}
                        onChange={() => { }}
                        readOnly
                        unit="px"
                        placeholder={!isSingle ? '-' : ''}
                    />
                </div>

                {/* Accessibility Toggle */}
                <div className="bg-[#0a0f18] border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-200">Accessibility Features</span>
                        <span className="text-[10px] text-slate-500 font-medium">Wheelchair access</span>
                    </div>
                    <button
                        onClick={() => handleSeatUpdate({ isAccessible: !firstSeat.isAccessible })}
                        className={`w-12 h-6 rounded-full transition-all relative ${firstSeat.isAccessible ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'
                            }`}
                    >
                        <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${firstSeat.isAccessible ? 'left-7' : 'left-1'
                            }`} />
                    </button>
                </div>

                {/* Actions */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                    <button
                        className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-3.5 rounded-2xl font-bold text-xs hover:bg-blue-500/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                        Duplicate
                    </button>
                    <DeleteButton
                        onDelete={handleDelete}
                        label="Delete Seat"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};
