import { openDB, type DBSchema } from "idb";
import type { WorkoutAppState } from "./workout-types";

const databaseName = "workout-calendar";
const storeName = "app-state";

interface WorkoutCalendarDatabase extends DBSchema {
  [storeName]: {
    key: string;
    value: WorkoutAppState;
  };
}

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

async function getDatabase() {
  if (!canUseIndexedDb()) {
    return null;
  }

  return openDB<WorkoutCalendarDatabase>(databaseName, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName);
      }
    },
  });
}

function stateKeyFor(profileId: string | null | undefined) {
  return profileId ? `state:${profileId}` : null;
}

export async function loadWorkoutState(profileId: string | null | undefined) {
  const key = stateKeyFor(profileId);
  if (!key) return null;

  const database = await getDatabase();
  if (!database) return null;

  return database.get(storeName, key);
}

export async function saveWorkoutState(
  profileId: string | null | undefined,
  state: WorkoutAppState,
) {
  const key = stateKeyFor(profileId);
  if (!key) return;

  const database = await getDatabase();
  if (!database) return;

  await database.put(storeName, state, key);
}

export async function clearWorkoutState(
  profileId: string | null | undefined,
) {
  const key = stateKeyFor(profileId);
  if (!key) return;

  const database = await getDatabase();
  if (!database) return;

  await database.delete(storeName, key);
}

export function exportWorkoutState(state: WorkoutAppState) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      state,
    },
    null,
    2,
  );
}

export function parseWorkoutStateExport(json: string): WorkoutAppState {
  const parsed = JSON.parse(json) as { state?: WorkoutAppState };

  if (!parsed.state || !Array.isArray(parsed.state.workouts)) {
    throw new Error("This file does not look like a workout calendar export.");
  }

  return parsed.state;
}
