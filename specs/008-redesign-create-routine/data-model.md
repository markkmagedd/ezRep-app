# Data Model

Because this is purely a UI refactor within the client component state, the underlying data models `DraftRoutine`, `DraftDay`, and `DraftDayExercise` from `src/store/routineStore.ts` remain unchanged. 

## Modified Component State Rules

The local state management for the expandable bottom sheet on `CreateRoutineScreen.tsx` will add a toggle boolean:
- **`isSheetExpanded`** (boolean): Tracks whether the detailed view in the bottom sheet is opened.  
  - Opens on summary header press.
  - Closes automatically if specific logic triggers it or when pressing the summary header again.

The array of `days[activeDayIdx]?.exercises` from `useRoutineStore` is mapped via flex layout properties into the collapsible component.
