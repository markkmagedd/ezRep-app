# Implementation Plan: Remove Supabase and Prisma Files

**Branch**: `002-remove-supabase-prisma` | **Date**: 2026-03-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-remove-supabase-prisma/spec.md`

## Summary

The goal of this feature is to clean up deprecated database integrations by completely removing all traces of Supabase and Prisma from the repository. The application has successfully migrated to Firebase, making the previous configurations, dependencies, and helper files unnecessary and confusing.

## Technical Context

**Language/Version**: TypeScript 5.1.3
**Primary Dependencies**: React Native 0.81.5, Expo SDK 54, Firebase 12.10.0
**Storage**: Firebase Firestore (replaces Prisma/Supabase)
**Testing**: App compilation verification
**Target Platform**: iOS and Android via Expo
**Project Type**: mobile-app
**Performance Goals**: N/A (Cleanup task)
**Constraints**: Zero regression on the newly established Firebase flow
**Scale/Scope**: ~3 files and 2 directories to remove, along with `package.json` updates.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Real-time Social Synchronization**: Validated. Removing Supabase enforces the exclusive use of Firebase Firestore for real-time listeners, removing ambiguity.
- **Principle IV: Strict TypeScript Discipline**: Validated. The removal process will ensure no dangling `any` types or broken imports are left in `src/types/index.ts` or other files.
- **Principle V: Atomic Component Architecture**: N/A (No UI changes).

## Project Structure

### Documentation (this feature)

```text
specs/002-remove-supabase-prisma/
├── spec.md              # Feature Specification
├── plan.md              # This file
├── research.md          # N/A (No unknowns)
└── quickstart.md        # N/A
```

### Source Code Modifications

The following structure changes will be implemented at the repository root:

```text
package.json      # [MODIFY] Uninstall @supabase/supabase-js, @prisma/client, prisma
src/
└── lib/
    └── supabase.ts # [DELETE] Remove Supabase client initialization entirely

supabase/         # [DELETE] Remove directory and schema.sql
prisma/           # [DELETE] Remove directory and schema.prisma
```

**Structure Decision**: We are strictly removing explicit dependencies, isolation files (`src/lib/supabase.ts`), and the framework specific folders (`supabase/`, `prisma/`). Code referencing these (if any remain) like sessionStore comments will also be scrubbed.

## Phase 0: Outline & Research

No `NEEDS CLARIFICATION` items were found during the technical context gathering. The codebase was checked via `grep_search` and the only remaining active Supabase traces are restricted to `src/lib/supabase.ts` and comments in `sessionStore.ts`.

## Phase 1: Design & Contracts

No data model changes or new contracts are needed as this is a removal task.
- `data-model.md`: Skipped
- `contracts/`: Skipped
- `quickstart.md`: Skipped
