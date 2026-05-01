import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { mapDbWorkout } from "@/lib/db-mappers";
import type { WorkoutTemplate } from "@/lib/workout-types";

export async function POST(req: Request) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const body = (await req.json()) as WorkoutTemplate;

  const created = await prisma.workoutTemplate.create({
    data: {
      id: body.id,
      profileId,
      name: body.name,
      ocrText: body.ocrText,
      cleanInstructions: body.cleanInstructions,
      steps: body.steps as object[],
      movementPatterns: body.movementPatterns,
      bodyAreas: body.bodyAreas,
      equipment: body.equipment,
      functionalFocus: body.functionalFocus,
      intensity: body.intensity ?? null,
      durationMinutes: body.durationMinutes ?? null,
      progressionNotes: body.progressionNotes ?? null,
      schedulingNotes: body.schedulingNotes ?? null,
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(body.updatedAt),
    },
  });

  return NextResponse.json(mapDbWorkout(created), { status: 201 });
}
