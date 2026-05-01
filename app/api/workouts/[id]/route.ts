import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { mapDbWorkout } from "@/lib/db-mappers";
import type { WorkoutTemplate } from "@/lib/workout-types";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as Partial<WorkoutTemplate>;

  const existing = await prisma.workoutTemplate.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      ocrText: body.ocrText ?? existing.ocrText,
      cleanInstructions: body.cleanInstructions ?? existing.cleanInstructions,
      steps: body.steps ? (body.steps as object[]) : (existing.steps as object[]),
      movementPatterns: body.movementPatterns ?? existing.movementPatterns,
      bodyAreas: body.bodyAreas ?? existing.bodyAreas,
      equipment: body.equipment ?? existing.equipment,
      functionalFocus: body.functionalFocus ?? existing.functionalFocus,
      intensity: body.intensity !== undefined ? body.intensity : existing.intensity,
      durationMinutes: body.durationMinutes !== undefined ? body.durationMinutes : existing.durationMinutes,
      progressionNotes: body.progressionNotes !== undefined ? body.progressionNotes : existing.progressionNotes,
      schedulingNotes: body.schedulingNotes !== undefined ? body.schedulingNotes : existing.schedulingNotes,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(mapDbWorkout(updated));
}

export async function DELETE(_req: Request, { params }: Params) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.workoutTemplate.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.workoutTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
