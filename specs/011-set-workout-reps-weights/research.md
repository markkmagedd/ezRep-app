# Research

## Centered Modal Overlay in React Native
- **Decision**: Use a React Native `<Modal transparent={true} animationType="fade">` with a semi-transparent dark backdrop overlay to house the UI for setting reps and weight.
- **Rationale**: This is the most reliable cross-platform method to show an overlay on top of all other elements (including existing Modals or bottom sheets) without battling z-index bugs in React Native.
- **Alternatives considered**: Absolute positioning of a View. Rejected due to potential z-indexing issues if the workout list itself is within a BottomSheet or ScrollView.

## Temporary State Management
- **Decision**: Manage the intermediate configuration state via `useState<PendingWorkout | null>(null)` within the container component of the workout list, rather than polluting the global store.
- **Rationale**: The input reps and weight are transient data. If the user cancels the modal, the data is discarded instantly. Once the user clicks "Confirm", the completed `RoutineWorkout` object is pushed into the `workoutStore`.
- **Alternatives considered**: Adding a "pending" list in Zustand. Rejected because it adds unnecessary global state bloat for an isolated UI interaction.
