import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { describeDbError } from "@/lib/api-errors";
import type { ScheduledWorkout } from "@/lib/workout-types";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json()) as Partial<ScheduledWorkout>;

    const existing = await prisma.scheduledWorkout.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextStatus = body.status ?? existing.status;
    // Returning to "planned" should clear the completion timestamp.
    // (JSON serialisation strips `undefined` from the request body, so an
    // explicit transition to "planned" is the only reliable signal we get.)
    const completedAt =
      nextStatus === "planned"
        ? null
        : body.completedAt !== undefined
          ? new Date(body.completedAt)
          : existing.completedAt;

    const updated = await prisma.scheduledWorkout.update({
      where: { id },
      data: {
        status: nextStatus,
        stepStatuses: body.stepStatuses !== undefined ? body.stepStatuses : existing.stepStatuses,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        completedAt,
        activeStepIndex: body.activeStepIndex !== undefined ? body.activeStepIndex : existing.activeStepIndex,
      },
    });

    const result: ScheduledWorkout = {
      id: updated.id,
      workoutId: updated.workoutId,
      date: updated.date,
      status: updated.status as ScheduledWorkout["status"],
      stepStatuses: updated.stepStatuses as ScheduledWorkout["stepStatuses"],
      notes: updated.notes ?? undefined,
      completedAt: updated.completedAt?.toISOString() ?? undefined,
      activeStepIndex: updated.activeStepIndex ?? undefined,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("PUT /api/scheduled/[id] failed", err);
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

    const existing = await prisma.scheduledWorkout.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.scheduledWorkout.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/scheduled/[id] failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
