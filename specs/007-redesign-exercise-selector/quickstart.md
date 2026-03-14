# Quickstart: Exercise Selector Screen Redesign (007)

**Branch**: `007-redesign-exercise-selector`

## What changed

`ExerciseSelectorScreen.tsx` is the **only file modified**. The layout is restructured from a floating-pile + absolute-button pattern to a clean 3-zone flex layout:

```
┌──────────────────────────────────┐
│  Search bar                      │  fixed height
│  Body-part filter chips          │  fixed height
│  Equipment filter chips          │  fixed height (when applicable)
├──────────────────────────────────┤
│  Exercise FlatList               │  flex: 1 — always fills remaining space
├──────────────────────────────────┤
│  Bottom Tray (animated, ~200ms)  │  slides in/out; fixed height
│   ├── Selected exercise chips    │  horizontal FlatList, scrollable
│   └── [Add (N) Exercises] btn    │
└──────────────────────────────────┘
```

## How to test locally

1. Ensure `npx expo start --clear` is running in `/Users/mark/Coding/ezRep-app`.
2. Press `i` to open the iOS Simulator.
3. Navigate: **Routines → [any routine] → Add Exercises**.
4. Test scenarios:
   - **No selection**: tray is hidden, full list visible.
   - **Select 1 exercise**: tray slides up (~200ms), chip appears, button shows "Add (1) Exercises".
   - **Select 5+ exercises**: chip row scrolls horizontally, list rows above remain fully visible and tappable.
   - **Remove a chip**: tap `×` on a tray chip → count decreases, list scroll position preserved.
   - **Remove all**: tray slides back down.
   - **Confirm**: tap "Add (N) Exercises" → screen closes, exercises added to workout.
   - **Cancel**: tap back → no exercises added.

## Key implementation details

- `Animated.Value(TRAY_HEIGHT)` is initialised hidden (below screen).
- `useEffect` watching `selectionBuffer.length` triggers `Animated.timing` to slide in/out.
- The `FlatList` uses `flex: 1` — the tray is a **sibling**, not a child or overlay.
- `contentContainerStyle` on the list removes the old `paddingBottom` workaround.

## No database / store changes

`workoutStore` and `exerciseStore` are unchanged. No Firestore rules updated.
