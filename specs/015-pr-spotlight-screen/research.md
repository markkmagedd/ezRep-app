# Research: PR Spotlight Screen

## Research Topics

### 1. Data Fetching Strategy for Historical PRs
**Context**: The app currently only tracks the single `lifetime_pr` on the User Profile doc. The new requirement asks to display the heaviest lift for *every* exercise the user has ever performed. Since Firestore isn't naturally suited for "GROUP BY MAX()" queries on the client side, we need a way to build this list.

**Decision**: Calculate the PRs on the client by fetching all historical workouts and aggregating them. We will add a new action to the Zustand `workoutStore` (e.g. `loadAllExercisePRs`) that runs once and stores the resultant `ExercisePR[]` in state.
**Rationale**: 
1. `useWorkoutStore` already has a `recalculateLifetimePR` function which pulls all completed workouts. We can re-use this same query shape.
2. The alternative of maintaining a separate top-level `prs` subcollection in Firestore requires substantial schema migration and dual-writing on every workout finish. Client-side aggregation is much safer for a purely read-based feature and avoids complex migration.
**Alternatives considered**:
- Creating a `prs` subcollection under the `users` doc and updating it every time a workout finishes. Rejected because it increases write complexity and risk of desynchronization.
- Firebase Cloud Function to aggregate and store the map. Rejected as overkill for the current scale.

### 2. UI Component for the List View
**Context**: We need to display an alphabetical list of PRs.
**Decision**: Use React Native's `FlatList`, utilizing existing atomic design tokens (`Card`, fonts from `theme.ts`, `Ionicons`).
**Rationale**: `FlatList` is highly performant for long lists and matches React Native best practices.

### 3. Entry Points
**Context**: Required to be accessible from Home Screen's PR Spotlight card and Profile Screen.
**Decision**: 
- Wrap the existing UI code in `HomeScreen.tsx` representing the PR card in a `<TouchableOpacity>` that navigates to the new `PRSpotlight` screen.
- Add a new Option button directly in `ProfileScreen.tsx` that also navigates to the `PRSpotlight` screen.
**Rationale**: Both screens are part of the main application flow, making navigation updates straightforward by registering the new screen in the navigation parameter types.
