export type MovementPattern =
  | "push"
  | "pull"
  | "squat"
  | "hinge"
  | "core"
  | "carry"
  | "mobility"
  | "conditioning"
  | "balance"
  | "unilateral";

export type WorkoutStatus = "planned" | "done" | "skipped" | "modified";

export type ExerciseStep = {
  id: string;
  label: string;
  detail?: string;
  targetSets?: string;
  targetReps?: string;
  restSeconds?: number;
  restLabel?: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  screenshotDataUrl?: string;
  ocrText: string;
  cleanInstructions: string;
  steps: ExerciseStep[];
  movementPatterns: MovementPattern[];
  bodyAreas: string[];
  equipment: string[];
  functionalFocus: string[];
  intensity?: "easy" | "moderate" | "hard";
  durationMinutes?: number;
  progressionNotes?: string;
  schedulingNotes?: string;
};

export type ScheduledWorkout = {
  id: string;
  workoutId: string;
  date: string;
  status: WorkoutStatus;
  notes?: string;
  completedAt?: string;
  activeStepIndex?: number;
};

export type WorkoutImportDraft = {
  id: string;
  fileName: string;
  imageDataUrl: string;
  ocrText: string;
  status: "ready" | "processing" | "reviewed" | "failed";
  error?: string;
};

export type WorkoutAppState = {
  workouts: WorkoutTemplate[];
  scheduled: ScheduledWorkout[];
  imports: WorkoutImportDraft[];
  selectedDate: string;
};

export const movementPatternOptions: MovementPattern[] = [
  "push",
  "pull",
  "squat",
  "hinge",
  "core",
  "carry",
  "mobility",
  "conditioning",
  "balance",
  "unilateral",
];
