import type {
  ExerciseStep,
  MovementPattern,
  ScheduledWorkout,
  WorkoutTemplate,
} from "./workout-types";

const seededAt = "2026-04-28T00:00:00.000Z";

type StepSeed = {
  label: string;
  sets: string;
  reps: string;
  rest: string;
};

type WorkoutSeed = {
  week: number;
  day: number;
  name: string;
  goal: string;
  bodyAreas: string[];
  equipment: string[];
  durationMinutes: number;
  notes: string;
  movementPatterns: MovementPattern[];
  functionalFocus: string[];
  steps: StepSeed[];
};

const universalSafetyNote =
  "Breathe continuously, stop 3-4 reps short of failure, keep head above heart, and avoid fast or jerky movement.";

function exercise(id: string, step: StepSeed): ExerciseStep {
  return {
    id,
    label: step.label,
    targetSets: step.sets,
    targetReps: step.reps,
    restLabel: step.rest,
  };
}

function buildWorkout(seed: WorkoutSeed): WorkoutTemplate {
  const id = `seed-safe-strength-week-${seed.week}-day-${seed.day}`;
  return {
    id,
    name: `Week ${seed.week} · ${seed.name}`,
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions: seed.notes,
    steps: seed.steps.map((step, index) =>
      exercise(`${id}-step-${index + 1}`, step),
    ),
    movementPatterns: seed.movementPatterns,
    bodyAreas: seed.bodyAreas,
    equipment: seed.equipment,
    functionalFocus: seed.functionalFocus,
    intensity: "easy",
    durationMinutes: seed.durationMinutes,
    progressionNotes: `Safe Strength Plan Week ${seed.week}. ${universalSafetyNote}`,
    schedulingNotes: `Safe Strength Plan — Week ${seed.week}, Day ${seed.day} (Monday-Friday schedule).`,
  };
}

