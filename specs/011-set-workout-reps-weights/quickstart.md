# Quickstart: Set Workout Reps and Weights

This feature modifies the workout selection behavior during routine creation.

## Steps for Implementation
1. **Locate the Selection UI**: Find the component rendering the list of all available workouts when creating a routine.
2. **Intercept Selection**: Modify the `onPress` handler of the workout rows.
    - If the workout is already in `workoutStore.selectedWorkouts`, dispatch a removal action (deselect).
    - If not, set local state `setPendingWorkout({ workout, reps: "0", weight: "0" })`.
3. **Create Configuration Modal**: Build a `<RepWeightConfigModal>` component that renders when `pendingWorkout` is not null. Use `Modal` from React Native.
4. **Apply Dark Gym Style**: Implement it using `Colors.bgSurface` for the main card, neon green `Colors.accent` for the primary confirm button, and bold typography.
5. **Handle Inputs**: Add two text inputs restricted to numeric keyboards. Ensure they start at "0" and require valid positive numbers on submission.
6. **Submit**: On confirm, call `workoutStore.addSelectedWorkout({...pendingWorkout})` and clear the `pendingWorkout` state.
