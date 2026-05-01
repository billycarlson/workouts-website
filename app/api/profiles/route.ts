import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedWorkouts, createSeedSchedule } from "@/lib/seed-workouts";

export async function GET() {
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name?: string };

  if (!name || name.trim().length < 1) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const existing = await prisma.profile.findUnique({ where: { name: trimmedName } });
  if (existing) {
    return NextResponse.json({ error: "Name already taken" }, { status: 409 });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const schedule = createSeedSchedule(todayIso);

  const profile = await prisma.$transaction(async (tx) => {
    const newProfile = await tx.profile.create({ data: { name: trimmedName } });

    await tx.workoutTemplate.createMany({
      data: seedWorkouts.map((w) => ({
        id: w.id,
        profileId: newProfile.id,
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
        isSeed: true,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
      })),
    });

    await tx.scheduledWorkout.createMany({
      data: schedule.map((s) => ({
        id: s.id,
        profileId: newProfile.id,
        workoutId: s.workoutId,
        date: s.date,
        status: s.status,
        activeStepIndex: s.activeStepIndex ?? 0,
        isSeed: true,
      })),
    });

    return newProfile;
  });

  return NextResponse.json({ id: profile.id, name: profile.name }, { status: 201 });
}
