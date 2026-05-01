"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { id: string; name: string };

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: Profile[]) => setProfiles(data))
      .finally(() => setLoading(false));
  }, []);

  async function selectProfile(id: string) {
    document.cookie = `profileId=${id}; path=/; max-age=31536000; SameSite=Lax`;
    router.push("/");
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
      if (res.status === 409) {
        setError("That name is already taken.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      const created: Profile = await res.json();
      await selectProfile(created.id);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workout Calendar</h1>
          <p className="text-sm opacity-60 mt-1">Who&apos;s working out today?</p>
        </div>

        {loading ? (
          <p className="text-center opacity-50 text-sm">Loading…</p>
        ) : (
          <div className="flex flex-col gap-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProfile(p.id)}
                className="w-full rounded-xl border border-current/20 px-5 py-4 text-left text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={createProfile} className="flex flex-col gap-3 pt-2">
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
