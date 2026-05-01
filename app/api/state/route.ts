import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { mapDbWorkout } from "@/lib/db-mappers";
import type {
  ScheduledWorkout,
  WorkoutAppState,
  WorkoutImportDraft,
} from "@/lib/workout-types";

export async function GET() {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const [workouts, scheduled, imports, profile] = await Promise.all([
    prisma.workoutTemplate.findMany({
      where: { profileId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.scheduledWorkout.findMany({
      where: { profileId },
      orderBy: { date: "asc" },
    }),
    prisma.workoutImportDraft.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { id: profileId }, select: { id: true } }),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const mappedScheduled: ScheduledWorkout[] = scheduled.map((s) => ({
    id: s.id,
    workoutId: s.workoutId,
    date: s.date,
    status: s.status as ScheduledWorkout["status"],
    notes: s.notes ?? undefined,
    completedAt: s.completedAt?.toISOString() ?? undefined,
    activeStepIndex: s.activeStepIndex ?? undefined,
  }));

  const mappedImports: WorkoutImportDraft[] = imports.map((i) => ({
    id: i.id,
    fileName: i.fileName,
    ocrText: i.ocrText,
    status: i.status as WorkoutImportDraft["status"],
    workoutId: i.workoutId ?? undefined,
    error: i.error ?? undefined,
  }));

  return NextResponse.json({
    workouts: workouts.map(mapDbWorkout),
    scheduled: mappedScheduled,
    imports: mappedImports,
    selectedDate: new Date().toISOString().slice(0, 10),
  });
}

// Replaces this profile's entire state. Used by the "Import backup" feature.
export async function PUT(req: Request) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<WorkoutAppState>;
  const workouts = body.workouts ?? [];
  const scheduled = body.scheduled ?? [];
  const imports = body.imports ?? [];

  await prisma.$transaction(async (tx) => {
    // Order matters: scheduled and imports reference workouts.
    await tx.scheduledWorkout.deleteMany({ where: { profileId } });
    await tx.workoutImportDraft.deleteMany({ where: { profileId } });
    await tx.workoutTemplate.deleteMany({ where: { profileId } });

    if (workouts.length > 0) {
      await tx.workoutTemplate.createMany({
        data: workouts.map((w) => ({
          id: w.id,
          profileId,
          name: w.name,
          ocrText: w.ocrText,
          cleanInstructions: w.cleanInstructions,
          steps: w.steps as object[],
          movementPatterns: w.movementPatterns,
          bodyAreas: w.bodyAreas,
          equipment: w.equipment,
          functionalFocus: w.functionalFocus,
          intensity: w.intensity ?? null,
          durationMinutes: w.durationMinutes ?? null,
          progressionNotes: w.progressionNotes ?? null,
          schedulingNotes: w.schedulingNotes ?? null,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
        })),
      });
    }

    if (scheduled.length > 0) {
      await tx.scheduledWorkout.createMany({
        data: scheduled.map((s) => ({
          id: s.id,
          profileId,
          workoutId: s.workoutId,
          date: s.date,
          status: s.status,
          notes: s.notes ?? null,
          completedAt: s.completedAt ? new Date(s.completedAt) : null,
          activeStepIndex: s.activeStepIndex ?? null,
        })),
      });
    }

    if (imports.length > 0) {
      await tx.workoutImportDraft.createMany({
        data: imports.map((i) => ({
          id: i.id,
          profileId,
          fileName: i.fileName,
          ocrText: i.ocrText ?? "",
          status: i.status ?? "processing",
          workoutId: i.workoutId ?? null,
          error: i.error ?? null,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
