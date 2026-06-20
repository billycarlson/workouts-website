"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasCookie, setCookie } from "cookies-next/client";

type Profile = { id: string; name: string };

const PROFILE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const err = (payload as { error: unknown }).error;
    if (typeof err === "string" && err.length > 0) return err;
  }
  return fallback;
}

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const alreadyPicked = hasCookie("profileId");

    (async () => {
      try {
        const res = await fetch("/api/profiles");
        const payload = await readJsonSafe(res);

        if (!res.ok) {
          if (cancelled) return;
          setLoadError(
            errorMessage(
              payload,
              `Couldn't load profiles (HTTP ${res.status}). Check the database connection.`,
            ),
          );
          setLoading(false);
          return;
        }

        const data = Array.isArray(payload) ? (payload as Profile[]) : [];

        // Only auto-redirect if the user doesn't already have a profile selected
        // (i.e. they were sent here by proxy, not from the burger menu)
        if (!alreadyPicked) {
          if (data.length === 0) {
            // First ever visit — auto-create Billy and go straight to the app
            const createRes = await fetch("/api/profiles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "Billy" }),
            });
            const createdPayload = await readJsonSafe(createRes);
            if (cancelled) return;
            if (!createRes.ok) {
              setLoadError(
                errorMessage(
                  createdPayload,
                  `Couldn't create the first profile (HTTP ${createRes.status}).`,
                ),
              );
              setLoading(false);
              return;
            }
            const created = createdPayload as Profile;
            setCookie("profileId", created.id, PROFILE_COOKIE_OPTIONS);
            router.push("/");
            router.refresh();
            return;
          }
          if (data.length === 1) {
            // Only one profile — auto-select it
            setCookie("profileId", data[0].id, PROFILE_COOKIE_OPTIONS);
            router.push("/");
            router.refresh();
            return;
          }
        }

        if (cancelled) return;
        // Multiple profiles, or came here from the menu — show the switcher
        setProfiles(data);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error
            ? `Couldn't reach the server: ${err.message}`
            : "Couldn't reach the server.",
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function selectProfile(id: string) {
    setCookie("profileId", id, PROFILE_COOKIE_OPTIONS);
    router.push("/");
    router.refresh();
  }

  function buildForProfile(id: string) {
    setCookie("profileId", id, PROFILE_COOKIE_OPTIONS);
    router.push("/library");
    router.refresh();
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const payload = await readJsonSafe(res);
      if (res.status === 409) {
        setError("That name is already taken.");
        return;
      }
      if (!res.ok) {
        setError(errorMessage(payload, "Something went wrong. Try again."));
        return;
      }
      const created = payload as Profile;
      await selectProfile(created.id);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm opacity-50">Loading…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col gap-4 text-center">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm opacity-70 break-words">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-current/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Who&apos;s working out?</h1>
        </div>

        <div className="flex flex-col gap-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="w-full rounded-xl border border-current/20 px-5 py-4 flex items-center justify-between gap-3"
            >
              <button
                onClick={() => selectProfile(p.id)}
                className="text-left text-base font-medium hover:opacity-70 transition-opacity"
              >
                {p.name}
              </button>
              <button
                onClick={() => buildForProfile(p.id)}
                className="text-xs font-medium opacity-50 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Build for them
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={createProfile} className="flex flex-col gap-3 pt-4 border-t border-current/10">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
            Add a new person
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
              className="flex-1 rounded-lg border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-current/50"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              {creating ? "…" : "Add"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </div>
    </main>
  );
}
