# Quickstart

## Getting Started

1. When the `HomeScreen` mounts, it must read the `lifetime_pr` object from the current user's profile state instead of iterating over `recentWorkouts` manually.
2. If `lifetime_pr` does not exist on the user profile, the client will fall back to retrieving all workouts for the user in the background, computing the highest PR (prioritizing the most recent on ties), saving it to the `user` document for future reads, and updating the UI.
3. Upon calling `finishWorkout` in the `useWorkoutStore`, the client's payload must check if the newly finished workout contains sets with a higher or equal weight than `user.lifetime_pr.weight_kg`.
4. If yes, it includes `lifetime_pr` in the user document update batch, making the PR perfectly synced with the backend effortlessly.
