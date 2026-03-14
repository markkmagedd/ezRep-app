# Data Model: Fix Workout Selector UI and Selection Logic

## Local State: SelectionBuffer
The `SelectionBuffer` is an in-memory collection used during the exercise selection workflow on the `ExerciseSelectorScreen`.

| Attribute | Type | Description |
|-----------|------|-------------|
| selections | `ExerciseRecord[]` | Array of exercises selected but not yet added to the workout. |

### Relationships
- **ExerciseRecord**: Each item in the `SelectionBuffer` is a reference to an `ExerciseRecord` from the `EXERCISE_LIBRARY`.

### Validation Rules
- **Unique Selections**: A user cannot add the same exercise to the buffer twice.
- **Limit**: While the spec mentioned up to 20, the buffer does not have a strict hard limit but must remain visually constrained (FR-003).

## Workflow Transitions
1. **Selection**: User taps an exercise in the `ExerciseSelectorScreen` → Added to `SelectionBuffer`.
2. **Deselection**: User taps a chip in the `SelectionBuffer` or the same exercise in the library list → Removed from `SelectionBuffer`.
3. **Commitment**: User taps "Add (X) Exercises" → Each item in the `SelectionBuffer` is added to the `workoutStore` via `addExercise`.
4. **Cancellation**: User navigates back without tapping "Add" → `SelectionBuffer` is cleared and no changes are persisted.
