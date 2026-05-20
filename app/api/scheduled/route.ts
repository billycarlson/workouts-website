import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/prisma";
import { getProfileId } from "@/lib/profile-cookie";
import { describeDbError } from "@/lib/api-errors";
import type { ScheduledWorkout } from "@/lib/workout-types";

export async function POST(req: Request) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "No profile selected" }, { status: 401 });
    }

    const body = (await req.json()) as ScheduledWorkout;

    const created = await dbQuery((prisma) =>
      prisma.scheduledWorkout.create({
        data: {
          id: body.id,
          profileId,
          workoutId: body.workoutId,
          date: body.date,
          status: body.status,
          stepStatuses: body.stepStatuses ?? [],
          notes: body.notes ?? null,
          completedAt: body.completedAt ? new Date(body.completedAt) : null,
          activeStepIndex: body.activeStepIndex ?? null,
        },
      }),
    );

    const result: ScheduledWorkout = {
      id: created.id,
      workoutId: created.workoutId,
      date: created.date,
      status: created.status as ScheduledWorkout["status"],
      stepStatuses: created.stepStatuses as ScheduledWorkout["stepStatuses"],
      notes: created.notes ?? undefined,
      completedAt: created.completedAt?.toISOString() ?? undefined,
      activeStepIndex: created.activeStepIndex ?? undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/scheduled failed", err);
    return NextResponse.json({ error: describeDbError(err) }, { status: 500 });
  }
}
