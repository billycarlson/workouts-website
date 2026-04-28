import type { ExerciseStep, ScheduledWorkout, WorkoutTemplate } from "./workout-types";

const seededAt = "2026-04-28T00:00:00.000Z";

function header(id: string, label: string, detail: string): ExerciseStep {
  return { id, label, detail };
}

function exercise(
  id: string,
  label: string,
  targetSets: string,
  targetReps: string,
  restLabel: string,
): ExerciseStep {
  return { id, label, targetSets, targetReps, restLabel };
}

export const seedWorkouts: WorkoutTemplate[] = [
  {
    id: "garage-week-1-arms",
    name: "Arms",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Two giant sets of 4 rounds each. No rest between exercises within a giant set; rest only between rounds.",
    steps: [
      header("garage-week-1-arms-gs1", "Giant Set #1", "4 rounds. Move exercise to exercise with no rest; rest only after Reverse Grip Bench."),
      exercise("garage-week-1-arms-1", "Dumbbell Hammer Curls", "4", "20 reps", "no rest"),
      exercise("garage-week-1-arms-2", "Close Grip Bench Press", "4", "30 reps", "no rest"),
      exercise("garage-week-1-arms-3", "Supinated Dumbbell Curls (Garage 2.0)", "4", "20 reps", "no rest"),
      exercise("garage-week-1-arms-4", "Reverse Grip Bench", "4", "30 reps", "rest between rounds"),
      header("garage-week-1-arms-gs2", "Giant Set #2", "4 rounds. Move exercise to exercise with no rest; rest only after Skull Crushers."),
      exercise("garage-week-1-arms-5", "Reverse Grip Straight Bar Curls", "4", "20 reps", "no rest"),
      exercise("garage-week-1-arms-6", "Incline Dumbbell Skulls", "4", "20 reps", "no rest"),
      exercise("garage-week-1-arms-7", "Barbell Curls", "4", "20 reps", "no rest"),
      exercise("garage-week-1-arms-8", "Skull Crushers \"45 Degree\"", "4", "20 reps", "rest between rounds"),
    ],
    movementPatterns: ["push", "pull"],
    bodyAreas: ["biceps", "triceps", "forearms"],
    equipment: ["dumbbells", "barbell", "bench"],
    functionalFocus: ["strength endurance"],
    intensity: "hard",
    durationMinutes: 45,
    progressionNotes: "Keep giant-set flow. Change exercises later while preserving arm focus and round structure.",
    schedulingNotes: "Garage Program 2.0 — Week 1 Day 1.",
  },
  {
    id: "garage-week-1-shoulders-traps",
    name: "Shoulders + Traps",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Two giant sets of 4 rounds each. No rest between exercises within a giant set; rest only between rounds.",
    steps: [
      header("garage-week-1-shoulders-gs1", "Giant Set #1", "4 rounds. Move exercise to exercise with no rest; rest only after Around The Worlds."),
      exercise("garage-week-1-shoulders-1", "Incline Dumbbell Hammer Shoulder Press", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-2", "Dumbbell Side Lateral \"Incline\"", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-3", "Dumbbell Rear Delt Raise \"Incline\"", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-4", "Incline Rear Delt \"Around The Worlds\"", "4", "20 reps", "rest between rounds"),
      header("garage-week-1-shoulders-gs2", "Giant Set #2", "4 rounds. Move exercise to exercise with no rest; rest only after wide-grip shrugs."),
      exercise("garage-week-1-shoulders-5", "Dumbbell Side Laterals \"Scapular Plane\"", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-6", "Bent Over Dumbbell Rear Delt Raise", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-7", "Seated Supinated Plate Raise", "4", "20 reps", "no rest"),
      exercise("garage-week-1-shoulders-8", "Barbell Shrugs \"Wide Grip\"", "4", "30 reps", "rest between rounds"),
    ],
    movementPatterns: ["push", "pull"],
    bodyAreas: ["shoulders", "front delts", "side delts", "rear delts", "traps"],
    equipment: ["dumbbells", "barbell", "incline bench", "weight plate"],
    functionalFocus: ["strength endurance"],
    intensity: "hard",
    durationMinutes: 45,
    progressionNotes: "Keep shoulder/trap focus. Swap movements later while preserving delt balance.",
    schedulingNotes: "Garage Program 2.0 — Week 1 Day 2.",
  },
  {
    id: "garage-week-1-back",
    name: "Back",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Two giant sets of 4 rounds each. No rest between exercises within a giant set; rest only after each round.",
    steps: [
      header("garage-week-1-back-gs1", "Giant Set #1", "4 rounds. Move exercise to exercise with no rest; rest only after Wide Grip Pull-ups."),
      exercise("garage-week-1-back-1", "Bench Assisted \"Wide Grip\" Pull-ups", "4", "to failure", "no rest"),
      exercise("garage-week-1-back-2", "Dumbbell Bent Over Rows", "4", "15 reps", "no rest"),
      exercise("garage-week-1-back-3", "Bodyweight High Elbow Row", "4", "20 reps", "no rest"),
      exercise("garage-week-1-back-4", "Wide Grip Pull-ups", "4", "to failure", "rest between rounds"),
      header("garage-week-1-back-gs2", "Giant Set #2", "4 rounds. Move exercise to exercise with no rest; rest only after Standing Hyper."),
      exercise("garage-week-1-back-5", "Dumbbell High Elbow Row \"Incline\"", "4", "20 reps", "no rest"),
      exercise("garage-week-1-back-6", "One Arm T-Bar Row", "4", "20 reps per side", "no rest"),
      exercise("garage-week-1-back-7", "One Arm Meadows T-Bar Row", "4", "20 reps per side", "no rest"),
      exercise("garage-week-1-back-8", "Standing Hyper (Barbell)", "4", "20 reps", "rest between rounds"),
    ],
    movementPatterns: ["pull", "hinge"],
    bodyAreas: ["lats", "mid-back", "rhomboids", "lower back"],
    equipment: ["pull-up bar", "dumbbells", "barbell", "bench", "T-bar"],
    functionalFocus: ["strength endurance"],
    intensity: "hard",
    durationMinutes: 50,
    progressionNotes: "Keep pulling volume high. Swap row/pull-up variations in later weeks.",
    schedulingNotes: "Garage Program 2.0 — Week 1 Day 3.",
  },
  {
    id: "garage-week-1-chest-abs",
    name: "Chest + Abs",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Three giant sets of 3 rounds each. No rest between exercises within a giant set; rest only after each round.",
    steps: [
      header("garage-week-1-chest-gs1", "Giant Set #1", "3 rounds. Move exercise to exercise with no rest; rest only after Dips."),
      exercise("garage-week-1-chest-1", "Incline Dumbbell Bench Press", "3", "15 reps", "no rest"),
      exercise("garage-week-1-chest-2", "Flat Dumbbell Bench Press", "3", "15 reps", "no rest"),
      exercise("garage-week-1-chest-3", "Flat Barrel Press", "3", "15 reps", "no rest"),
      exercise("garage-week-1-chest-4", "Dips (Tilted Forward)", "3", "to failure", "rest between rounds"),
      header("garage-week-1-chest-gs2", "Giant Set #2", "3 rounds. Move exercise to exercise with no rest; rest only after Dips Negatives."),
      exercise("garage-week-1-chest-5", "Incline Barbell Bench Press", "3", "20 reps", "no rest"),
      exercise("garage-week-1-chest-6", "Slight Incline Barbell Bench Press", "3", "20 reps", "no rest"),
      exercise("garage-week-1-chest-7", "Push-Ups", "3", "to failure", "no rest"),
      exercise("garage-week-1-chest-8", "Dips \"Negatives\"", "3", "5 reps", "rest between rounds"),
      header("garage-week-1-chest-gs3", "Giant Set #3", "3 rounds. Move exercise to exercise with no rest; rest only after V-Ups."),
      exercise("garage-week-1-chest-9", "Hanging Knee Raises \"Weighted\"", "3", "20 reps", "no rest"),
      exercise("garage-week-1-chest-10", "Hanging Leg Raises", "3", "20 reps", "no rest"),
      exercise("garage-week-1-chest-11", "Hanging Knee Raises", "3", "20 reps", "no rest"),
      exercise("garage-week-1-chest-12", "V-Ups", "3", "to failure", "rest between rounds"),
    ],
    movementPatterns: ["push", "core"],
    bodyAreas: ["chest", "triceps", "abs", "hip flexors"],
    equipment: ["dumbbells", "barbell", "bench", "dip station", "pull-up bar"],
    functionalFocus: ["strength endurance", "core stability"],
    intensity: "hard",
    durationMinutes: 55,
    progressionNotes: "Keep chest/abs structure. Rotate press angles and ab variations later.",
    schedulingNotes: "Garage Program 2.0 — Week 1 Day 4.",
  },
  {
    id: "garage-week-1-legs",
    name: "Legs",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "First giant set is 4 rounds; second and third are 3 rounds. No rest between exercises within a giant set; rest only after each round.",
    steps: [
      header("garage-week-1-legs-gs1", "Giant Set #1", "4 rounds. Move exercise to exercise with no rest; rest only after Monster Walk."),
      exercise("garage-week-1-legs-1", "High Bar Squat \"Heels Elevated\"", "4", "20 reps", "no rest"),
      exercise("garage-week-1-legs-2", "Low Bar Squat", "4", "20 reps", "no rest"),
      exercise("garage-week-1-legs-3", "Dumbbell Sissy Squat", "4", "20 reps", "no rest"),
      exercise("garage-week-1-legs-4", "Monster Walk", "4", "40 reps", "rest between rounds"),
      header("garage-week-1-legs-gs2", "Giant Set #2", "3 rounds. Move exercise to exercise with no rest; rest only after Step Ups."),
      exercise("garage-week-1-legs-5", "Dumbbell Stiffs \"Barbell Assisted\"", "3", "20 reps", "no rest"),
      exercise("garage-week-1-legs-6", "Sumo Deadlifts", "3", "20 reps", "no rest"),
      exercise("garage-week-1-legs-7", "Weighted Walking Lunges", "3", "40 reps", "no rest"),
      exercise("garage-week-1-legs-8", "Step Ups", "3", "20 reps per side", "rest between rounds"),
      header("garage-week-1-legs-gs3", "Giant Set #3", "3 rounds. Move exercise to exercise with no rest; rest only after Toe Out calf raises."),
      exercise("garage-week-1-legs-9", "Dumbbell Tibs", "3", "30 reps", "no rest"),
      exercise("garage-week-1-legs-10", "Single Leg Dumbbell Calf Raise \"Toes Straight\"", "3", "30 reps per side", "no rest"),
      exercise("garage-week-1-legs-11", "Single Leg Dumbbell Calf Raise \"Toe in\"", "3", "30 reps per side", "no rest"),
      exercise("garage-week-1-legs-12", "Single Leg Dumbbell Calf Raise \"Toe out\"", "3", "30 reps per side", "rest between rounds"),
    ],
    movementPatterns: ["squat", "hinge", "unilateral"],
    bodyAreas: ["quads", "hamstrings", "glutes", "calves", "tibialis"],
    equipment: ["barbell", "dumbbells", "resistance band", "bench/box"],
    functionalFocus: ["strength endurance", "unilateral control"],
    intensity: "hard",
    durationMinutes: 60,
    progressionNotes: "Keep lower-body structure. Rotate squat, hinge, lunge, calf, and tibialis variations later.",
    schedulingNotes: "Garage Program 2.0 — Week 1 Day 5.",
  },
];

export function createSeedSchedule(date: string): ScheduledWorkout[] {
  const startDate = new Date(`${date}T12:00:00`);

  return seedWorkouts.map((workout, index) => {
    const workoutDate = new Date(startDate);
    workoutDate.setDate(startDate.getDate() + index);

    return {
      id: `garage-week-1-scheduled-day-${index + 1}`,
      workoutId: workout.id,
      date: workoutDate.toISOString().slice(0, 10),
      status: "planned",
      activeStepIndex: 0,
    };
  });
}
