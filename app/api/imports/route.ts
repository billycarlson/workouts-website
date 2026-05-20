import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { describeDbError } from "@/lib/api-errors";
import type { WorkoutImportDraft } from "@/lib/workout-types";

export async function POST(req: Request) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const body = (await req.json()) as WorkoutImportDraft;

    const created = await dbQuery((prisma) =>
      prisma.workoutImportDraft.create({
        data: {
          id: body.id,
          profileId,
          fileName: body.fileName,
          ocrText: body.ocrText ?? "",
          status: body.status ?? "processing",
          workoutId: body.workoutId ?? null,
          error: body.error ?? null,
        },
      }),
    );

    const result: WorkoutImportDraft = {
      id: created.id,
      fileName: created.fileName,
      ocrText: created.ocrText,
      status: created.status as WorkoutImportDraft["status"],
      workoutId: created.workoutId ?? undefined,
      error: created.error ?? undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/imports failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
