import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import type { ScheduledWorkout } from "@/lib/workout-types";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
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

  const updated = await prisma.scheduledWorkout.update({
    where: { id },
    data: {
      status: body.status ?? existing.status,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      completedAt: body.completedAt !== undefined ? new Date(body.completedAt) : existing.completedAt,
      activeStepIndex: body.activeStepIndex !== undefined ? body.activeStepIndex : existing.activeStepIndex,
    },
  });

  const result: ScheduledWorkout = {
    id: updated.id,
    workoutId: updated.workoutId,
    date: updated.date,
    status: updated.status as ScheduledWorkout["status"],
    notes: updated.notes ?? undefined,
    completedAt: updated.completedAt?.toISOString() ?? undefined,
    activeStepIndex: updated.activeStepIndex ?? undefined,
  };

  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: Params) {
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
}
