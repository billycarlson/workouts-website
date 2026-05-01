import type { ExerciseStep, WorkoutTemplate } from "./workout-types";

export function mapDbWorkout(row: {
  id: string;
  profileId: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  ocrText: string;
  cleanInstructions: string;
  steps: unknown;
  movementPatterns: string[];
  bodyAreas: string[];
  equipment: string[];
  functionalFocus: string[];
  intensity: string | null;
  durationMinutes: number | null;
  progressionNotes: string | null;
  schedulingNotes: string | null;
}): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    ocrText: row.ocrText,
    cleanInstructions: row.cleanInstructions,
    steps: row.steps as ExerciseStep[],
    movementPatterns: row.movementPatterns as WorkoutTemplate["movementPatterns"],
    bodyAreas: row.bodyAreas,
    equipment: row.equipment,
    functionalFocus: row.functionalFocus,
    intensity: (row.intensity as WorkoutTemplate["intensity"]) ?? undefined,
    durationMinutes: row.durationMinutes ?? undefined,
    progressionNotes: row.progressionNotes ?? undefined,
    schedulingNotes: row.schedulingNotes ?? undefined,
  };
}
