import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { mapDbWorkout } from "@/lib/db-mappers";
import { describeDbError } from "@/lib/api-errors";
import type { WorkoutTemplate } from "@/lib/workout-types";

export async function POST(req: Request) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const body = (await req.json()) as WorkoutTemplate;

    const created = await dbQuery((prisma) =>
      prisma.workoutTemplate.create({
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
      }),
    );

    return NextResponse.json(mapDbWorkout(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/workouts failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
