# ezRep 🏋️

**A real-time social gym workout tracker built with React Native + Expo + Firebase.**

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
| Framework      | React Native 0.73 + Expo SDK 54                 |
| Navigation     | React Navigation 6 (native-stack + bottom-tabs) |
| State          | Zustand 4.5                                     |
| Backend / Auth | Firebase (Firestore + Auth)                     |
| Realtime       | Firestore `onSnapshot` listeners                |
| Storage        | expo-secure-store (persistence)                 |
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
├── firestore.rules                # Firebase Security Rules
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
    │   └── firebase.ts            # Firebase client singleton + DB helpers
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
- A [Firebase](https://firebase.google.com) project

### 2. Clone & Install

```bash
git clone <repo-url> ezRep-app
cd ezRep-app
npm install
```

### 3. Set Up Firebase

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Cloud Firestore**
4. Copy your project configuration keys to `.env`

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ezrep-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ezrep-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ezrep-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### 5. Start the App

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS Simulator / `a` for Android.

---

## Real-time Session Architecture

```
Host                              Firebase Firestore               Participant(s)
─────                             ──────────────────               ─────────────
createSession()  ──────────────►  doc(/sessions/...)  ◄───────────  joinSession()
  (Sub: participants, exercises)
                                                                   setReady()
                                  onSnapshot() ◄────────────┐      (updateDoc)
                                                            │
startSession() ────────────────►  status = 'active'  ───────┤
                                                            │
logSet() ──────────────────────►  addDoc(/sets) ────────────┤      logSet()
                                                            │
advanceExercise() ─────────────►  index++ ──────────────────┤
                                                            │
endSession() ──────────────────►  status = 'completed'  ────┘
```

All real-time events are handled via **Firestore Realtime Listeners**. Participants subscribe to the session document and its sets collection for low-latency synchronization.

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
