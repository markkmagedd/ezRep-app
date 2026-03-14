# Data Model: Exercise Selector Screen Redesign (007)

**Branch**: `007-redesign-exercise-selector` | **Phase**: 1

> No new persisted data entities are introduced. This redesign is a pure layout/UX change.
> The entities below document the existing runtime shapes that the screen depends on.

---

## Entities

### ExerciseRecord (read-only, from `useExerciseStore`)

| Field | Type | Description |
|-------|------|-------------|
| `exerciseId` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `targetMuscles` | `string[]` | Primary muscle groups |
| `equipments` | `string[] \| undefined` | Required equipment tags |

### SelectionBuffer (local component state)

| Field | Type | Description |
|-------|------|-------------|
| — | `ExerciseRecord[]` | Transient array of exercises selected in the current session |

**Lifecycle**:
- Created empty on screen mount
- Grows/shrinks as user taps exercise rows or tray remove buttons
- Discarded on back-navigation (screen unmounts)
- Committed to `workoutStore.addExercises()` on "Add Exercises" tap, then screen closes

### TrayAnimValue (local component ref)

| Field | Type | Description |
|-------|------|-------------|
| — | `Animated.Value` | Drives `translateY` of the bottom tray; `0` = fully visible, `TRAY_HEIGHT` = fully hidden (below screen) |

**State transitions**:
```
selectionBuffer.length: 0 → 1   →  Animate tray in  (translateY: TRAY_HEIGHT → 0)
selectionBuffer.length: 1 → 0   →  Animate tray out (translateY: 0 → TRAY_HEIGHT)
```

---

## No Schema / Firestore Changes

This feature does not modify any Firestore collections, documents, or security rules.
