import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { mapDbWorkout } from "@/lib/db-mappers";
import type { ScheduledWorkout, WorkoutImportDraft } from "@/lib/workout-types";

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

export async function PATCH(req: Request) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  // selectedDate is UI-only state; acknowledged but not persisted server-side
  await req.json();
  return NextResponse.json({ ok: true });
}
