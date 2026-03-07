# ezRep 🏋️

**A real-time social gym workout tracker built with React Native + Expo + Supabase.**

Train solo or create a shared **Session** and compete rep-for-rep with your gym crew in real time.

---

## Features

| Feature             | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| Solo Workout Logger | Track exercises, sets, reps, and weight with a built-in rest timer                     |
| Real-time Sessions  | Create a 6-char code room. Teammates join and see each other's sets live               |
| Post-Session Stats  | Head-to-head volume comparison, per-exercise breakdown, winner + hardest trainer badge |
| Exercise Library    | 25+ exercises across 8 categories with search and filter                               |
| Dark Gym UI         | Electric lime accent, high-contrast design built for the gym floor                     |

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | React Native 0.73 + Expo SDK 50                 |
| Navigation     | React Navigation 6 (native-stack + bottom-tabs) |
| State          | Zustand 4.5                                     |
| Backend / Auth | Supabase (PostgreSQL + Auth + Realtime)         |
| Realtime       | Supabase Realtime **Broadcast** channels        |
| Storage        | expo-secure-store (auth tokens)                 |
| Language       | TypeScript (strict)                             |

---

## Project Structure

```
ezRep-app/
├── App.tsx                        # Entry point
├── app.json                       # Expo config
├── babel.config.js                # Babel + path aliases
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Required env vars
│
├── supabase/
│   └── schema.sql                 # Full Supabase schema (run once)
│
└── src/
    ├── constants/
    │   ├── theme.ts               # Design tokens (colors, spacing, etc.)
    │   └── exercises.ts           # Exercise library (25+ exercises)
    │
    ├── types/
    │   └── index.ts               # All TypeScript interfaces + nav param lists
    │
    ├── lib/
    │   └── supabase.ts            # Supabase client singleton + DB helpers
    │
    ├── store/
    │   ├── authStore.ts           # Auth state (Zustand)
    │   ├── workoutStore.ts        # Solo workout state
    │   └── sessionStore.ts        # Real-time session state machine
    │
    ├── navigation/
    │   ├── RootNavigator.tsx      # Auth vs App switcher
    │   ├── AuthNavigator.tsx      # Login / Register stack
    │   └── AppNavigator.tsx       # Bottom tabs + nested stacks
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx         # Primary / secondary / ghost / danger
    │   │   ├── Input.tsx          # Labelled text input with error state
    │   │   └── Card.tsx           # Container card (default / accent / flat)
    │   └── workout/
    │       ├── RestTimer.tsx      # Countdown rest timer
    │       └── SetRow.tsx         # Individual set row (weight × reps)
    │
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx
        │   └── RegisterScreen.tsx
        ├── home/
        │   └── HomeScreen.tsx
        ├── workout/
        │   ├── WorkoutLoggerScreen.tsx
        │   └── ExerciseSelectorScreen.tsx
        ├── session/
        │   ├── SessionHubScreen.tsx
        │   ├── CreateSessionScreen.tsx
        │   ├── JoinSessionScreen.tsx
        │   ├── SessionLobbyScreen.tsx
        │   ├── ActiveSessionScreen.tsx
        │   └── PostSessionStatsScreen.tsx
        └── profile/
            └── ProfileScreen.tsx
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 18
- Expo CLI: `npm i -g expo-cli`
- A [Supabase](https://supabase.com) project

### 2. Clone & Install

```bash
git clone <repo-url> ezRep-app
cd ezRep-app
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project **URL** and **anon key** from **Settings → API**

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Start the App

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS Simulator / `a` for Android.

---

## Real-time Session Architecture

```
Host                              Supabase Realtime               Participant(s)
─────                             ─────────────────               ─────────────
createSession()  ──────────────►  broadcast channel               joinSession()
  (DB: sessions, session_exercises,                               (DB: session_participants)
   session_participants)
                                                                  setReady() ──► participant_ready
startSession() ──────────────────────────────────────────────►   session_started
  (DB: sessions.status = 'active')
                                                                  logSet() ─────► set_logged
logSet() ────────────────────────────────────────────────────►   (DB: session_sets)
  (DB: session_sets)

advanceExercise() ───────────────────────────────────────────►   exercise_advanced
  (DB: sessions.current_exercise_index++)

endSession() ────────────────────────────────────────────────►   session_ended
  (DB: sessions.status = 'completed')

loadStats(sessionId) ◄──── all clients fetch stats from DB
```

All real-time events are **broadcast** (ephemeral, no DB polling). The DB write happens alongside each broadcast for persistence, and `loadStats()` re-derives everything from the DB for the results screen.

---

## Database Schema (summary)

| Table                  | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `profiles`             | User account info + lifetime stats       |
| `workouts`             | Solo workout sessions                    |
| `workout_exercises`    | Exercises within a solo workout          |
| `workout_sets`         | Individual sets within workout exercises |
| `sessions`             | Group workout rooms (code, status, host) |
| `session_participants` | Who joined, their color, ready status    |
| `session_exercises`    | Exercise queue for the session           |
| `session_sets`         | Individual sets logged during a session  |

Row-Level Security is enabled on all tables. See `supabase/schema.sql` for full policies.

---

## Supabase Realtime Setup

Ensure **Realtime** is enabled for your project:

1. Go to **Database → Replication** in your Supabase dashboard
2. Enable realtime for: `sessions`, `session_participants`, `session_sets`

This is handled automatically if you run `schema.sql` (the `alter publication` statements at the bottom).

---

## Design System

All design tokens live in `src/constants/theme.ts`:

| Token               | Value                                     |
| ------------------- | ----------------------------------------- |
| `Colors.accent`     | `#C6F135` (electric lime)                 |
| `Colors.secondary`  | `#00E5FF` (cyan)                          |
| `Colors.bg`         | `#0D0D0D`                                 |
| `Colors.bgSurface`  | `#1A1A1A`                                 |
| `Colors.bgElevated` | `#242424`                                 |
| `Colors.warning`    | `#FF9F0A`                                 |
| `Colors.error`      | `#FF453A`                                 |
| Participant colors  | 6 unique colors (`Colors.participants[]`) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT
