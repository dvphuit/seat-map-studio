# Debug Event Logging System

This document describes the comprehensive debug logging system added to track three key operations:

## 1. 🎨 Draw Seats (DRAW_SEATS)

**Location:** `src/stores/seatStore.ts`

### Events Logged:

#### Single Seat Addition
```
[DEBUG:DRAW_SEATS] Adding single seat
{
  stageId: string,
  position: { x: number, y: number },
  tier: string,
  label: string,
  timestamp: ISO string
}
[DEBUG:DRAW_SEATS] Single seat added successfully
```

#### Multiple Seats Addition
```
[DEBUG:DRAW_SEATS] Adding multiple seats
{
  stageId: string,
  count: number,
  firstSeat: { x, y, label },
  lastSeat: { x, y, label },
  timestamp: ISO string
}
[DEBUG:DRAW_SEATS] Multiple seats added successfully
```

## 2. 🎯 Select Seats with Region (SELECT_REGION)

**Location:** `src/stores/editorStore.ts`

### Events Logged:

#### Select Seats (Replace Selection)
```
[DEBUG:SELECT_REGION] Selecting seats
{
  seatIds: string[],
  count: number,
  timestamp: ISO string
}
```

#### Add to Selection (Multi-select)
```
[DEBUG:SELECT_REGION] Adding to selection
{
  addedIds: string[],
  addedCount: number,
  previousCount: number,
  newCount: number,
  timestamp: ISO string
}
```

#### Clear Selection
```
[DEBUG:SELECT_REGION] Clearing selection
{
  timestamp: ISO string
}
```

## 3. 🚚 Move Selected Seats (MOVE_SEATS)

**Location:** `src/hooks/useSeatDrag.ts`

### Events Logged:

#### Drag Start
```
[DEBUG:MOVE_SEATS] ========== DRAG START ==========
[DEBUG:MOVE_SEATS] Drag initiated
{
  draggedSeatId: string,
  selectedSeatIds: string[],
  isInSelection: boolean,
  totalSeatsInStage: number,
  selectedCount: number,
  timestamp: ISO string
}

// If seat not in selection:
[DEBUG:MOVE_SEATS] ❌ Dragged seat not in selection, aborting drag

// If successful:
[DEBUG:MOVE_SEATS] ✅ Initial positions recorded
{
  seatCount: number,
  positions: Array<{ id, x, y }> // First 3 seats
}
```

#### Drag Move (During Dragging)
```
[DEBUG:MOVE_SEATS] Drag move
{
  draggedId: string,
  currentPos: { x, y },
  snappedPos: { x, y },
  initialPos: { x, y },
  rawDelta: { dx, dy }
}

// If bounds clamping occurs:
[DEBUG:MOVE_SEATS] ⚠️  Delta clamped to bounds
{
  groupBounds: { minX, maxX, minY, maxY },
  stageBounds: { stageMinX, stageMaxX, stageMinY, stageMaxY },
  clampedDelta: { dx, dy },
  originalDelta: { dx, dy }
}
```

#### Drag End
```
[DEBUG:MOVE_SEATS] ========== DRAG END ==========
[DEBUG:MOVE_SEATS] Drag ended
{
  isDragging: boolean,
  activeStageId: string,
  initialPositionIds: string[],
  timestamp: ISO string
}

[DEBUG:MOVE_SEATS] Raw Delta: { dx, dy }
[DEBUG:MOVE_SEATS] Clamped Delta: { dx, dy }

[DEBUG:MOVE_SEATS] ✅ Final updates to apply
{
  updateCount: number,
  sampleUpdates: Array<{ id, x, y }> // First 3 seats
}

[DEBUG:MOVE_SEATS] ✅ batchUpdate called successfully
[DEBUG:MOVE_SEATS] ========== DRAG COMPLETE ==========
```

## How to Use

### 1. Open Browser Console
Open your browser's developer tools (F12) and go to the Console tab.

### 2. Filter Logs
Use the console filter to show only specific debug categories:
- `DEBUG:DRAW_SEATS` - See seat drawing operations
- `DEBUG:SELECT_REGION` - See selection operations
- `DEBUG:MOVE_SEATS` - See seat movement operations

### 3. Common Debugging Scenarios

#### Problem: Seats not appearing after drawing
**Filter:** `DEBUG:DRAW_SEATS`
**Look for:**
- Verify seat positions are valid numbers
- Check if "added successfully" message appears
- Verify stageId matches your active stage

#### Problem: Selection not working
**Filter:** `DEBUG:SELECT_REGION`
**Look for:**
- Check if seatIds array is populated
- Verify count matches expected number
- Look for selection clearing unexpectedly

#### Problem: Seats jumping or not moving correctly
**Filter:** `DEBUG:MOVE_SEATS`
**Look for:**
- Check if "DRAG START" appears when you start dragging
- Look for "Delta clamped to bounds" warnings
- Verify final positions in "Final updates to apply"
- Check if batchUpdate is called successfully

### 4. Advanced Debugging

You can also combine filters:
```
DEBUG:MOVE_SEATS | DEBUG:SELECT_REGION
```

Or search for specific symbols:
- `❌` - Errors or aborted operations
- `⚠️` - Warnings (like bounds clamping)
- `✅` - Successful operations

## Performance Notes

- **DRAW_SEATS**: Minimal overhead, logs only on seat creation
- **SELECT_REGION**: Minimal overhead, logs only on selection changes
- **MOVE_SEATS**: Moderate overhead during dragging (logs on every move event)
  - Consider disabling drag move logs in production if performance is critical
  - Drag start/end logs are always useful and have minimal impact

## Removing Debug Logs

To remove debug logs in production, you can:

1. Use a build-time flag to strip console.log statements
2. Replace `console.log('[DEBUG:` with a custom debug function that checks an environment variable
3. Use a bundler plugin to remove debug statements

Example custom debug function:
```typescript
const debug = (category: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG:${category}] ${message}`, data);
  }
};
```
