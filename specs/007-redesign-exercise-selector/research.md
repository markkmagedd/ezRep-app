# Research: Exercise Selector Screen Redesign (007)

**Branch**: `007-redesign-exercise-selector` | **Phase**: 0

---

## Decision 1 — Layout Pattern for Non-Overlapping Selection UI

**Decision**: Sticky bottom tray (clarified in spec Q1).

**Rationale**: React Native's flex layout guarantees non-overlap when all children are in normal flow. Using `flex: 1` on the `FlatList` combined with a fixed-height sibling tray below means no element can visually overlap another — the layout engine enforces it. By contrast, `position: absolute` (the current bug) is drawn outside the flow and is the root cause of the overlap.

**Alternatives considered**:
- Fixed top panel — would shrink the browse list by the tray height even with 0 selections; worse UX.
- Permanent split — wastes space on screen with 0 selections; appropriate for tablet, not phone.

---

## Decision 2 — Animation Approach

**Decision**: `Animated.Value` driving `translateY` on the tray view, with a `~200ms` ease-out spring/timing curve (clarified in spec Q2).

**Rationale**: React Native's built-in `Animated` API requires no extra dependency and integrates cleanly with the existing codebase. `translateY` animation is GPU-composited on iOS, giving smooth 60fps without layout recalculation. The alternative (`LayoutAnimation`) is simpler but less controllable and has known Android edge cases.

**Alternatives considered**:
- `react-native-reanimated` — more powerful but introduces a new dependency for a simple translation animation; overkill here.
- `LayoutAnimation` — simpler but applies globally and can cause unexpected side-effects on sibling list items.

---

## Decision 3 — Tray Height for Many Selections

**Decision**: Fixed-height tray; chip row uses horizontal `FlatList` (single row, scrollable). (Clarified in spec Q3.)

**Rationale**: A `FlatList` with `horizontal={true}` handles arbitrary item counts in a fixed-height container natively with no custom measurement logic. The "Add (N) Exercises" button label already communicates the total count, so a long horizontal chip list is complementary rather than essential — reducing cognitive load vs. a wrapping grid.

**Alternatives considered**:
- Two-row wrapping — requires measuring content height dynamically; complex and brittle across font sizes/device widths.
- Count-only (no chips) — reduces actionability; user loses ability to see/remove individual selections.

---

## Decision 4 — Animation Entry Point / State Trigger

**Decision**: Drive tray visibility from `selectionBuffer.length > 0` (existing local state). No store changes needed.

**Rationale**: The `selectionBuffer` is already a `useState<ExerciseRecord[]>` in the component. Watching its `.length` to trigger the animation is the simplest correct approach and avoids lifting state unnecessarily into `workoutStore`.

---

## Constitution Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Real-time Social Sync | ✅ Not affected | No Firestore or listener changes |
| II. Dark Gym UI & Aesthetics | ✅ Required | All tray elements use existing design tokens (`Colors`, `Spacing`, `Radius`, `Shadow`) |
| III. Rigid State Machines | ✅ Not affected | No state machine changes; `selectionBuffer` remains local component state |
| IV. Strict TypeScript Discipline | ✅ Required | All new code typed; no `any` |
| V. Atomic Component Architecture | ✅ Partial | Tray is inline in screen (acceptable for a screen-specific layout element; no reuse needed across app) |
