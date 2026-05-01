import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import type { ScheduledWorkout } from "@/lib/workout-types";

export async function POST(req: Request) {
  const profileId = await getProfileId();
  if (!profileId) {
    return NextResponse.json({ error: "No profile selected" }, { status: 401 });
  }

  const body = (await req.json()) as ScheduledWorkout;

  const created = await prisma.scheduledWorkout.create({
    data: {
      id: body.id,
      profileId,
      workoutId: body.workoutId,
      date: body.date,
      status: body.status,
      notes: body.notes ?? null,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
      activeStepIndex: body.activeStepIndex ?? null,
    },
  });

  const result: ScheduledWorkout = {
    id: created.id,
    workoutId: created.workoutId,
    date: created.date,
    status: created.status as ScheduledWorkout["status"],
    notes: created.notes ?? undefined,
    completedAt: created.completedAt?.toISOString() ?? undefined,
    activeStepIndex: created.activeStepIndex ?? undefined,
  };

  return NextResponse.json(result, { status: 201 });
}
