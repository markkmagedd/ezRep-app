# Tasks: Profile Photo Upload

**Input**: Design documents from `specs/016-profile-photo-upload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [X] T001 Install `expo-image-picker` dependency in `package.json`
- [X] T002 Update `firebase/storage` initialization in `src/services/firebase.ts` or app config.
- [X] T003 [P] Update `storage.rules` with the 5MB and path restriction rules.
- [X] T004 [P] Update `app.json` (or `app.config.ts`) to include the `expo-image-picker` plugin with appropriate usage description strings for Camera and Photo Library permissions.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement Firebase storage wrapper functions (`uploadProfilePhoto`, `deleteProfilePhoto`) in `src/services/storageService.ts`.
- [X] T006 Extend Firestore schema typing for `UserProfile` to include `profilePhotoUrl` in `src/types/index.ts`.
- [X] T007 Update Zustand `profileStore` in `src/stores/profileStore.ts` with optimistic UI methods `updateProfilePhoto(localUri)` and `removeProfilePhoto()`.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Add Profile Photo (Priority: P1) 🎯 MVP

**Goal**: Users want to personalize their profile by uploading an image from their device to represent themselves.

**Independent Test**: Can be fully tested by selecting an image from the library or camera, cropping it, and seeing it displayed on the profile.

### Implementation for User Story 1

- [X] T008 [P] [US1] Create or update the atomic `Avatar` component in `src/components/common/Avatar.tsx` to handle loading and rendering of `profilePhotoUrl`.
- [X] T009 [US1] Create the photo selection logic in `src/components/profile/PhotoEditor.tsx` using `expo-image-picker` with `aspect: [1, 1]`, `allowsEditing: true`, and client-side 5MB validation.
- [X] T010 [US1] Integrate `Avatar` and `PhotoEditor` components into `src/screens/profile/ProfileScreen.tsx`.
- [X] T011 [US1] Connect the photo selection output to `profileStore.updateProfilePhoto()` and handle loading states in the UI.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Remove or Change Profile Photo (Priority: P2)

**Goal**: Users who have already uploaded a photo want to change it to a different one or remove it completely to return to the default state.

**Independent Test**: Can be fully tested by modifying or deleting an existing profile photo.

### Implementation for User Story 2

- [X] T012 [P] [US2] Update `src/components/profile/PhotoEditor.tsx` action sheet to conditionally show a "Remove Photo" option if the user currently has a profile photo.
- [X] T013 [US2] Wire the "Remove Photo" option to call `profileStore.removeProfilePhoto()` and verify the `Avatar` reverts to its placeholder state.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T014 [P] Implement user-friendly error toast notifications in `src/screens/profile/ProfileScreen.tsx` for edge cases like permission denial and network upload failure.
- [X] T015 Verify the Dark Gym aesthetic compliance (`Colors.bg`, `Colors.bgSurface`) for the Action Sheet and loading indicators.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Integrates directly with US1 components, should follow US1

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational schema typing and backend API connections can run in parallel to UI layout tasks.
- The `Avatar` UI component can be implemented in parallel to the `PhotoEditor` logic hook.
