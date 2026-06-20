import { WorkoutApp } from "@/components/workout-app";

type Params = { params: Promise<{ id: string }> };

export default async function WorkoutEditPage({ params }: Params) {
  const { id } = await params;
  return <WorkoutApp view="workout-edit" workoutId={id} />;
}
