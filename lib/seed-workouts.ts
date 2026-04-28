import type { ScheduledWorkout, WorkoutTemplate } from "./workout-types";

const seededAt = "2026-04-28T00:00:00.000Z";

export const seedWorkouts: WorkoutTemplate[] = [
  {
    id: "seed-lower-body-control",
    name: "Lower Body Control",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Warm up with mobility, then move through squat, hinge, unilateral balance, and core stability work. Keep the pace controlled and stop before form breaks.",
    steps: [
      {
        id: "seed-lower-body-control-step-1",
        label: "Hip and ankle mobility",
        targetSets: "1",
        targetReps: "5 min",
        restSeconds: 30,
      },
      {
        id: "seed-lower-body-control-step-2",
        label: "Goblet squat with slow lower",
        targetSets: "3",
        targetReps: "8",
        restSeconds: 75,
      },
      {
        id: "seed-lower-body-control-step-3",
        label: "Romanian deadlift",
        targetSets: "3",
        targetReps: "10",
        restSeconds: 75,
      },
      {
        id: "seed-lower-body-control-step-4",
        label: "Reverse lunge to balance",
        targetSets: "3",
        targetReps: "8 each side",
        restSeconds: 60,
      },
      {
        id: "seed-lower-body-control-step-5",
        label: "Side plank",
        targetSets: "2",
        targetReps: "30 sec each side",
        restSeconds: 45,
      },
    ],
    movementPatterns: ["squat", "hinge", "unilateral", "balance", "core"],
    bodyAreas: ["legs", "hips", "core"],
    equipment: ["dumbbell", "bodyweight"],
    functionalFocus: ["unilateral control", "core stability", "balance"],
    intensity: "moderate",
    durationMinutes: 35,
    progressionNotes:
      "Add range, tempo, or control before adding load. Keep this functional, not maximal.",
    schedulingNotes: "Good first session of the week.",
  },
  {
    id: "seed-upper-body-carry",
    name: "Push Pull Carry",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "Pair pushing and pulling with loaded carries. Focus on shoulder control, trunk stiffness, and clean reps.",
    steps: [
      {
        id: "seed-upper-body-carry-step-1",
        label: "Scapular push-up",
        targetSets: "2",
        targetReps: "10",
        restSeconds: 45,
      },
      {
        id: "seed-upper-body-carry-step-2",
        label: "Incline push-up or dumbbell press",
        targetSets: "3",
        targetReps: "8-12",
        restSeconds: 75,
      },
      {
        id: "seed-upper-body-carry-step-3",
        label: "One-arm row",
        targetSets: "3",
        targetReps: "10 each side",
        restSeconds: 75,
      },
      {
        id: "seed-upper-body-carry-step-4",
        label: "Suitcase carry",
        targetSets: "4",
        targetReps: "30 sec each side",
        restSeconds: 60,
      },
    ],
    movementPatterns: ["push", "pull", "carry", "core"],
    bodyAreas: ["chest", "back", "shoulders", "core"],
    equipment: ["dumbbells"],
    functionalFocus: ["core stability", "strength endurance"],
    intensity: "moderate",
    durationMinutes: 30,
    progressionNotes:
      "Increase carry distance or time before increasing dumbbell weight.",
    schedulingNotes: "Works well between lower body days.",
  },
  {
    id: "seed-mobility-core-reset",
    name: "Mobility Core Reset",
    createdAt: seededAt,
    updatedAt: seededAt,
    ocrText: "",
    cleanInstructions:
      "A lighter session for movement quality, trunk control, and recovery. Keep breathing steady and range of motion smooth.",
    steps: [
      {
        id: "seed-mobility-core-reset-step-1",
        label: "Cat cow to thoracic rotation",
        targetSets: "2",
        targetReps: "8 each",
        restSeconds: 30,
      },
      {
        id: "seed-mobility-core-reset-step-2",
        label: "Dead bug",
        targetSets: "3",
        targetReps: "8 each side",
        restSeconds: 45,
      },
      {
        id: "seed-mobility-core-reset-step-3",
        label: "Glute bridge march",
        targetSets: "3",
        targetReps: "10 each side",
        restSeconds: 45,
      },
      {
        id: "seed-mobility-core-reset-step-4",
        label: "Deep squat hold with breathing",
        targetSets: "3",
        targetReps: "30 sec",
        restSeconds: 45,
      },
    ],
    movementPatterns: ["mobility", "core", "balance"],
    bodyAreas: ["spine", "hips", "core"],
    equipment: ["bodyweight"],
    functionalFocus: ["mobility", "core stability", "recovery"],
    intensity: "easy",
    durationMinutes: 25,
    progressionNotes: "Make the movement smoother before making it harder.",
    schedulingNotes: "Use after harder days or when you want a lighter session.",
  },
];

export function createSeedSchedule(date: string): ScheduledWorkout[] {
  return [
    {
      id: "seed-scheduled-today",
      workoutId: seedWorkouts[0].id,
      date,
      status: "planned",
      activeStepIndex: 0,
    },
  ];
}
