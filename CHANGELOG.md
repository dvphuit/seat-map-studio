# Changelog

## [Unreleased]
### Added
- Initial project setup with Vite + React + TypeScript.
- Tech stack: Konva, Zustand, TailwindCSS, Zod.
- Undo/Redo support for Shape, Terrain, and Text tools.
- Auto-switch to Select tool when clicking outside stage bounds.
- Stage Boundary Constraints (Clamping) for all Drawing and Moving actions.
- Real-time Grid Snapping while dragging objects (Seats, Shapes, Text, Terrain).

### Fixed
- Infinite re-render loop (Maximum update depth) in EditorCanvas.
