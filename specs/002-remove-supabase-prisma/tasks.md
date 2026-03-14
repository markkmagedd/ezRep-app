# Tasks: Remove Supabase and Prisma Files

**Input**: Design documents from `/specs/002-remove-supabase-prisma/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

N/A - This is a deletion/cleanup feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

N/A - This is a deletion/cleanup feature.

---

## Phase 3: User Story 1 - Clean up deprecated database integrations (Priority: P1) 🎯 MVP

**Goal**: As a developer, I want all Supabase and Prisma traces removed from the repository so that I don't get confused by stale code and unused dependencies now that the app uses Firebase.

**Independent Test**: Can be fully tested by searching the codebase for `supabase` and `prisma` keywords and finding 0 references in the application code, and verifying the application compiles.

### Implementation for User Story 1

- [x] T001 [P] [US1] Uninstall `@supabase/supabase-js`, `@prisma/client`, and `prisma` dependencies from `package.json` and `package-lock.json`
- [x] T002 [P] [US1] Delete the `src/lib/supabase.ts` file
- [x] T003 [P] [US1] Delete the `supabase/` directory at the repository root
- [x] T004 [P] [US1] Delete the `prisma/` directory at the repository root
- [x] T005 [US1] Scrub `supabase` and `prisma` keywords from comments in `src/store/sessionStore.ts` (e.g., lines 9, 246)
- [x] T006 [US1] Perform a final grep search to ensure 0 references to Supabase or Prisma remain in `src/` (excluding gitignored / specification docs)
- [x] T007 [US1] Compile the app (`npx expo export` or similar) to ensure the codebase remains valid after deletions

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T008 [P] Update `README.md` to remove any stale documentation regarding Supabase configuration or Prisma setup.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: Can start immediately
- **Polish (Final Phase)**: Depends on US1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Only story, can start immediately.

### Within Each User Story

- Deletions can be executed in parallel (T001 - T004).
- Dependency validation (T006, T007) must run after all deletions.

### Parallel Opportunities

- All cleanup commands (package uninstallation and directory removals) can be executed concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Execute package uninstalls and directory deletions.
2. Scrub documentation/comments.
3. Validate compilation and search strings.
4. Update `README.md`.
