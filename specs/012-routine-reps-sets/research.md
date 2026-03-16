# Phase 0: Research

Decision: Sets and Reps modal for routines will use a built-in React Native `Modal` with numerical inputs.
Rationale: Reusing existing dark theme variables ensures compatibility. The defaults of 3 sets and 10 reps are standard hyper-trophy values. Validating inputs directly before confirming ensures `target_sets` and `target_reps` are integers >= 1.
Alternatives considered: A swipeable bottom sheet was considered, but simple modals limit complexity while remaining responsive.

Decision: Zustand `routineStore` handles the addition.
Rationale: `routineStore` currently maintains `Routine` and `RoutineDay` contexts in memory during creation/editing. It should accept `target_sets` and `target_reps` alongside exercise ID without needing `target_weight_kg`.
Alternatives considered: React local state - rejected since `routineStore` is used to persist across components.
