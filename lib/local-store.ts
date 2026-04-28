import { openDB, type DBSchema } from "idb";
import type { WorkoutAppState } from "./workout-types";

const databaseName = "workout-calendar";
const storeName = "app-state";
const stateKey = "state";

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

export async function loadWorkoutState() {
  const database = await getDatabase();

  if (!database) {
    return null;
  }

  return database.get(storeName, stateKey);
}

export async function saveWorkoutState(state: WorkoutAppState) {
  const database = await getDatabase();

  if (!database) {
    return;
  }

  await database.put(storeName, state, stateKey);
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
