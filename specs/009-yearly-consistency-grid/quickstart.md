# Quickstart: Testing the Yearly Consistency Grid

To verify the grid rendering and navigation:

1. Launch the Expo app locally (`npm run start --clear`).
2. Navigate to the **Home** tab in the bottom bar navigation.
3. Locate the 4-week Consistency Grid near the top. Ensure it is clickable.
4. Tap the widget. You should transition to a new full-screen route containing a 365-day grid.
5. In your `workoutSession` store, mock sessions for previous years (e.g., `2024` and `2025`).
6. Verify the year-switching tabs appear only for those populated years.
7. Switch between tabs and verify the grid dynamically renders that specific year.
