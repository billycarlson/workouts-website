export const GARAGE_ACTIVE_STORAGE_KEY = "garage-active-schedule-id";

export type GarageSyncMessage =
  | { type: "active"; id: string | null }
  | { type: "refresh" };

const CHANNEL_NAME = "workouts-garage-v1";

function getChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}

export function readGarageActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(GARAGE_ACTIVE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeGarageActiveId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(GARAGE_ACTIVE_STORAGE_KEY, id);
    else sessionStorage.removeItem(GARAGE_ACTIVE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function broadcastGarage(message: GarageSyncMessage) {
  getChannel()?.postMessage(message);
}

export function subscribeGarage(handler: (message: GarageSyncMessage) => void) {
  const channel = getChannel();
  if (!channel) return () => undefined;

  channel.onmessage = (event: MessageEvent<GarageSyncMessage>) => {
    handler(event.data);
  };

  return () => channel.close();
}
