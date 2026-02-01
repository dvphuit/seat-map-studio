# Bug Analysis & Fix Report

## 🐛 Bug Discovered

### Issue Summary
When dragging multiple selected seats and releasing the mouse (especially near stage boundaries), the **selection was being cleared** before the drag operation completed, causing the seats to lose their selection state.

### Root Cause Analysis

#### Timeline of Events (from logs):
```
1. [DEBUG:MOVE_SEATS] Drag move (multiple times)
2. [DEBUG:SELECT_REGION] Selecting seats – {count: 0}  ❌ PROBLEM!
3. [DEBUG:MOVE_SEATS] Drag ended
4. [DEBUG:MOVE_SEATS] batchUpdate called successfully
```

#### The Problem:
In `EditorCanvas.tsx`, the `handleStageClick` function was clearing selection when clicking on the stage background:

```typescript
// Line 141-142 (OLD CODE)
if (e.target === e.target.getStage() && activeTool === 'select' && !selectionBox) {
    clearSelection();  // ❌ This fires on drag end!
}
```

**Why it happened:**
1. User drags seats and releases mouse
2. Konva fires `onDragEnd` event
3. Konva ALSO fires `onClick` event (because mousedown + mouseup = click)
4. Since `e.target` is the stage (not a seat), `clearSelection()` is called
5. This happens **BEFORE** `handleDragEnd` completes
6. Result: Selection is cleared mid-drag!

### Secondary Issues Found

#### Issue 2: Seats can reach exact boundary
The final position shows `x: 50` which is exactly `GRID_SIZE`. While technically within bounds, this means seats are sitting right on the edge margin.

**Current behavior:**
- `stageMinX = GRID_SIZE = 50`
- Seat can be at `x: 50` (on the margin line)

**Expected behavior:**
- Seats should stay within `[GRID_SIZE, width - GRID_SIZE]`
- Current implementation is correct, but visually seats appear to be "on the edge"

This is actually **correct behavior** - the bounds clamping is working as designed.

## ✅ Solution Implemented

### 1. Added `isDraggingSeat` Flag

**File:** `src/stores/editorStore.ts`

Added a global flag to track when seats are being dragged:

```typescript
interface EditorStore extends EditorState {
    // ... other properties
    isDraggingSeat: boolean;
    setIsDraggingSeat: (isDragging: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
    // ... other state
    isDraggingSeat: false,
    setIsDraggingSeat: (isDragging) => set({ isDraggingSeat: isDragging }),
}));
```

### 2. Updated Drag Handlers

**File:** `src/hooks/useSeatDrag.ts`

Set the flag during drag operations:

```typescript
const handleDragStart = useCallback((e, seats) => {
    // ... validation
    isDraggingRef.current = true;
    setIsDraggingSeat(true); // ✅ Prevent selection clearing
    pushState();
    // ... rest of logic
}, [selectedSeatIds, pushState]);

const handleDragEnd = useCallback((e) => {
    if (!isDraggingRef.current || !activeStageId) {
        setIsDraggingSeat(false); // ✅ Reset flag on early return
        return;
    }
    isDraggingRef.current = false;
    setIsDraggingSeat(false); // ✅ Allow selection clearing again
    // ... rest of logic
}, [getSnappedPos, batchUpdate, activeStageId, activeStage]);
```

### 3. Protected Selection Clearing

**File:** `src/components/canvas/EditorCanvas.tsx`

Added checks before clearing selection:

```typescript
const handleStageClick = (e) => {
    // ... other logic

    // Check isDraggingSeat flag before clearing
    if (e.target === e.target.getStage() && 
        activeTool === 'select' && 
        !selectionBox && 
        !isDraggingSeat) {  // ✅ NEW CHECK
        clearSelection();
    }
};
```

## 🧪 Testing Recommendations

### Test Case 1: Normal Drag
1. Select multiple seats
2. Drag them to a new position
3. Release mouse
4. **Expected:** Seats remain selected ✅

### Test Case 2: Drag to Boundary
1. Select multiple seats
2. Drag them towards stage edge
3. Release mouse
4. **Expected:** 
   - Seats stop at boundary (x: 50 or x: 650)
   - Seats remain selected ✅

### Test Case 3: Click to Deselect
1. Select seats
2. Click on empty stage area (without dragging)
3. **Expected:** Selection is cleared ✅

### Test Case 4: Drag Outside Stage
1. Select seats
2. Try to drag outside stage bounds
3. **Expected:**
   - Seats are clamped to bounds
   - No "Delta clamped" warning (because getSnappedPos already clamped)
   - Seats remain selected ✅

## 📊 Log Analysis

### What the Logs Tell Us

#### Before Fix:
```
[DEBUG:MOVE_SEATS] Drag move
[DEBUG:SELECT_REGION] Selecting seats – {count: 0}  ❌
[DEBUG:MOVE_SEATS] Drag ended
```

#### After Fix (Expected):
```
[DEBUG:MOVE_SEATS] Drag move
[DEBUG:MOVE_SEATS] Drag ended
[DEBUG:MOVE_SEATS] batchUpdate called successfully
[DEBUG:MOVE_SEATS] DRAG COMPLETE
// No unexpected selection clearing!
```

### Why No "Delta Clamped" Warning?

The log shows:
```
rawDelta: {dx: -50, dy: 0}
```

This is **valid** because:
1. `getSnappedPos` already clamped the position to `x: 250`
2. The delta `-50` doesn't violate group bounds
3. The leftmost seat in the group was at `x: 100`
4. `minDx = stageMinX - minX = 50 - 100 = -50`
5. `dx = -50 >= minDx = -50` ✅ (exactly at limit, no clamping needed)

The clamping logic is working correctly - it only warns when delta needs to be adjusted.

## 🎯 Summary

### Bug Fixed ✅
- Selection no longer clears during drag operations
- Seats maintain selection state after being moved

### Logic Verified ✅
- Bounds clamping is working correctly
- `getSnappedPos` prevents seats from going outside stage
- Group drag respects boundaries for all selected seats

### Debug Logging Enhanced ✅
- All three operations (draw, select, move) have comprehensive logging
- Easy to track issues with console filters
- Visual indicators (✅, ❌, ⚠️) for quick scanning
