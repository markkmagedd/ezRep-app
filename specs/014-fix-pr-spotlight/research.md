# Phase 0: Research

## Firestore Aggregation for All-Time PR

- **Decision**: Store the all-time personal best (lifetime PR) inside the user's profile document (`users/{uid}`) and update it upon finishing a workout.
- **Rationale**: Firestore does not support native MAX() aggregations on embedded array fields (like `sets.weight_kg` inside `exercises` inside `workouts`). Fetching the entire workout history on the client on every Home screen load to compute the PR violates performance criteria (SC-002: <1s load times). By caching `lifetime_pr: { weight_kg: number, exercise_name: string, achieved_at: string }` on the user profile, reading the PR is instantaneous and scalable regardless of workout history size.
- **Alternatives considered**: 
  - *Client-side full history scan*: Ruled out due to N-read scaling costs and performance degradation over time as the user logs hundreds of workouts.
  - *Serverless function (Cloud Function)*: Ruled out because we want to maintain real-time offline-first capabilities where the client manages the calculation cleanly inside `finishWorkout`.

## Backfilling Existing Data (One-Time Scan)

- **Decision**: For users without a cached `lifetime_pr`, we will lazily compute it on the client on application load the first time, and then save it to the user document.
- **Rationale**: Avoids writing an external migration script. We just scan all workouts if the field is missing.
- **Alternatives considered**: Writing a Node.js admin migration script (too complex for a simple PR fix and unnecessary if the client can do a one-time calculation safely).
