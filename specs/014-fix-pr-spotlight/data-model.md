# Phase 1: Data Model & Contracts

## Entities

### `User` (Profile Document)
Path: `users/{uid}`

**New Fields:**
- `lifetime_pr` (Object | null): Caches the user's best lift.
  - `weight_kg` (Number): The heaviest weight lifted.
  - `exercise_name` (String): Name of the exercise for this PR.
  - `achieved_at` (String - ISO 8601): When this PR was achieved.

**State Transitions:**
- When a user finishes a workout (`finishWorkout` in Zustand store), the app compares the workout's heaviest set against `user.lifetime_pr.weight_kg`.
- If the new weight is `>` or `==` (greater than or equal to, per the tie-breaker requirement "most recently performed"), the user document is updated with the new PR details.

### `Workout` (existing)
Path: `users/{uid}/workouts/{workoutId}`
- Embedded `exercises` array containing `sets`.
- `sets` have `weight_kg` (Number).

## Validation Rules

- `lifetime_pr.weight_kg` must be a positive number.
- `lifetime_pr.achieved_at` should be an ISO date string or Firestore Timestamp.

## Interfaces

There are no public facing APIs, but the Zustand store `useAuthStore` or a separate hook will need to observe the user profile document (or ensure it's loaded to hydrate `lifetime_pr`) to display the PR on the `HomeScreen`. We might need to extend `AuthStore` or `WorkoutStore` to query the user profile if it's not already fully cached.
