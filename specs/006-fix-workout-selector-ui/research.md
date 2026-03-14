# Research: Fix Workout Selector UI and Selection Logic

## Decision: Horizontal Scrollable Selection Pile
**Rationale**: FR-003 requires a horizontal scrollable bar that never exceeds the height of a single chip row. `FlatList` with `horizontal={true}` and `showsHorizontalScrollIndicator={false}` is the most performant and idiomatic way to handle this in React Native. It allows for dynamic addition/removal of items with smooth animations if needed.

## Decision: Local Selection Buffer State
**Rationale**: The specification defines `SelectionBuffer` as a temporary list before formal commitment. Implementing this as a local `useState<ExerciseRecord[]>` within `ExerciseSelectorScreen` is cleaner than immediate store updates, as it avoids polluting the global state with unconfirmed or accidental selections.

## Decision: Spacing and Layout Adjustment
**Rationale**: FR-001 and FR-002 require consistent spacing and specific placement (below search, above list). We will adjust `styles.searchRow` to use `marginBottom: Spacing.sm` and add a dedicated container for the selection pile with `marginHorizontal: Spacing.md` and `marginBottom: Spacing.md` to ensure the 16dp gap is maintained visually between sections.

## Decision: Dark Gym Chip Styling for Selection Pile
**Rationale**: Adhering to Principle II, the selected exercise chips will use:
- `backgroundColor: Colors.bgSurface`
- `borderColor: Colors.border` (or `Colors.accent` for a more highlighted "selected" look)
- `borderRadius: Radius.pill`
- Interactive removal on press (FR-004).

## Alternatives Considered:
- **Immediate Store Updates**: Rejected because it complicates the "Cancel" or "Undo" flow for the user if they decide not to add the exercises.
- **Vertical Wrap for Selection**: Rejected per user feedback that a "pile" covering the screen is undesirable; horizontal scroll maintains visibility of the exercise library (FR-002).
