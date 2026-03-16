# Data Model

## Entities

### `PendingWorkout`
*(Transient UI State)*
- `workout`: `Workout` (The underlying workout object tapped by the user)
- `reps`: `string` | `number` (The user input for reps, initially "0")
- `weight`: `string` | `number` (The user input for weight, initially "0")

### `RoutineWorkout` / `SelectedWorkout`
*(Global Store State, inside `workoutStore.ts`)*
- `id`: `string`
- `reps`: `number` (Confirmed value)
- `weight`: `number` (Confirmed value)
- `name`, `muscleGroup`, etc. (Properties needed for display in the pull-up bar)

## State Transitions
1. **Tap Workout (Not Selected)**: UI transitions to `PendingWorkout` state (Modal opens). Inputs default to "0".
2. **Tap Workout (Selected)**: Workout is removed from `RoutineWorkout` list in Zustand store.
3. **Cancel Modal**: `PendingWorkout` state cleared (null). Modal closes.
4. **Confirm Modal**: `PendingWorkout` mapped to `RoutineWorkout` format and added to `workoutStore`. `PendingWorkout` state cleared (null). Modal closes.
