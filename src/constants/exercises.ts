// ─────────────────────────────────────────────
//  ezRep — Exercise Library
//  Pre-seeded exercise catalogue; users can also add custom exercises
// ─────────────────────────────────────────────

import { ExerciseRecord, ExerciseCategory } from "@/types";

export const EXERCISE_LIBRARY: ExerciseRecord[] = [
  // ── Chest ──────────────────────────────────
  {
    exerciseId: "exr_chest_pec_deck",
    name: "Lever Pec Deck Fly",
    imageUrl: "Lever-Pec-Deck-Fly-Chest.png",
    equipments: ["LEVERAGE MACHINE"],
    bodyParts: ["CHEST"],
    gender: "male",
    exerciseType: "STRENGTH",
    targetMuscles: ["Pectoralis Major Clavicular Head"],
    secondaryMuscles: ["Deltoid Anterior"],
    videoUrl: "Lever-Pec-Deck-Fly-Chest.mp4",
    keywords: ["pec deck", "chest fly", "machine fly"],
    overview: "Isolates the pectoral muscles for improved definition and strength.",
    instructions: [
      "Sit firmly against the pad.",
      "Push levers together slowly until hands meet.",
      "Hold for a second, then return slowly.",
    ],
    exerciseTips: ["Keep movements controlled.", "Don't use momentum."],
  },
  {
    exerciseId: "barbell_bench_press",
    name: "Barbell Bench Press",
    bodyParts: ["CHEST"],
    targetMuscles: ["Chest", "Triceps", "Front Delts"],
    equipments: ["Barbell"],
    instructions: [
      "Lie on a flat bench.",
      "Lower the bar to your mid-chest.",
      "Push back up until arms extend.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["bench press", "chest press", "barbell"],
  },
  {
    exerciseId: "db_incline_press",
    name: "Incline Dumbbell Press",
    bodyParts: ["CHEST"],
    targetMuscles: ["Upper Chest", "Front Delts", "Triceps"],
    equipments: ["Dumbbells"],
    instructions: [
      "Sit on an incline bench.",
      "Press dumbbells up over your chest.",
      "Lower them until level with shoulders.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["incline", "upper chest", "dumbbell press"],
  },

  // ── Back ───────────────────────────────────
  {
    exerciseId: "deadlift_barbell",
    name: "Barbell Deadlift",
    bodyParts: ["BACK"],
    targetMuscles: ["Lower Back", "Glutes", "Hamstrings", "Traps"],
    equipments: ["Barbell"],
    instructions: [
      "Stand with feet hip-width apart.",
      "Bend at hips and knees, grip the bar.",
      "Lift by extending hips and knees to standing.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["deadlift", "powerlifting", "posterior chain"],
  },
  {
    exerciseId: "pull_up_bodyweight",
    name: "Pull Up",
    bodyParts: ["BACK"],
    targetMuscles: ["Lats", "Biceps", "Mid Back"],
    equipments: ["Bodyweight"],
    instructions: [
      "Grip the bar wider than shoulder-width.",
      "Pull yourself up until chin is above the bar.",
      "Lower yourself back down slowly.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["pullup", "bodyweight back", "lats"],
  },
  {
    exerciseId: "seated_cable_row",
    name: "Seated Cable Row",
    bodyParts: ["BACK"],
    targetMuscles: ["Mid Back", "Lats", "Biceps"],
    equipments: ["Cable"],
    instructions: [
      "Sit at the machine with feet on the pads.",
      "Pull the handle toward your abdomen.",
      "Squeeze shoulder blades and return slowly.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["row", "cable back", "mid back"],
  },

  // ── Shoulders ──────────────────────────────
  {
    exerciseId: "overhead_press_barbell",
    name: "Barbell Overhead Press",
    bodyParts: ["SHOULDERS"],
    targetMuscles: ["Front Delts", "Triceps", "Side Delts"],
    equipments: ["Barbell"],
    instructions: [
      "Stand with bar at collarbone height.",
      "Press bar directly overhead.",
      "Lower back to start position.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["ohp", "shoulder press", "military press"],
  },
  {
    exerciseId: "lateral_raise_db",
    name: "Dumbbell Lateral Raise",
    bodyParts: ["SHOULDERS"],
    targetMuscles: ["Side Delts"],
    equipments: ["Dumbbells"],
    instructions: [
      "Hold dumbbells at your sides.",
      "Raise arms out to the sides until shoulder height.",
      "Lower back down with control.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["side delts", "shoulder raises", "lateral"],
  },

  // ── Arms ───────────────────────────────────
  {
    exerciseId: "bicep_curl_barbell",
    name: "Barbell Curl",
    bodyParts: ["ARMS"],
    targetMuscles: ["Biceps"],
    equipments: ["Barbell"],
    instructions: [
      "Hold bar with underhand grip.",
      "Curl bar up toward shoulders.",
      "Lower back down slowly.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["biceps", "arms", "barbell curl"],
  },
  {
    exerciseId: "tricep_pushdown_cable",
    name: "Tricep Pushdown",
    bodyParts: ["ARMS"],
    targetMuscles: ["Triceps"],
    equipments: ["Cable"],
    instructions: [
      "Face the cable machine with bar at chest height.",
      "Push bar down until arms are fully extended.",
      "Return to start with control.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["triceps", "pushdown", "cable arms"],
  },

  // ── Legs ───────────────────────────────────
  {
    exerciseId: "squat_barbell",
    name: "Barbell Squat",
    bodyParts: ["LEGS"],
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    equipments: ["Barbell"],
    instructions: [
      "Place bar on upper back.",
      "Lower hips until thighs are parallel to floor.",
      "Drive back up to standing.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["squat", "quads", "legs"],
  },
  {
    exerciseId: "leg_press_machine",
    name: "Leg Press",
    bodyParts: ["LEGS"],
    targetMuscles: ["Quads", "Glutes"],
    equipments: ["Machine"],
    instructions: [
      "Sit at the machine with feet on platform.",
      "Lower the weight toward your chest.",
      "Push platform away until legs are extended.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["legpress", "machine legs"],
  },

  // ── Core ───────────────────────────────────
  {
    exerciseId: "plank_bodyweight",
    name: "Plank",
    bodyParts: ["CORE"],
    targetMuscles: ["Abs", "Obliques"],
    equipments: ["Bodyweight"],
    instructions: [
      "Hold a pushup position on forearms.",
      "Keep body in a straight line.",
      "Maintain for the desired duration.",
    ],
    exerciseType: "STRENGTH",
    keywords: ["abs", "core stability", "plank"],
  },
];

// Group exercises by primary body part for the selector UI
export const EXERCISES_BY_BODY_PART = EXERCISE_LIBRARY.reduce(
  (acc, ex) => {
    const primaryPart = ex.bodyParts[0];
    if (!acc[primaryPart]) acc[primaryPart] = [];
    acc[primaryPart].push(ex);
    return acc;
  },
  {} as Record<string, ExerciseRecord[]>,
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
