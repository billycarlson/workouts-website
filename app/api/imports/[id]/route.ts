import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { describeDbError } from "@/lib/api-errors";
import type { WorkoutImportDraft } from "@/lib/workout-types";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json()) as Partial<WorkoutImportDraft>;

    const existing = await prisma.workoutImportDraft.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.workoutImportDraft.update({
      where: { id },
      data: {
        ocrText: body.ocrText !== undefined ? body.ocrText : existing.ocrText,
        status: body.status ?? existing.status,
        workoutId: body.workoutId !== undefined ? body.workoutId : existing.workoutId,
        error: body.error !== undefined ? body.error : existing.error,
      },
    });

    const result: WorkoutImportDraft = {
      id: updated.id,
      fileName: updated.fileName,
      ocrText: updated.ocrText,
      status: updated.status as WorkoutImportDraft["status"],
      workoutId: updated.workoutId ?? undefined,
      error: updated.error ?? undefined,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("PUT /api/imports/[id] failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.workoutImportDraft.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.workoutImportDraft.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/imports/[id] failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
