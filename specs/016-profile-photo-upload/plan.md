# Implementation Plan: Profile Photo Upload

**Branch**: `016-profile-photo-upload` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/016-profile-photo-upload/spec.md`

## Summary

Enable users to upload a custom profile picture either using their device camera or selecting an existing photo from their gallery. The implementation will utilize native Expo modules to enforce square cropping (1:1 aspect ratio) and Firebase Storage to persistently store the image under a strict 5 MB file size limit enforced via Cloud Security Rules.

## Technical Context

**Language/Version**: TypeScript 5.x + React Native + Expo (SDK 54)
**Primary Dependencies**: `expo-image-picker`, `@react-native-firebase/storage` (or Expo standard `firebase/storage`)
**Storage**: Firebase Storage (for profile images), Firestore (for storing the image reference URL)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS and Android
**Project Type**: Mobile Application
**Performance Goals**: Image upload completion < 1 minute
**Constraints**: 5 MB maximum file size limit, 1:1 image square cropping limit
**Scale/Scope**: Impacts all authenticated users on their user profile screens.

## Constitution Check

*GATE: Passed*

- **I. Real-time Social Synchronization**: Photo uploads don't block the social sync workflow.
- **II. High-Contrast "Dark Gym" UI**: All confirmation dialogs, activity indicators during upload, and action sheets will use dark gym styling components defined in `src/constants/theme.ts`.
- **III. Rigid State Machines**: The upload success/failure lifecycle will be modeled correctly via Zustand before firing remote changes.
- **IV. Strict TypeScript Discipline**: `ProfileState` correctly typed in `src/types/index.ts`.
- **V. Atomic Component Architecture**: Will wrap the profile image inside standard UI atomic views, avoiding ad-hoc screen styling logic.

## Project Structure

### Documentation (this feature)

```text
specs/016-profile-photo-upload/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Not applicable
└── tasks.md             # To be created next phase
```

### Source Code

```text
src/
├── components/
│   ├── common/
│   │   └── Avatar.tsx      # Presentational photo UI
│   └── profile/
│       └── PhotoEditor.tsx # The stateful action picker
├── screens/
│   └── profile/
│       └── ProfileScreen.tsx # Screen to coordinate action
├── stores/
│   └── profileStore.ts     # Extend state for photoUrl
└── services/
    └── storageService.ts   # Shared wrapper for firestore/storage

storage.rules               # Updated Firebase storage configuration
```

**Structure Decision**: Integrated directly into the existing mobile frontend project utilizing atomic components and global state.

## Complexity Tracking

No constitution violations detected. Complexity is minimal given standard libraries constraint parameters.
