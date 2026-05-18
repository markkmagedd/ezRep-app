# Quickstart: PR Spotlight Screen

This guide describes how to manually test the newly implemented PR Spotlight list.

## 1. Setup Data
- Launch the Expo app (`npx expo start --clear`).
- Ensure you are logged in (or navigate to Auth and log in to a development account).
- If your account has no workouts, log a new workout with a few strength exercises, adding varied weight amounts to the sets (e.g., 50kg Bench, 100kg Squat).
- **CRITICAL**: Finish the workout to trigger the doc save correctly and store the sets in the DB.

## 2. Navigating and Testing

**From the Home Screen**:
1. Check that the "PERSONAL BEST SPOTLIGHT" card renders at the bottom.
2. Tap the PR card.
3. You should be directed to a screen listing the newly calculated PRs based on the data you inputted, sorted alphabetically.

**From the Profile Screen**:
1. Navigate via the bottom tab to the "Profile" screen.
2. Locate the "Heaviest Lifts" (or similarly titled) action menu/button.
3. Tap it and verify the same PR list screen loads successfully.

**Edge Cases**:
- To test the empty state, you can log out and register a brand new account.
- Navigate to the PR screen using the Profile entry point (since the Home PR card itself might look empty). You should see an encouraging empty state message if no workouts have ever been logged.
