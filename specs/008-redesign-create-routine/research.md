# Technical Research

## Bottom Sheet Component

**Decision**: Build an explicit bottom sheet-style expandable component using `Animated.View` inside of `CreateRoutineScreen.tsx` with a bottom `sticky` Create Routine button instead of adopting the `@gorhom/bottom-sheet` component.
**Rationale**: 
- `gorhom/bottom-sheet` requires complex `GestureHandler` setups in the `app/_layout` or absolute placement over everything, which often breaks on screens with `KeyboardAvoidingView` on iOS due to height shifts.
- A custom `Animated.View` with an animated height allows us to insert the expanding tray directly into the Flex layout. This avoids overlaps, perfectly shrinks the `flex: 1` `ExerciseList` gracefully above the sheet, and guarantees the sticky bottom button is always in the correct safe area without hacking absolute positioning bounds.
**Alternatives considered**: 
- Using `@gorhom/bottom-sheet` (disqualified because of potential instability with `KeyboardAvoidingView` conflicts unless rigorously tested).
- Using `Modal` component (disqualified as the user needs to still see the main list to browse concurrently while the sheet is minimally visible).

## Unwanted Empty Gaps Fix

**Decision**: Remove all nesting `flex` containers like `<View style={{ flex: 1 }}>` around filters or lists, and drop margins that cause mysterious visual bugs. Let `ExerciseSearchBar`, `MuscleGroupFilter`, and `ExerciseList` be direct children of the parent container so flex properties distribute effectively.
**Rationale**: Eliminates hidden gaps created by invisible zero-height padding or parent constraints.
**Alternatives considered**: Setting absolute heights or nested paddings.

