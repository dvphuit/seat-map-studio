# Lasso Selection Bug Fix

## 🐛 Problem

**Issue:** Cannot select seats when starting lasso selection (region selection) from outside the stage bounds.

### User Report:
> "Tôi không thể select được bất kỳ ghế nào khi tôi tạo 1 region ra khỏi stage"

### Root Cause:

In `EditorCanvas.tsx`, the `handleStageClick` function was preventing lasso selection from working when started outside stage bounds:

```typescript
// OLD CODE - Line 122-134
if (isOutside) {
    if (activeTool !== 'select') {
        setTool('select');
    } else {
        clearSelection();  // ❌ This clears selection!
    }
    return; // ❌ This prevents lasso from working!
}
```

**What happened:**
1. User clicks outside stage to start lasso selection
2. `handleStageClick` detects click is outside (`isOutside = true`)
3. Code calls `clearSelection()` and returns early
4. Lasso selection handlers never get a chance to run
5. No seats get selected!

## ✅ Solution

### 1. Added Debug Logging to Lasso Selection

**File:** `src/hooks/useLassoSelection.ts`

Added logging to track lasso selection lifecycle:

```typescript
handleMouseDown: () => {
    console.log('[DEBUG:SELECT_REGION] Starting lasso selection');
    // ... start lasso
}

handleMouseUp: () => {
    console.log('[DEBUG:SELECT_REGION] Completing lasso selection', { selectionBox });
    // ... calculate intersections
    console.log('[DEBUG:SELECT_REGION] Lasso selection found seats', { 
        count, 
        seatIds 
    });
}
```

### 2. Fixed Click Handler Logic

**File:** `src/components/canvas/EditorCanvas.tsx`

Modified `handleStageClick` to allow lasso selection from outside stage:

```typescript
// NEW CODE - Line 122-137
if (isOutside) {
    // ✅ If we have a selection box, we're doing lasso selection
    // Don't clear selection or return early - let lasso complete
    if (selectionBox) {
        return; // Let lasso selection handle this
    }

    if (activeTool !== 'select') {
        setTool('select');
    } else {
        // Only clear if NOT dragging seats
        if (!isDraggingSeat) {
            clearSelection();
        }
    }
    return;
}
```

### Key Changes:
1. **Check for `selectionBox`** - If it exists, lasso selection is active
2. **Return early** - Let lasso handlers process the event
3. **Don't clear selection** - Preserve selection during lasso operation

## 🎯 How It Works Now

### Scenario 1: Start Lasso from Outside Stage
```
1. User clicks outside stage (mousedown)
   → handleLassoDown creates selectionBox
   
2. User drags mouse (mousemove)
   → handleLassoMove updates selectionBox
   → Selection box is visible
   
3. User releases mouse (mouseup)
   → handleStageClick checks: selectionBox exists? YES
   → Returns early, lets lasso complete
   → handleLassoUp calculates intersections
   → Seats are selected! ✅
```

### Scenario 2: Click Outside to Deselect
```
1. User has seats selected
2. User clicks outside stage (quick click, no drag)
   → No selectionBox created (no drag)
   → handleStageClick: selectionBox? NO
   → Calls clearSelection()
   → Selection cleared ✅
```

### Scenario 3: Drag Seats and Release
```
1. User drags seats
   → isDraggingSeat = true
   
2. User releases mouse
   → handleStageClick: isDraggingSeat? YES
   → Does NOT clear selection
   → Seats remain selected ✅
```

## 🧪 Testing

### Test Case 1: Lasso from Outside Stage
1. Click outside stage boundary (in the black area)
2. Drag into stage area, covering some seats
3. Release mouse

**Expected:**
- ✅ Selection box appears
- ✅ Seats within box are selected
- ✅ Console shows lasso logs

**Console Output:**
```
[DEBUG:SELECT_REGION] Starting lasso selection
[DEBUG:SELECT_REGION] Completing lasso selection
[DEBUG:SELECT_REGION] Lasso selection found seats {count: 5, seatIds: [...]}
[DEBUG:SELECT_REGION] Selecting seats {count: 5, ...}
```

### Test Case 2: Lasso Entirely Outside Stage
1. Click outside stage
2. Drag entirely in black area (no seats)
3. Release mouse

**Expected:**
- ✅ Selection box appears
- ✅ No seats selected (count: 0)
- ✅ Previous selection is cleared

### Test Case 3: Lasso from Inside to Outside
1. Click inside stage
2. Drag outside stage boundary
3. Release mouse outside

**Expected:**
- ✅ Selection box appears
- ✅ Seats within box are selected
- ✅ Works normally

## 📊 Debug Logs Reference

### Lasso Selection Logs:
```
[DEBUG:SELECT_REGION] Starting lasso selection
{
  timestamp: "2026-02-01T14:55:00.000Z"
}

[DEBUG:SELECT_REGION] Completing lasso selection
{
  selectionBox: { x: -50, y: 100, width: 200, height: 150 },
  timestamp: "2026-02-01T14:55:01.000Z"
}

[DEBUG:SELECT_REGION] Lasso selection found seats
{
  count: 8,
  seatIds: ["seat-1", "seat-2", "seat-3", "seat-4", "seat-5"]
}

[DEBUG:SELECT_REGION] Selecting seats
{
  seatIds: [...],
  count: 8,
  timestamp: "2026-02-01T14:55:01.001Z"
}
```

## 🎨 Visual Flow

```
┌─────────────────────────────────────┐
│  BLACK AREA (Outside Stage)         │
│                                      │
│  1. Click here to start lasso       │
│     ↓                                │
│  ┌──────────────────────────┐       │
│  │  STAGE                   │       │
│  │  2. Drag into here       │       │
│  │     ↓                    │       │
│  │  [●] [●] [●]  ← Seats    │       │
│  │  [●] [●] [●]             │       │
│  │                          │       │
│  └──────────────────────────┘       │
│                                      │
│  3. Release mouse                    │
│     → Seats selected! ✅             │
└─────────────────────────────────────┘
```

## 🔧 Related Files Modified

1. **`src/hooks/useLassoSelection.ts`**
   - Added debug logging
   - Exposed `isSelecting` flag (later removed as unnecessary)

2. **`src/components/canvas/EditorCanvas.tsx`**
   - Modified `handleStageClick` to check `selectionBox`
   - Allow lasso to complete when started from outside

## ✨ Summary

**Before:** Lasso selection failed when started from outside stage
**After:** Lasso selection works from anywhere, including outside stage bounds

**Key Insight:** The `selectionBox` state is the perfect indicator of active lasso selection. By checking it before clearing selection, we allow lasso to complete while still supporting click-to-deselect behavior.
