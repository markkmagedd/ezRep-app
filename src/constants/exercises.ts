// ─────────────────────────────────────────────
//  ezRep — Exercise Library
//  Pre-seeded exercise catalogue; users can also add custom exercises
// ─────────────────────────────────────────────

export interface ExerciseDef {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string;
}

export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full_body";

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // ── Chest ──────────────────────────────────
  {
    id: "barbell_bench_press",
    name: "Barbell Bench Press",
    category: "chest",
    muscleGroups: ["Chest", "Triceps", "Front Delts"],
    equipment: "Barbell",
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press",
    category: "chest",
    muscleGroups: ["Upper Chest", "Triceps"],
    equipment: "Dumbbells",
  },
  {
    id: "cable_fly",
    name: "Cable Fly",
    category: "chest",
    muscleGroups: ["Chest"],
    equipment: "Cable",
  },
  {
    id: "push_up",
    name: "Push Up",
    category: "chest",
    muscleGroups: ["Chest", "Triceps", "Core"],
    equipment: "Bodyweight",
  },

  // ── Back ───────────────────────────────────
  {
    id: "deadlift",
    name: "Deadlift",
    category: "back",
    muscleGroups: ["Lower Back", "Hamstrings", "Glutes", "Traps"],
    equipment: "Barbell",
  },
  {
    id: "pull_up",
    name: "Pull Up",
    category: "back",
    muscleGroups: ["Lats", "Biceps", "Rear Delts"],
    equipment: "Bodyweight",
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    category: "back",
    muscleGroups: ["Mid Back", "Lats", "Biceps"],
    equipment: "Barbell",
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "back",
    muscleGroups: ["Lats", "Biceps"],
    equipment: "Cable",
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row",
    category: "back",
    muscleGroups: ["Mid Back", "Lats"],
    equipment: "Cable",
  },

  // ── Shoulders ──────────────────────────────
  {
    id: "overhead_press",
    name: "Overhead Press",
    category: "shoulders",
    muscleGroups: ["Front Delts", "Side Delts", "Triceps"],
    equipment: "Barbell",
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    category: "shoulders",
    muscleGroups: ["Side Delts"],
    equipment: "Dumbbells",
  },
  {
    id: "face_pull",
    name: "Face Pull",
    category: "shoulders",
    muscleGroups: ["Rear Delts", "Traps"],
    equipment: "Cable",
  },

  // ── Arms ───────────────────────────────────
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    category: "arms",
    muscleGroups: ["Biceps"],
    equipment: "Barbell",
  },
  {
    id: "dumbbell_curl",
    name: "Dumbbell Curl",
    category: "arms",
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
  },
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdown",
    category: "arms",
    muscleGroups: ["Triceps"],
    equipment: "Cable",
  },
  {
    id: "skull_crusher",
    name: "Skull Crusher",
    category: "arms",
    muscleGroups: ["Triceps"],
    equipment: "Barbell",
  },

  // ── Legs ───────────────────────────────────
  {
    id: "squat",
    name: "Barbell Squat",
    category: "legs",
    muscleGroups: ["Quads", "Glutes", "Hamstrings"],
    equipment: "Barbell",
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "legs",
    muscleGroups: ["Quads", "Glutes"],
    equipment: "Machine",
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "legs",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    equipment: "Barbell",
  },
  {
    id: "leg_curl",
    name: "Leg Curl",
    category: "legs",
    muscleGroups: ["Hamstrings"],
    equipment: "Machine",
  },
  {
    id: "calf_raise",
    name: "Calf Raise",
    category: "legs",
    muscleGroups: ["Calves"],
    equipment: "Machine",
  },

  // ── Core ───────────────────────────────────
  {
    id: "plank",
    name: "Plank",
    category: "core",
    muscleGroups: ["Core", "Abs"],
    equipment: "Bodyweight",
  },
  {
    id: "crunch",
    name: "Crunch",
    category: "core",
    muscleGroups: ["Abs"],
    equipment: "Bodyweight",
  },
  {
    id: "cable_crunch",
    name: "Cable Crunch",
    category: "core",
    muscleGroups: ["Abs"],
    equipment: "Cable",
  },
];

// Group exercises by category for the selector UI
export const EXERCISES_BY_CATEGORY = EXERCISE_LIBRARY.reduce(
  (acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  },
  {} as Record<ExerciseCategory, ExerciseDef[]>,
);

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full Body",
};