const workoutSeeds: WorkoutSeed[] = [
  {
    week: 1,
    day: 1,
    name: "Arms",
    goal: "bicep and tricep development with light loads",
    bodyAreas: ["biceps", "triceps", "forearms", "core"],
    equipment: ["light dumbbells", "resistance bands", "incline bench"],
    durationMinutes: 30,
    notes:
      "Week 1 foundation: 2 sets per exercise, 12 reps, controlled tempo, stay upright, rest 60 sec.",
    movementPatterns: ["push", "pull", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Standing Dumbbell Curl", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Hammer Curl (light DB or band)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Band Triceps Pushdown", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Chest-Supported Triceps Kickback (high-incline bench, head up)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Wrist Curl + Reverse Wrist Curl (forearms supported on bench)", sets: "2", reps: "15 reps", rest: "60 sec" },
      { label: "Pallof Press (band, anti-rotation, standing)", sets: "2", reps: "10 per side", rest: "45 sec" },
    ],
  },
  {
    week: 1,
    day: 2,
    name: "Shoulders + Traps",
    goal: "shoulder development and rotator cuff health",
    bodyAreas: ["front delts", "side delts", "rear delts", "traps", "rotator cuff"],
    equipment: ["light dumbbells", "resistance bands", "bench"],
    durationMinutes: 30,
    notes:
      "Week 1 foundation: 2 sets, 12 reps, seated/upright pressing only, use light dumbbells, rest 60 sec.",
    movementPatterns: ["push", "pull"],
    functionalFocus: ["strength endurance", "mobility"],
    steps: [
      { label: "Dumbbell Lateral Raise (light, slight bend in elbow)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Band Front Raise", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Band Rear Delt Fly (standing, upright torso)", sets: "2", reps: "15 reps", rest: "60 sec" },
      { label: "Seated Dumbbell Shoulder Press (supported back, light, partial range)", sets: "2", reps: "12 reps", rest: "75 sec" },
      { label: "Dumbbell Shrug (light)", sets: "2", reps: "15 reps", rest: "60 sec" },
      { label: "Band External Rotation (rotator cuff, elbow at side)", sets: "2", reps: "15 per side", rest: "45 sec" },
    ],
  },
  {
    week: 1,
    day: 3,
    name: "Back",
    goal: "pulling strength and upper back posture",
    bodyAreas: ["lats", "mid-back", "rhomboids", "rear delts"],
    equipment: ["dumbbells", "resistance bands", "high-incline bench", "door anchor"],
    durationMinutes: 30,
    notes:
      "Week 1 foundation: 2 sets, 12 reps. No bent-over rows. Use upright or chest-supported pulls, rest 60 sec.",
    movementPatterns: ["pull", "core"],
    functionalFocus: ["strength endurance", "posture"],
    steps: [
      { label: "Chest-Supported Dumbbell Row (high-incline ~60°)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Row (band at chest height, upright torso)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Banded Lat Pulldown (band anchored overhead)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Band Pull-Apart (arms straight, chest height)", sets: "2", reps: "15 reps", rest: "45 sec" },
      { label: "Band Face Pull (band at face height)", sets: "2", reps: "15 reps", rest: "45 sec" },
      { label: "Bird Dog (quadruped, head neutral)", sets: "2", reps: "8 per side", rest: "30 sec" },
    ],
  },
  {
    week: 1,
    day: 4,
    name: "Chest + Core",
    goal: "chest development and core stability",
    bodyAreas: ["chest", "front delts", "triceps", "abs"],
    equipment: ["empty barbell + rack", "light dumbbells", "resistance bands"],
    durationMinutes: 30,
    notes:
      "Week 1 foundation: 2 sets, 12 reps. Incline push-ups and floor press only. Keep head above heart. Rest 60 sec.",
    movementPatterns: ["push", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Incline Push-Up (hands on bar in rack, ~45°)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Floor Press (light dumbbells)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Chest Press", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Fly", sets: "2", reps: "15 reps", rest: "60 sec" },
      { label: "Dead Bug (slow)", sets: "2", reps: "8 per side", rest: "30 sec" },
      { label: "Side Plank (head neutral)", sets: "2", reps: "20 sec per side", rest: "30 sec" },
      { label: "Pallof Press", sets: "2", reps: "10 per side", rest: "30 sec" },
    ],
  },
  {
    week: 1,
    day: 5,
    name: "Legs",
    goal: "lower body strength, glute and quad development",
    bodyAreas: ["quads", "glutes", "hamstrings", "calves", "tibialis"],
    equipment: ["bodyweight", "light dumbbells", "resistance bands", "bench/box"],
    durationMinutes: 35,
    notes:
      "Week 1 foundation: 2 sets, 12 reps. Bodyweight squats only. No deadlifts or RDLs. Rest 60 sec.",
    movementPatterns: ["squat", "unilateral", "core"],
    functionalFocus: ["strength endurance", "balance"],
    steps: [
      { label: "Bodyweight Squat (slow, full breath cycle each rep)", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Box Squat / Sit-to-Stand", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Reverse Lunge (slow)", sets: "2", reps: "8 per side", rest: "60 sec" },
      { label: "Glute Bridge (pause at top)", sets: "2", reps: "15 reps", rest: "60 sec" },
      { label: "Banded Glute Kickback", sets: "2", reps: "15 per side", rest: "45 sec" },
      { label: "Standing Calf Raise", sets: "2", reps: "20 reps", rest: "45 sec" },
      { label: "Seated Tibialis Raise", sets: "2", reps: "20 reps", rest: "30 sec" },
    ],
  },
  {
    week: 2,
    day: 1,
    name: "Arms",
    goal: "bicep and tricep development",
    bodyAreas: ["biceps", "triceps", "forearms", "core"],
    equipment: ["light dumbbells", "resistance bands", "incline bench"],
    durationMinutes: 35,
    notes: "Week 2 build: same exercise order, 3 sets, 12 reps, controlled tempo, rest 60 sec.",
    movementPatterns: ["push", "pull", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Standing Dumbbell Curl", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Hammer Curl", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band Triceps Pushdown", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Chest-Supported Triceps Kickback", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Wrist Curl + Reverse Wrist Curl", sets: "3", reps: "15 reps", rest: "60 sec" },
      { label: "Pallof Press", sets: "3", reps: "10 per side", rest: "45 sec" },
    ],
  },
  {
    week: 2,
    day: 2,
    name: "Shoulders + Traps",
    goal: "shoulder development and rotator cuff health",
    bodyAreas: ["front delts", "side delts", "rear delts", "traps", "rotator cuff"],
    equipment: ["light dumbbells", "resistance bands", "bench"],
    durationMinutes: 35,
    notes: "Week 2 build: 3 sets, 12 reps. Keep pressing light and controlled.",
    movementPatterns: ["push", "pull"],
    functionalFocus: ["strength endurance", "mobility"],
    steps: [
      { label: "Dumbbell Lateral Raise", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band Front Raise", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band Rear Delt Fly", sets: "3", reps: "15 reps", rest: "60 sec" },
      { label: "Seated Dumbbell Shoulder Press (light, partial range)", sets: "3", reps: "12 reps", rest: "75 sec" },
      { label: "Dumbbell Shrug", sets: "3", reps: "15 reps", rest: "60 sec" },
      { label: "Band External Rotation", sets: "3", reps: "15 per side", rest: "45 sec" },
    ],
  },
  {
    week: 2,
    day: 3,
    name: "Back",
    goal: "pulling strength and posture",
    bodyAreas: ["lats", "mid-back", "rhomboids", "rear delts"],
    equipment: ["dumbbells", "resistance bands", "high-incline bench"],
    durationMinutes: 35,
    notes: "Week 2 build: 3 sets, 12 reps. All upright or chest-supported pulling.",
    movementPatterns: ["pull", "core"],
    functionalFocus: ["strength endurance", "posture"],
    steps: [
      { label: "Chest-Supported Dumbbell Row (high incline)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Row", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Banded Lat Pulldown", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band Pull-Apart", sets: "3", reps: "15 reps", rest: "45 sec" },
      { label: "Band Face Pull", sets: "3", reps: "15 reps", rest: "45 sec" },
      { label: "Bird Dog", sets: "3", reps: "8 per side", rest: "30 sec" },
    ],
  },
  {
    week: 2,
    day: 4,
    name: "Chest + Core",
    goal: "chest development and core stability",
    bodyAreas: ["chest", "front delts", "triceps", "abs"],
    equipment: ["empty barbell + rack", "light dumbbells", "resistance bands"],
    durationMinutes: 35,
    notes: "Week 2 build: 3 sets, 12 reps. Incline push-ups and floor press only.",
    movementPatterns: ["push", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Incline Push-Up", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Floor Press (light dumbbells)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Chest Press", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Standing Band Fly", sets: "3", reps: "15 reps", rest: "60 sec" },
      { label: "Dead Bug", sets: "3", reps: "8 per side", rest: "30 sec" },
      { label: "Side Plank", sets: "3", reps: "20 sec per side", rest: "30 sec" },
      { label: "Pallof Press", sets: "3", reps: "10 per side", rest: "30 sec" },
    ],
  },
  {
    week: 2,
    day: 5,
    name: "Legs",
    goal: "lower body strength",
    bodyAreas: ["quads", "glutes", "hamstrings", "calves", "tibialis"],
    equipment: ["bodyweight", "light dumbbells", "resistance bands", "bench/box"],
    durationMinutes: 40,
    notes:
      "Week 2 build: 3 sets. Light goblet squat is optional. No loaded back squats and no deadlifts.",
    movementPatterns: ["squat", "unilateral", "core"],
    functionalFocus: ["strength endurance", "balance"],
    steps: [
      { label: "Bodyweight Squat (or Goblet Squat with light DB at chest)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Box Squat / Sit-to-Stand", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Reverse Lunge", sets: "3", reps: "8 per side", rest: "60 sec" },
      { label: "Glute Bridge", sets: "3", reps: "15 reps", rest: "60 sec" },
      { label: "Banded Glute Kickback", sets: "3", reps: "15 per side", rest: "45 sec" },
      { label: "Standing Calf Raise", sets: "3", reps: "20 reps", rest: "45 sec" },
      { label: "Seated Tibialis Raise", sets: "3", reps: "20 reps", rest: "30 sec" },
    ],
  },
  {
    week: 3,
    day: 1,
    name: "Arms",
    goal: "bicep and tricep development with controlled tempo",
    bodyAreas: ["biceps", "triceps", "forearms", "core"],
    equipment: ["light dumbbells", "resistance bands", "incline bench"],
    durationMinutes: 35,
    notes:
      "Week 3 tempo: 3 sets, 10 reps, 3-second lowering phase on each rep. Rest 75 sec on primary lifts.",
    movementPatterns: ["push", "pull", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Standing Dumbbell Curl (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Hammer Curl (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Band Triceps Pushdown (3-sec return)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Chest-Supported Triceps Kickback (3-sec return)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Wrist Curl + Reverse Wrist Curl", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Pallof Press (3-sec hold at extension)", sets: "3", reps: "8 per side", rest: "45 sec" },
    ],
  },
  {
    week: 3,
    day: 2,
    name: "Shoulders + Traps",
    goal: "shoulder control with slow eccentrics",
    bodyAreas: ["front delts", "side delts", "rear delts", "traps", "rotator cuff"],
    equipment: ["light dumbbells", "resistance bands", "bench"],
    durationMinutes: 35,
    notes:
      "Week 3 tempo: 3 sets, 10 reps with 3-second lower. Drop load if needed to keep control.",
    movementPatterns: ["push", "pull"],
    functionalFocus: ["strength endurance", "mobility"],
    steps: [
      { label: "Dumbbell Lateral Raise (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Band Front Raise (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Band Rear Delt Fly (3-sec return)", sets: "3", reps: "12 reps", rest: "75 sec" },
      { label: "Seated Dumbbell Shoulder Press (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Dumbbell Shrug (2-sec hold, 3-sec lower)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band External Rotation", sets: "3", reps: "12 per side", rest: "45 sec" },
    ],
  },
  {
    week: 3,
    day: 3,
    name: "Back",
    goal: "back development with controlled lowering",
    bodyAreas: ["lats", "mid-back", "rhomboids", "rear delts"],
    equipment: ["dumbbells", "resistance bands", "high-incline bench"],
    durationMinutes: 35,
    notes:
      "Week 3 tempo: 3 sets, 10 reps with 3-second lower on rows and pulldown patterns.",
    movementPatterns: ["pull", "core"],
    functionalFocus: ["strength endurance", "posture"],
    steps: [
      { label: "Chest-Supported Dumbbell Row (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Standing Band Row (3-sec return)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Banded Lat Pulldown (3-sec return)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Band Pull-Apart", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Band Face Pull", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Bird Dog (3-sec hold)", sets: "3", reps: "6 per side", rest: "30 sec" },
    ],
  },
  {
    week: 3,
    day: 4,
    name: "Chest + Core",
    goal: "chest development with slow eccentrics",
    bodyAreas: ["chest", "front delts", "triceps", "abs"],
    equipment: ["empty barbell + rack", "light dumbbells", "resistance bands"],
    durationMinutes: 35,
    notes: "Week 3 tempo: 3 sets, 10 reps with 3-second lower. Rest 75 sec on presses.",
    movementPatterns: ["push", "core"],
    functionalFocus: ["strength endurance", "core stability"],
    steps: [
      { label: "Incline Push-Up (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Floor Press (3-sec lower)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Standing Band Chest Press (3-sec return)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Standing Band Fly (3-sec return)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Dead Bug (3-sec extension)", sets: "3", reps: "6 per side", rest: "30 sec" },
      { label: "Side Plank", sets: "3", reps: "25 sec per side", rest: "30 sec" },
      { label: "Pallof Press (3-sec hold)", sets: "3", reps: "8 per side", rest: "30 sec" },
    ],
  },
  {
    week: 3,
    day: 5,
    name: "Legs",
    goal: "lower body strength with controlled tempo",
    bodyAreas: ["quads", "glutes", "hamstrings", "calves", "tibialis"],
    equipment: ["bodyweight", "light dumbbells", "resistance bands", "bench/box"],
    durationMinutes: 40,
    notes:
      "Week 3 tempo: 3 sets, 10 reps with 3-second lower on squats and lunges. Rest 75 sec on main moves.",
    movementPatterns: ["squat", "unilateral", "core"],
    functionalFocus: ["strength endurance", "balance"],
    steps: [
      { label: "Bodyweight Squat or Goblet Squat (3-sec lower, 1-sec pause)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Box Squat (3-sec lower onto box)", sets: "3", reps: "10 reps", rest: "75 sec" },
      { label: "Reverse Lunge (3-sec lower)", sets: "3", reps: "8 per side", rest: "75 sec" },
      { label: "Glute Bridge (3-sec hold at top)", sets: "3", reps: "12 reps", rest: "60 sec" },
      { label: "Banded Glute Kickback (3-sec hold at end range)", sets: "3", reps: "12 per side", rest: "45 sec" },
      { label: "Standing Calf Raise (3-sec lower)", sets: "3", reps: "15 reps", rest: "45 sec" },
      { label: "Seated Tibialis Raise", sets: "3", reps: "20 reps", rest: "30 sec" },
    ],
  },
  {
    week: 4,
    day: 1,
    name: "Arms",
    goal: "maintain stimulus, recover",
    bodyAreas: ["biceps", "triceps", "forearms", "core"],
    equipment: ["light dumbbells", "resistance bands", "incline bench"],
    durationMinutes: 25,
    notes:
      "Week 4 deload: 2 sets, 10 reps, controlled tempo, focus on smooth form and low fatigue.",
    movementPatterns: ["push", "pull", "core"],
    functionalFocus: ["recovery", "core stability"],
    steps: [
      { label: "Standing Dumbbell Curl", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Hammer Curl", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Band Triceps Pushdown", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Chest-Supported Triceps Kickback", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Wrist Curl + Reverse Wrist Curl", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Pallof Press", sets: "2", reps: "8 per side", rest: "45 sec" },
    ],
  },
  {
    week: 4,
    day: 2,
    name: "Shoulders + Traps",
    goal: "maintain stimulus, recover",
    bodyAreas: ["front delts", "side delts", "rear delts", "traps", "rotator cuff"],
    equipment: ["light dumbbells", "resistance bands", "bench"],
    durationMinutes: 25,
    notes: "Week 4 deload: 2 sets, 10 reps. Choose the lighter dumbbell option throughout.",
    movementPatterns: ["push", "pull"],
    functionalFocus: ["recovery", "mobility"],
    steps: [
      { label: "Dumbbell Lateral Raise", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Band Front Raise", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Band Rear Delt Fly", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Seated Dumbbell Shoulder Press", sets: "2", reps: "10 reps", rest: "75 sec" },
      { label: "Dumbbell Shrug", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Band External Rotation", sets: "2", reps: "12 per side", rest: "45 sec" },
    ],
  },
  {
    week: 4,
    day: 3,
    name: "Back",
    goal: "maintain stimulus, recover",
    bodyAreas: ["lats", "mid-back", "rhomboids", "rear delts"],
    equipment: ["dumbbells", "resistance bands", "high-incline bench"],
    durationMinutes: 25,
    notes: "Week 4 deload: 2 sets, 10 reps.",
    movementPatterns: ["pull", "core"],
    functionalFocus: ["recovery", "posture"],
    steps: [
      { label: "Chest-Supported Dumbbell Row", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Standing Band Row", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Banded Lat Pulldown", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Band Pull-Apart", sets: "2", reps: "12 reps", rest: "45 sec" },
      { label: "Band Face Pull", sets: "2", reps: "12 reps", rest: "45 sec" },
      { label: "Bird Dog", sets: "2", reps: "6 per side", rest: "30 sec" },
    ],
  },
  {
    week: 4,
    day: 4,
    name: "Chest + Core",
    goal: "maintain stimulus, recover",
    bodyAreas: ["chest", "front delts", "triceps", "abs"],
    equipment: ["empty barbell + rack", "light dumbbells", "resistance bands"],
    durationMinutes: 25,
    notes: "Week 4 deload: 2 sets, 10 reps.",
    movementPatterns: ["push", "core"],
    functionalFocus: ["recovery", "core stability"],
    steps: [
      { label: "Incline Push-Up", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Floor Press", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Standing Band Chest Press", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Standing Band Fly", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Dead Bug", sets: "2", reps: "6 per side", rest: "30 sec" },
      { label: "Side Plank", sets: "2", reps: "20 sec per side", rest: "30 sec" },
      { label: "Pallof Press", sets: "2", reps: "8 per side", rest: "30 sec" },
    ],
  },
  {
    week: 4,
    day: 5,
    name: "Legs",
    goal: "maintain stimulus, recover",
    bodyAreas: ["quads", "glutes", "hamstrings", "calves", "tibialis"],
    equipment: ["bodyweight", "light dumbbells", "resistance bands", "bench/box"],
    durationMinutes: 30,
    notes:
      "Week 4 deload: 2 sets, 10 reps. Bodyweight-only squats this week to recover before next cycle.",
    movementPatterns: ["squat", "unilateral", "core"],
    functionalFocus: ["recovery", "balance"],
    steps: [
      { label: "Bodyweight Squat", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Box Squat / Sit-to-Stand", sets: "2", reps: "10 reps", rest: "60 sec" },
      { label: "Reverse Lunge", sets: "2", reps: "6 per side", rest: "60 sec" },
      { label: "Glute Bridge", sets: "2", reps: "12 reps", rest: "60 sec" },
      { label: "Banded Glute Kickback", sets: "2", reps: "12 per side", rest: "45 sec" },
      { label: "Standing Calf Raise", sets: "2", reps: "15 reps", rest: "45 sec" },
      { label: "Seated Tibialis Raise", sets: "2", reps: "15 reps", rest: "30 sec" },
    ],
  },
];

export const seedWorkouts: WorkoutTemplate[] = workoutSeeds.map(buildWorkout);

function withProfileScopedIds(profileId: string, workout: WorkoutTemplate): WorkoutTemplate {
  const id = `${profileId}::${workout.id}`;
  return {
    ...workout,
    id,
    steps: workout.steps.map((step) => ({
      ...step,
      id: `${profileId}::${step.id}`,
    })),
  };
}

export function createProfileSeedWorkouts(profileId: string): WorkoutTemplate[] {
  return seedWorkouts.map((workout) => withProfileScopedIds(profileId, workout));
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getNextMonday(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  const daysUntilMonday = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
  next.setDate(next.getDate() + daysUntilMonday);
  return next;
}

function addWeekdays(startDate: Date, weekdayOffset: number): Date {
  const date = new Date(startDate);
  let added = 0;

  while (added < weekdayOffset) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }

  return date;
}

export function createSeedSchedule(date: string): ScheduledWorkout[] {
  const requestedStart = new Date(`${date}T12:00:00`);
  const mondayStart = getNextMonday(requestedStart);

  return seedWorkouts.map((workout, index) => {
    const workoutDate = addWeekdays(mondayStart, index);

    return {
      id: `seed-safe-strength-scheduled-${index + 1}`,
      workoutId: workout.id,
      date: toDateInputValue(workoutDate),
      status: "planned",
      activeStepIndex: 0,
    };
  });
}

export function createProfileSeedSchedule(
  profileId: string,
  date: string,
): ScheduledWorkout[] {
  const workouts = createProfileSeedWorkouts(profileId);
  const requestedStart = new Date(`${date}T12:00:00`);
  const mondayStart = getNextMonday(requestedStart);

  return workouts.map((workout, index) => {
    const workoutDate = addWeekdays(mondayStart, index);

    return {
      id: `${profileId}::seed-safe-strength-scheduled-${index + 1}`,
      workoutId: workout.id,
      date: toDateInputValue(workoutDate),
      status: "planned",
      activeStepIndex: 0,
    };
  });
}
