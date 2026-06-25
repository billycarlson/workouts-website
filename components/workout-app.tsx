"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { deleteCookie, getCookie } from "cookies-next/client";
import { DisplayModeToggle } from "@/components/display-mode-toggle";
import { ExerciseVideo } from "@/components/exercise-video";
import { RasterCell, RasterGrid } from "@/components/raster";
import {
  readDisplayXxlEnabled,
  writeDisplayXxlEnabled,
} from "@/lib/display-mode";
import {
  broadcastGarage,
  readGarageActiveId,
  subscribeGarage,
  writeGarageActiveId,
} from "@/lib/garage-sync";
import {
  exportWorkoutState,
  loadWorkoutState,
  parseWorkoutStateExport,
  saveWorkoutState,
} from "@/lib/local-store";
import {
  type ExerciseStep,
  type ScheduledWorkout,
  type WorkoutAppState,
  type WorkoutImportDraft,
  type WorkoutStatus,
  type WorkoutTemplate,
} from "@/lib/workout-types";

const todayIso = toDateInputValue(new Date());

type WorkoutAppView =
  | "home"
  | "calendar"
  | "library"
  | "import"
  | "workout-edit"
  | "garage-workout"
  | "garage-plan";

const emptyState: WorkoutAppState = {
  workouts: [],
  scheduled: [],
  imports: [],
  selectedDate: todayIso,
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function parseExerciseSteps(text: string): ExerciseStep[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-•*\d.)\s]+/, ""))
    .filter((line) => line.length > 2);

  return lines.slice(0, 12).map((line, index) => ({
    id: createId("step"),
    label: line,
    restSeconds: index === lines.length - 1 ? undefined : 60,
  }));
}

function getWorkoutName(text: string, fallback: string) {
  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 64) || fallback.replace(/\.[^.]+$/, "");
}

function getCalendarDays(selectedDate: string) {
  const selected = new Date(`${selectedDate}T12:00:00`);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toDateInputValue(date);
  });
}

function getDayLabel(dateIso: string) {
  const date = new Date(`${dateIso}T12:00:00`);
  return {
    day: dayNames[date.getDay()],
    number: date.getDate().toString().padStart(2, "0"),
    month: monthNames[date.getMonth()],
  };
}

function statusLabel(status: WorkoutStatus) {
  if (status === "done") return "Done";
  if (status === "skipped") return "Skipped";
  if (status === "modified") return "Modified";
  return "Planned";
}

function getWeekDays(): string[] {
  const today = new Date();
  const dow = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toDateInputValue(d);
  });
}

function getWorkoutsThisWeek(scheduled: ScheduledWorkout[]): number {
  const days = new Set(getWeekDays());
  return scheduled.filter(
    (s) => days.has(s.date) && (s.status === "done" || s.status === "modified"),
  ).length;
}

function getStreak(scheduled: ScheduledWorkout[]): number {
  let streak = 0;
  const check = new Date();
  while (streak < 365) {
    const iso = toDateInputValue(check);
    const hit = scheduled.some(
      (s) => s.date === iso && (s.status === "done" || s.status === "modified"),
    );
    if (!hit) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}


function WorkoutAppInner({
  view = "home",
  workoutId,
}: {
  view?: WorkoutAppView;
  workoutId?: string;
}) {
  const [state, setState] = useState<WorkoutAppState>(emptyState);
  const profileIdRef = useRef<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState("");
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayXxl, setDisplayXxl] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const enabled = readDisplayXxlEnabled();
    setDisplayXxl(enabled);
    writeDisplayXxlEnabled(enabled);
  }, []);

  function toggleDisplayXxl() {
    setDisplayXxl((current) => {
      const next = !current;
      writeDisplayXxlEnabled(next);
      return next;
    });
  }

  const isGarageWorkout = view === "garage-workout";
  const isGaragePlan = view === "garage-plan";
  const isGarageView = isGarageWorkout || isGaragePlan;

  function beginActiveWorkout(id: string | null) {
    setActiveScheduleId(id);
  }

  async function refreshStateFromServer() {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) return;
      const data = (await res.json()) as WorkoutAppState;
      setState({ ...data, selectedDate: data.selectedDate || todayIso });
    } catch {
      /* offline */
    }
  }

  function notifyGarageRefresh() {
    broadcastGarage({ type: "refresh" });
  }

  useEffect(() => {
    if (!isGarageView) return;
    const stored = readGarageActiveId();
    if (stored) setActiveScheduleId(stored);
  }, [isGarageView]);

  useEffect(() => {
    return subscribeGarage((message) => {
      if (message.type === "active") {
        setActiveScheduleId(message.id);
      }
      if (message.type === "refresh") {
        void refreshStateFromServer();
      }
    });
  }, []);

  useEffect(() => {
    writeGarageActiveId(activeScheduleId);
    broadcastGarage({ type: "active", id: activeScheduleId });
  }, [activeScheduleId]);

  useEffect(() => {
    let isMounted = true;
    const cookieValue = getCookie("profileId");
    const currentProfileId = typeof cookieValue === "string" ? cookieValue : null;
    profileIdRef.current = currentProfileId;

    let serverApplied = false;

    // Phase 1: load cached state from IndexedDB immediately (offline-safe).
    // Skipped if the server already responded — its data is more authoritative.
    loadWorkoutState(currentProfileId).then((cached) => {
      if (isMounted && cached && !serverApplied) {
        setState({ ...cached, selectedDate: cached.selectedDate || todayIso });
      }
    });

    // Phase 2: fetch authoritative state from server
    fetch("/api/state")
      .then(async (res) => {
        if (res.status === 404) {
          deleteCookie("profileId", { path: "/" });
          window.location.href = "/profiles";
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data: WorkoutAppState | null) => {
        if (isMounted && data) {
          serverApplied = true;
          setState({ ...data, selectedDate: data.selectedDate || todayIso });
          void saveWorkoutState(currentProfileId, data);
        }
      })
      .catch(() => {/* offline — IndexedDB data already shown */});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    const hashRoutes: Record<string, string> = {
      "#library": "/library",
      "#schedule": "/calendar",
      "#import": "/import",
    };

    const targetPath = hashRoutes[hash];
    if (targetPath) {
      window.location.replace(targetPath);
    }
  }, []);

  const todayWorkouts = useMemo(
    () => state.scheduled.filter((scheduledWorkout) => scheduledWorkout.date === todayIso),
    [state.scheduled],
  );

  const selectedDateLabel = getDayLabel(state.selectedDate);
  const todayLabel = getDayLabel(todayIso);

  const primaryTodayScheduledWorkout = todayWorkouts[0] ?? null;
  const primaryTodayWorkout = primaryTodayScheduledWorkout
    ? state.workouts.find(
        (workout) => workout.id === primaryTodayScheduledWorkout.workoutId,
      )
    : null;

  const activeScheduledWorkout = useMemo(
    () =>
      state.scheduled.find(
        (scheduledWorkout) => scheduledWorkout.id === activeScheduleId,
      ) ?? null,
    [activeScheduleId, state.scheduled],
  );

  const activeWorkout = activeScheduledWorkout
    ? state.workouts.find(
        (workout) => workout.id === activeScheduledWorkout.workoutId,
      )
    : null;

  function updateState(updater: (current: WorkoutAppState) => WorkoutAppState) {
    setState((current) => {
      const next = updater(current);
      void saveWorkoutState(profileIdRef.current, next);
      return next;
    });
  }

  function syncPost(path: string, body: unknown) {
    void fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function syncPut(path: string, body: unknown) {
    void fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function syncDelete(path: string) {
    void fetch(path, { method: "DELETE" });
  }

  async function handleScreenshotUpload(files: FileList | null) {
    if (!files?.length) return;

    const fileList = Array.from(files);

    for (const file of fileList) {
      const draftId = createId("import");
      const draft: WorkoutImportDraft = {
        id: draftId,
        fileName: file.name,
        ocrText: "",
        status: "processing",
      };

      updateState((current) => ({
        ...current,
        imports: [draft, ...current.imports],
      }));
      syncPost("/api/imports", draft);

      try {
        const Tesseract = await import("tesseract.js");
        setOcrProgress(`Reading ${file.name}...`);
        const result = await Tesseract.recognize(file, "eng", {
          logger(message) {
            if (message.status === "recognizing text") {
              setOcrProgress(
                `Reading ${file.name} (${Math.round((message.progress ?? 0) * 100)}%)`,
              );
            }
          },
        });

        const ocrText = result.data.text;
        const now = new Date().toISOString();
        const workout: WorkoutTemplate = {
          id: createId("workout"),
          name: getWorkoutName(ocrText, file.name),
          createdAt: now,
          updatedAt: now,
          ocrText,
          cleanInstructions: ocrText.trim(),
          steps: parseExerciseSteps(ocrText),
          movementPatterns: [],
          bodyAreas: [],
          equipment: [],
          functionalFocus: [],
          intensity: "moderate",
        };

        updateState((current) => ({
          ...current,
          workouts: [workout, ...current.workouts],
          imports: current.imports.map((d) =>
            d.id === draftId
              ? { ...d, ocrText, status: "reviewed", workoutId: workout.id }
              : d,
          ),
        }));
        syncPost("/api/workouts", workout);
        syncPut(`/api/imports/${draftId}`, { ocrText, status: "reviewed", workoutId: workout.id });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "OCR failed for this screenshot.";
        updateState((current) => ({
          ...current,
          imports: current.imports.map((d) =>
            d.id === draftId ? { ...d, status: "failed", error: errMsg } : d,
          ),
        }));
        syncPut(`/api/imports/${draftId}`, { status: "failed", error: errMsg });
      }
    }

    setOcrProgress("");
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  }

  function dismissImport(id: string) {
    updateState((current) => ({
      ...current,
      imports: current.imports.filter((draft) => draft.id !== id),
    }));
    syncDelete(`/api/imports/${id}`);
  }

  function scheduleWorkout(workoutId: string, date: string) {
    const scheduledWorkout: ScheduledWorkout = {
      id: createId("scheduled"),
      workoutId,
      date,
      status: "planned",
      stepStatuses: [],
      activeStepIndex: 0,
    };

    updateState((current) => ({
      ...current,
      scheduled: [...current.scheduled, scheduledWorkout],
    }));
    syncPost("/api/scheduled", scheduledWorkout);
    notifyGarageRefresh();
  }

  function setWorkoutForToday(workoutId: string) {
    const scheduledWorkout: ScheduledWorkout = {
      id: createId("scheduled"),
      workoutId,
      date: todayIso,
      status: "planned",
      stepStatuses: [],
      activeStepIndex: 0,
    };

    updateState((current) => {
      const existingForToday = current.scheduled.filter((sw) => sw.date === todayIso);
      existingForToday.forEach((sw) => syncDelete(`/api/scheduled/${sw.id}`));
      const remaining = current.scheduled.filter((sw) => sw.date !== todayIso);
      return {
        ...current,
        selectedDate: todayIso,
        scheduled: [...remaining, scheduledWorkout],
      };
    });
    syncPost("/api/scheduled", scheduledWorkout);
    setChooserOpen(false);
    notifyGarageRefresh();
  }

  function updateWorkout(id: string, updates: Partial<WorkoutTemplate>) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) =>
        workout.id === id
          ? { ...workout, ...updates, updatedAt: new Date().toISOString() }
          : workout,
      ),
    }));
    syncPut(`/api/workouts/${id}`, updates);
  }

  function updateScheduledWorkout(
    id: string,
    updates: Partial<ScheduledWorkout>,
  ) {
    updateState((current) => ({
      ...current,
      scheduled: current.scheduled.map((scheduledWorkout) =>
        scheduledWorkout.id === id
          ? { ...scheduledWorkout, ...updates }
          : scheduledWorkout,
      ),
    }));
    syncPut(`/api/scheduled/${id}`, updates);
    notifyGarageRefresh();
  }

  function removeScheduledWorkout(id: string) {
    updateState((current) => ({
      ...current,
      scheduled: current.scheduled.filter(
        (scheduledWorkout) => scheduledWorkout.id !== id,
      ),
    }));
    syncDelete(`/api/scheduled/${id}`);
    notifyGarageRefresh();
  }

  function handleExport() {
    const blob = new Blob([exportWorkoutState(state)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workout-calendar-${todayIso}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportBackup(file: File | undefined) {
    if (!file) return;

    const text = await file.text();
    const imported = parseWorkoutStateExport(text);
    setState(imported);
    void saveWorkoutState(profileIdRef.current, imported);

    // Replace the server copy with the imported state so it survives a refresh.
    try {
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imported),
      });
      if (!res.ok) {
        console.error("Backup import: server replace failed", await res.text());
      }
    } catch (err) {
      console.error("Backup import: server replace failed", err);
    }
  }

  if (activeScheduledWorkout && activeWorkout && !isGaragePlan) {
    return (
      <ActiveWorkout
        scheduledWorkout={activeScheduledWorkout}
        workout={activeWorkout}
        displayXxl={displayXxl}
        garage={isGarageWorkout}
        onToggleDisplayXxl={toggleDisplayXxl}
        onBack={() => beginActiveWorkout(null)}
        onUpdate={updateScheduledWorkout}
      />
    );
  }

  const additionalTodayWorkouts = primaryTodayScheduledWorkout
    ? todayWorkouts.filter(
        (scheduledWorkout) => scheduledWorkout.id !== primaryTodayScheduledWorkout.id,
      )
    : [];

  if (view === "garage-workout") {
    return (
      <main className="garage-wall">
        <GarageScreensaver
          state={state}
          onStart={beginActiveWorkout}
        />
      </main>
    );
  }

  if (view === "garage-plan") {
    if (activeScheduledWorkout && activeWorkout) {
      const s2Steps = activeWorkout.steps;
      const s2Count = Math.max(s2Steps.length, 1);
      const s2Index = Math.min(
        Math.max(activeScheduledWorkout.activeStepIndex ?? 0, 0),
        s2Count - 1,
      );
      const s2Step = s2Steps[s2Index] ?? null;
      const s2Metrics = s2Step
        ? [
            s2Step.targetSets ? { label: "Sets", value: s2Step.targetSets } : null,
            s2Step.targetReps ? { label: "Reps", value: s2Step.targetReps } : null,
            s2Step.restLabel || s2Step.restSeconds !== undefined
              ? { label: "Rest", value: s2Step.restLabel ?? `${s2Step.restSeconds}s` }
              : null,
          ].filter((m): m is { label: string; value: string } => Boolean(m))
        : [];

      return (
        <main className="garage-wall garage-screen2">
          <header className="garage-wall-header">
            <p className="eyebrow">{activeWorkout.name}</p>
            <span>
              {s2Index + 1} / {s2Count}
            </span>
          </header>
          <RasterGrid columns={12} columnsS={4} columnsL={16} className="garage-screen2-grid">
            <RasterCell span="1..8" spanS="row" spanL="1..10" className="garage-screen2-exercise">
              <h1 className="garage-screen2-name">{s2Step?.label ?? activeWorkout.name}</h1>
              {s2Step?.detail ? (
                <p className="garage-screen2-detail">{s2Step.detail}</p>
              ) : null}
              {s2Metrics.length > 0 ? (
                <div className="active-metrics garage-screen2-metrics">
                  {s2Metrics.map((m) => (
                    <Metric key={m.label} label={m.label} value={m.value} />
                  ))}
                </div>
              ) : null}
            </RasterCell>
            <RasterCell span="9..12" spanS="row" spanL="11..16" className="garage-screen2-video">
              <ExerciseVideo
                url={s2Step?.videoUrl}
                label={s2Step?.label ?? activeWorkout.name}
                defaultExpanded
              />
            </RasterCell>
          </RasterGrid>
        </main>
      );
    }

    return (
      <main className="garage-wall garage-plan-wall book-shell">
        <header className="garage-wall-header">
          <p className="eyebrow">Plan screen</p>
          <span>
            {todayLabel.day} {todayLabel.number} {todayLabel.month}
          </span>
        </header>

        <RasterGrid columns={12} columnsS={4} columnsL={16} className="garage-plan-grid">
          <RasterCell span="1..9" spanS="row" spanL="1..11" className="garage-plan-calendar">
            <CalendarBoard
              days={getCalendarDays(state.selectedDate)}
              selectedDate={state.selectedDate}
              scheduled={state.scheduled}
              workouts={state.workouts}
              garage
              onSelectDate={(date) =>
                updateState((current) => ({ ...current, selectedDate: date }))
              }
              onStart={beginActiveWorkout}
              onRemove={removeScheduledWorkout}
            />
          </RasterCell>

          <RasterCell span="10..12" spanS="row" spanL="12..16" className="garage-plan-today">
            <h2>Today</h2>
            {todayWorkouts.length === 0 ? (
              <p className="empty-copy">Nothing scheduled for today.</p>
            ) : (
              <ul className="garage-today-list">
                {todayWorkouts.map((scheduledWorkout) => {
                  const workout = state.workouts.find(
                    (item) => item.id === scheduledWorkout.workoutId,
                  );
                  if (!workout) return null;

                  const isActive = scheduledWorkout.id === activeScheduleId;

                  return (
                    <li key={scheduledWorkout.id} className={isActive ? "is-active" : ""}>
                      <div>
                        <strong>{workout.name}</strong>
                        <span>{statusLabel(scheduledWorkout.status)}</span>
                      </div>
                      {isActive ? (
                        <span className="garage-live-badge">Live on workout screen</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => beginActiveWorkout(scheduledWorkout.id)}
                        >
                          Start here
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </RasterCell>
        </RasterGrid>
      </main>
    );
  }

  if (view === "home") {
    return (
      <main className="book-shell home-shell">
        <header className="home-topbar">
          <button type="button" className="menu-button" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
          <div className="home-topbar-actions">
            <DisplayModeToggle
              compact
              enabled={displayXxl}
              onToggle={toggleDisplayXxl}
            />
            <span>
              {todayLabel.day} {todayLabel.number} {todayLabel.month}
            </span>
          </div>
        </header>

        <RasterGrid columns={12} columnsS={4} columnsL={16} className="hero-grid today-hero">
          <RasterCell span="1..8" spanS="row" spanL="1..10" className="hero-spacer" aria-hidden="true">
            <span className="hero-date-mark">
              {todayLabel.day} {todayLabel.number}
            </span>
          </RasterCell>
          <RasterCell span="9..12" spanS="row" spanL="11..16">
            <div className="hero-copy">
              <p className="eyebrow">Today&apos;s workout</p>
              <h1>{primaryTodayWorkout ? primaryTodayWorkout.name : "No workout scheduled"}</h1>
              {primaryTodayWorkout && primaryTodayScheduledWorkout ? (
                <div className="hero-actions">
                  <button
                    type="button"
                    onClick={() => beginActiveWorkout(primaryTodayScheduledWorkout.id)}
                  >
                    Start workout
                  </button>
                  <span>{statusLabel(primaryTodayScheduledWorkout.status)}</span>
                </div>
              ) : (
                <div className="hero-actions">
                  <button type="button" onClick={() => setChooserOpen(true)}>
                    Choose workout for today
                  </button>
                  <Link href="/calendar">Open calendar</Link>
                </div>
              )}

              {additionalTodayWorkouts.length > 0 ? (
                <ul className="hero-extra">
                  {additionalTodayWorkouts.map((scheduledWorkout) => {
                    const workout = state.workouts.find(
                      (item) => item.id === scheduledWorkout.workoutId,
                    );
                    if (!workout) return null;

                    return (
                      <li key={scheduledWorkout.id}>
                        <span>{workout.name}</span>
                        <button
                          type="button"
                          onClick={() => beginActiveWorkout(scheduledWorkout.id)}
                        >
                          Start
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </RasterCell>
        </RasterGrid>

        {chooserOpen ? (
          <section className="section-block">
            <div className="section-heading">
              <span>01</span>
              <h2>Choose today&apos;s workout</h2>
            </div>
            <RasterGrid columns={12} columnsS={4} columnsL={16} className="workout-grid">
              {state.workouts.map((workout) => (
                <RasterCell key={workout.id} span={3} spanS="row" spanL={4}>
                  <WorkoutCard
                    workout={workout}
                    scheduleLabel="Set as today&apos;s workout"
                    onSchedule={() => setWorkoutForToday(workout.id)}
                  />
                </RasterCell>
              ))}
            </RasterGrid>
          </section>
        ) : null}

        {menuOpen ? (
          <>
            <button
              type="button"
              className="menu-overlay"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="menu-drawer">
              <button type="button" onClick={() => setMenuOpen(false)}>
                Close
              </button>
              <nav className="menu-links">
                <Link href="/">Today</Link>
                <Link href="/calendar">Open calendar</Link>
                <Link href="/library">Workout library</Link>
                <Link href="/import">Add from screenshot</Link>
                <Link href="/display">Garage displays</Link>
                <Link href="/profiles">Profiles</Link>
              </nav>
              <DisplayModeToggle enabled={displayXxl} onToggle={toggleDisplayXxl} />
              <button
                type="button"
                onClick={() => {
                  setChooserOpen(true);
                  setMenuOpen(false);
                }}
              >
                Choose workout of the day
              </button>
            </aside>
          </>
        ) : null}
      </main>
    );
  }

  if (view === "calendar") {
    return (
      <main className="book-shell">
        <header className="view-topbar">
          <Link href="/">Back to today</Link>
          <div className="view-topbar-actions">
            <DisplayModeToggle
              compact
              enabled={displayXxl}
              onToggle={toggleDisplayXxl}
            />
            <h1>Calendar</h1>
          </div>
        </header>

        <section className="section-block">
          <div className="calendar-tools">
            <label>
              Selected date
              <input
                type="date"
                value={state.selectedDate}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    selectedDate: event.target.value,
                  }))
                }
              />
            </label>
            <div className="backup-actions">
              <button type="button" onClick={handleExport}>
                Export data
              </button>
              <label className="import-backup">
                Import backup
                <input
                  type="file"
                  accept="application/json"
                  onChange={(event) =>
                    void handleImportBackup(event.target.files?.[0])
                  }
                />
              </label>
            </div>
          </div>

          <CalendarBoard
            days={getCalendarDays(state.selectedDate)}
            selectedDate={state.selectedDate}
            scheduled={state.scheduled}
            workouts={state.workouts}
            onSelectDate={(date) =>
              updateState((current) => ({ ...current, selectedDate: date }))
            }
            onStart={(id) => beginActiveWorkout(id)}
            onRemove={removeScheduledWorkout}
          />
        </section>
      </main>
    );
  }

  if (view === "workout-edit") {
    const workout = state.workouts.find((item) => item.id === workoutId);

    return (
      <main className="book-shell">
        <header className="view-topbar">
          <Link href="/library">Back to library</Link>
          <h1>Edit workout</h1>
        </header>

        <section className="section-block">
          {workout ? (
            <WorkoutStepEditor
              key={workout.id}
              workout={workout}
              onSave={(updates) => updateWorkout(workout.id, updates)}
            />
          ) : (
            <p className="empty-copy">
              That workout isn&apos;t loaded yet. Go back to the library and try again.
            </p>
          )}
        </section>
      </main>
    );
  }

  if (view === "library") {
    return (
      <main className="book-shell">
        <header className="view-topbar">
          <Link href="/">Back to today</Link>
          <div className="view-topbar-actions">
            <DisplayModeToggle
              compact
              enabled={displayXxl}
              onToggle={toggleDisplayXxl}
            />
            <h1>Workout library</h1>
          </div>
        </header>

        <section className="section-block">
          <div className="calendar-tools">
            <label>
              Schedule date
              <input
                type="date"
                value={state.selectedDate}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    selectedDate: event.target.value,
                  }))
                }
              />
            </label>
            <span className="eyebrow">
              {selectedDateLabel.day} {selectedDateLabel.number} / {selectedDateLabel.month}
            </span>
          </div>

          <RasterGrid columns={12} columnsS={4} columnsL={16} className="workout-grid">
            {state.workouts.map((workout) => (
              <RasterCell key={workout.id} span={3} spanS="row" spanL={4}>
                <WorkoutCard
                  workout={workout}
                  scheduleLabel="Schedule on selected date"
                  onSchedule={() => scheduleWorkout(workout.id, state.selectedDate)}
                />
              </RasterCell>
            ))}
            {state.workouts.length === 0 ? (
              <RasterCell span="row">
                <p className="empty-copy">No workouts saved yet.</p>
              </RasterCell>
            ) : null}
          </RasterGrid>
        </section>
      </main>
    );
  }

  return (
    <main className="book-shell">
      <header className="view-topbar">
        <Link href="/">Back to today</Link>
        <div className="view-topbar-actions">
          <DisplayModeToggle
            compact
            enabled={displayXxl}
            onToggle={toggleDisplayXxl}
          />
          <h1>Add from screenshot</h1>
        </div>
      </header>

      <section className="section-block">
        <div className="upload-card">
          <label className="upload-input">
            Upload one or more screenshots
            <input
              ref={importFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void handleScreenshotUpload(event.target.files)}
            />
          </label>
          {ocrProgress ? <strong>{ocrProgress}</strong> : null}
        </div>

        {state.imports.length > 0 ? (
          <ul className="import-log">
            {state.imports.map((draft) => (
              <ImportLogRow
                key={draft.id}
                draft={draft}
                workout={
                  draft.workoutId
                    ? state.workouts.find((item) => item.id === draft.workoutId) ?? null
                    : null
                }
                onDismiss={() => dismissImport(draft.id)}
              />
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

export function WorkoutApp(props: { view?: WorkoutAppView; workoutId?: string }) {
  return <WorkoutAppInner {...props} />;
}

function ImportLogRow({
  draft,
  workout,
  onDismiss,
}: {
  draft: WorkoutImportDraft;
  workout: WorkoutTemplate | null;
  onDismiss: () => void;
}) {
  let status: string;
  if (draft.status === "processing") {
    status = "Reading screenshot...";
  } else if (draft.status === "failed") {
    status = draft.error || "OCR failed";
  } else if (workout) {
    status = `Added: ${workout.name}`;
  } else {
    status = "Added to library";
  }

  return (
    <li className={`import-row ${draft.status === "failed" ? "is-failed" : ""}`}>
      <span className="import-file">{draft.fileName}</span>
      <span className="import-status">{status}</span>
      {draft.status !== "processing" ? (
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </li>
  );
}

function CalendarBoard({
  days,
  selectedDate,
  scheduled,
  workouts,
  onSelectDate,
  onStart,
  onRemove,
  garage = false,
}: {
  days: string[];
  selectedDate: string;
  scheduled: ScheduledWorkout[];
  workouts: WorkoutTemplate[];
  onSelectDate: (date: string) => void;
  onStart: (id: string) => void;
  onRemove: (id: string) => void;
  garage?: boolean;
}) {
  return (
    <RasterGrid columns={7} columnsS={2} columnsL={14} className="calendar-grid">
      {days.map((date) => {
        const label = getDayLabel(date);
        const dayWorkouts = scheduled.filter((item) => item.date === date);

        return (
          <RasterCell key={date} spanS="row">
            <div
              className={`calendar-day ${date === selectedDate ? "is-selected" : ""}`}
            >
              <button
                className="day-select"
                type="button"
                onClick={() => onSelectDate(date)}
              >
                <span className="day-name">{label.day}</span>
                <span className="day-number">{label.number}</span>
                <span className="day-month">{label.month}</span>
              </button>
              {dayWorkouts.map((scheduledWorkout) => {
                const workout = workouts.find(
                  (item) => item.id === scheduledWorkout.workoutId,
                );

                if (!workout) return null;

                return (
                  <span className="calendar-pill" key={scheduledWorkout.id}>
                    {workout.name}
                    <button
                      type="button"
                      onClick={() => onStart(scheduledWorkout.id)}
                    >
                      Start
                    </button>
                    {!garage ? (
                      <button
                        type="button"
                        onClick={() => onRemove(scheduledWorkout.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </RasterCell>
        );
      })}
    </RasterGrid>
  );
}

function WorkoutStepEditor({
  workout,
  onSave,
}: {
  workout: WorkoutTemplate;
  onSave: (updates: Partial<WorkoutTemplate>) => void;
}) {
  const [name, setName] = useState(workout.name);
  const [steps, setSteps] = useState<ExerciseStep[]>(workout.steps);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function updateStep(index: number, updates: Partial<ExerciseStep>) {
    setSteps((current) =>
      current.map((step, stepIndex) => (stepIndex === index ? { ...step, ...updates } : step)),
    );
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      { id: createId("step"), label: "New exercise", restSeconds: 60 },
    ]);
  }

  function handleSave() {
    onSave({ name, steps });
    setSavedAt(Date.now());
  }

  return (
    <div className="workout-editor">
      <label className="workout-editor-name">
        Workout name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <ul className="workout-editor-steps">
        {steps.map((step, index) => (
          <li key={step.id} className="workout-editor-step">
            <div className="workout-editor-step-header">
              <span className="eyebrow">Step {index + 1}</span>
              <div className="workout-editor-step-move">
                <button
                  type="button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label="Move step up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                  aria-label="Move step down"
                >
                  ↓
                </button>
                <button type="button" onClick={() => removeStep(index)}>
                  Remove
                </button>
              </div>
            </div>

            <label>
              Exercise name
              <input
                value={step.label}
                onChange={(event) => updateStep(index, { label: event.target.value })}
              />
            </label>

            <label>
              Detail / cue (optional)
              <input
                value={step.detail ?? ""}
                onChange={(event) => updateStep(index, { detail: event.target.value })}
              />
            </label>

            <div className="workout-editor-step-metrics">
              <label>
                Sets
                <input
                  value={step.targetSets ?? ""}
                  onChange={(event) => updateStep(index, { targetSets: event.target.value })}
                  placeholder="e.g. 3"
                />
              </label>
              <label>
                Reps
                <input
                  value={step.targetReps ?? ""}
                  onChange={(event) => updateStep(index, { targetReps: event.target.value })}
                  placeholder="e.g. 10-12"
                />
              </label>
              <label>
                Rest (seconds)
                <input
                  type="number"
                  value={step.restSeconds ?? ""}
                  onChange={(event) =>
                    updateStep(index, {
                      restSeconds: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  placeholder="e.g. 60"
                />
              </label>
            </div>

            <label>
              Video URL (YouTube, Vimeo, or a direct file link)
              <input
                value={step.videoUrl ?? ""}
                onChange={(event) => updateStep(index, { videoUrl: event.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </label>
            {step.videoUrl ? (
              <div className="workout-editor-video-preview">
                <ExerciseVideo url={step.videoUrl} label={step.label} />
                <span className="empty-copy">Tap to preview</span>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="workout-editor-footer">
        <button type="button" onClick={addStep}>
          Add step
        </button>
        <div className="workout-editor-save">
          {savedAt ? <span className="empty-copy">Saved</span> : null}
          <button type="button" className="workout-editor-save-button" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function GarageScreensaver({
  state,
  onStart,
}: {
  state: WorkoutAppState;
  onStart: (id: string) => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const weekdays = getWeekDays();
  const thisWeek = getWorkoutsThisWeek(state.scheduled);
  const streak = getStreak(state.scheduled);
  const todayLabel = getDayLabel(todayIso);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return (
    <div className="garage-screensaver">
      <div className="garage-screensaver-top">
        <div className="garage-screensaver-date-block">
          <span className="garage-screensaver-weekday">{dayNames[now.getDay()]}</span>
          <span className="garage-screensaver-datenum">{todayLabel.number}</span>
          <span className="garage-screensaver-month">{todayLabel.month}</span>
        </div>
        <span className="garage-screensaver-time">{hours}:{minutes}</span>
      </div>

      <div className="garage-screensaver-stats">
        <div className="garage-stat">
          <span className="garage-stat-value">{thisWeek}</span>
          <small className="garage-stat-label">This week</small>
        </div>
        <div className="garage-stat">
          <span className="garage-stat-value">{streak}</span>
          <small className="garage-stat-label">Day streak</small>
        </div>
      </div>

      <div className="garage-screensaver-week">
        {weekdays.map((date) => {
          const label = getDayLabel(date);
          const dayWorkouts = state.scheduled.filter((s) => s.date === date);
          const isToday = date === todayIso;
          return (
            <div key={date} className={`garage-week-day${isToday ? " is-today" : ""}`}>
              <span className="garage-week-dayname">{label.day}</span>
              <span className="garage-week-num">{label.number}</span>
              {dayWorkouts.map((sw) => {
                const workout = state.workouts.find((w) => w.id === sw.workoutId);
                if (!workout) return null;
                return (
                  <div key={sw.id} className={`garage-week-workout is-${sw.status}`}>
                    <span>{workout.name}</span>
                    {isToday ? (
                      <button type="button" onClick={() => onStart(sw.id)}>
                        Start
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutCard({
  workout,
  onSchedule,
  scheduleLabel,
}: {
  workout: WorkoutTemplate;
  onSchedule: () => void;
  scheduleLabel: string;
}) {
  const tags = [...workout.movementPatterns, ...workout.bodyAreas].slice(0, 5);

  return (
    <article className="workout-card">
      <h3>{workout.name}</h3>
      {tags.length > 0 ? (
        <div className="tag-row">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="workout-card-actions">
        <button type="button" onClick={onSchedule}>
          {scheduleLabel}
        </button>
        <Link href={`/library/${workout.id}`} className="workout-card-edit-link">
          Edit steps
        </Link>
      </div>
    </article>
  );
}

function ActiveWorkout({
  scheduledWorkout,
  workout,
  displayXxl,
  garage = false,
  onToggleDisplayXxl,
  onBack,
  onUpdate,
}: {
  scheduledWorkout: ScheduledWorkout;
  workout: WorkoutTemplate;
  displayXxl: boolean;
  garage?: boolean;
  onToggleDisplayXxl: () => void;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<ScheduledWorkout>) => void;
}) {
  const stepCount = Math.max(workout.steps.length, 1);
  const [manageOpen, setManageOpen] = useState(false);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const stepIndex = Math.min(
    Math.max(scheduledWorkout.activeStepIndex ?? 0, 0),
    stepCount - 1,
  );
  const step = workout.steps[stepIndex] ?? workout.steps[0];
  const nextStep = workout.steps[stepIndex + 1];
  const progress = `${stepIndex + 1}/${stepCount}`;
  const stepStatuses = Array.from({ length: stepCount }, (_, index) => {
    return scheduledWorkout.stepStatuses?.[index] ?? "planned";
  });
  const currentStepStatus = stepStatuses[stepIndex];
  const markedStepCount = stepStatuses.filter((status) => status !== "planned").length;
  const stepCompletionPercent = Math.round((markedStepCount / stepCount) * 100);
  const stepMetrics = step
    ? [
        step.targetSets ? { label: "Sets", value: step.targetSets } : null,
        step.targetReps ? { label: "Reps", value: step.targetReps } : null,
        step.restLabel || step.restSeconds !== undefined
          ? {
              label: "Rest",
              value: step.restLabel ?? `${step.restSeconds}s`,
            }
          : null,
      ].filter((metric): metric is { label: string; value: string } => Boolean(metric))
    : [];

  function setOverallStatus(status: WorkoutStatus) {
    onUpdate(scheduledWorkout.id, {
      status,
      completedAt: status === "planned" ? undefined : new Date().toISOString(),
    });
  }

  function setCurrentStepStatus(status: WorkoutStatus) {
    const nextStatuses = [...stepStatuses];
    nextStatuses[stepIndex] = status;
    onUpdate(scheduledWorkout.id, {
      stepStatuses: nextStatuses,
      status:
        scheduledWorkout.status === "planned" && status !== "planned"
          ? "modified"
          : scheduledWorkout.status,
    });
  }

  useEffect(() => {
    if (!filmstripRef.current) return;
    const activeEl = filmstripRef.current.querySelector<HTMLElement>(".is-active");
    activeEl?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [stepIndex]);

  const stepBlock = step ? (
    <div className="active-step">
      <div className="active-step-label-row">
        <p>{step.label}</p>
        <ExerciseVideo url={step.videoUrl} label={step.label} />
      </div>
      {step.detail ? <span>{step.detail}</span> : null}
      {stepMetrics.length > 0 ? (
        <div className="active-metrics">
          {stepMetrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      ) : null}
    </div>
  ) : (
    <p className="active-step">{workout.cleanInstructions || "No parsed steps yet."}</p>
  );

  const navBlock = (
    <div className="active-primary-controls">
      <button
        type="button"
        className="active-secondary-action"
        onClick={() =>
          onUpdate(scheduledWorkout.id, {
            activeStepIndex: Math.max(stepIndex - 1, 0),
          })
        }
      >
        Previous
      </button>
      <button
        type="button"
        className="active-primary-action"
        onClick={() =>
          onUpdate(scheduledWorkout.id, {
            activeStepIndex: Math.min(stepIndex + 1, stepCount - 1),
          })
        }
      >
        Next
      </button>
    </div>
  );

  const manageBlock = (
    <>
      <section className="active-finish">
        <p>Mark this exercise</p>
        <div className="active-finish-actions">
          <button type="button" onClick={() => setCurrentStepStatus("done")}>
            Done
          </button>
          <button type="button" onClick={() => setCurrentStepStatus("modified")}>
            Modified
          </button>
          <button type="button" onClick={() => setCurrentStepStatus("skipped")}>
            Skip
          </button>
          <button type="button" onClick={() => setCurrentStepStatus("planned")}>
            Reset
          </button>
        </div>
        <small>
          Current step status: {statusLabel(currentStepStatus)} ({markedStepCount}/{stepCount}{" "}
          marked)
        </small>
      </section>
      <section className="active-finish">
        <p>Finish entire workout</p>
        <div className="active-finish-actions">
          <button type="button" onClick={() => setOverallStatus("done")}>
            Done
          </button>
          <button type="button" onClick={() => setOverallStatus("modified")}>
            Modified
          </button>
          <button type="button" onClick={() => setOverallStatus("skipped")}>
            Skip
          </button>
          <button type="button" onClick={() => setOverallStatus("planned")}>
            Reset
          </button>
        </div>
        <small>Workout status: {statusLabel(scheduledWorkout.status)}</small>
      </section>
    </>
  );

  const controlsBlock = (
    <>
      {navBlock}
      {manageBlock}
    </>
  );

  if (garage) {
    return (
      <main className="active-mode garage-wall book-shell">
        <div className="active-topbar">
          <button type="button" onClick={onBack}>
            End workout
          </button>
          <span>{scheduledWorkout.date}</span>
        </div>

        <RasterGrid columns={12} columnsS={4} columnsL={16} className="garage-active-grid">
          <RasterCell span="6..12" spanS="row" spanL="5..16" className="garage-active-main">
            <div className="garage-active-primary">
              <div className="garage-active-exercise-row">
                <h1 className="garage-active-exercise-name">{step?.label ?? workout.name}</h1>
                <ExerciseVideo url={step?.videoUrl} label={step?.label ?? workout.name} />
              </div>
              {step?.detail ? <p className="garage-active-detail">{step.detail}</p> : null}
              {stepMetrics.length > 0 ? (
                <div className="active-metrics garage-active-metrics">
                  {stepMetrics.map((metric) => (
                    <Metric key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </div>
              ) : null}
            </div>
            {navBlock}
          </RasterCell>

          <RasterCell span="1..5" spanS="row" spanL="1..4" className="garage-active-side">
            <p className="eyebrow">{workout.name}</p>
            <span className="garage-active-progress">
              {progress} <span className="garage-active-progress-label">step</span>
            </span>
            {nextStep ? (
              <div className="garage-active-next">
                <p className="eyebrow">Up next</p>
                <p>{nextStep.label}</p>
              </div>
            ) : (
              <div className="garage-active-next">
                <p className="eyebrow">Up next</p>
                <p>Last exercise</p>
              </div>
            )}

            <button
              type="button"
              className="garage-manage-toggle"
              onClick={() => setManageOpen((open) => !open)}
              aria-expanded={manageOpen}
            >
              {manageOpen ? "Hide tracking" : "Mark / finish workout"}
            </button>
            {manageOpen ? <div className="garage-manage-panel">{manageBlock}</div> : null}
          </RasterCell>
        </RasterGrid>

        <div className="garage-filmstrip" ref={filmstripRef}>
          {workout.steps.map((s, i) => {
            const sStatus = stepStatuses[i];
            return (
              <button
                key={s.id}
                type="button"
                className={[
                  "filmstrip-step",
                  i === stepIndex ? "is-active" : "",
                  sStatus !== "planned" ? `is-${sStatus}` : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onUpdate(scheduledWorkout.id, { activeStepIndex: i })}
              >
                <span className="filmstrip-step-num">{i + 1}</span>
                <span className="filmstrip-step-label">{s.label}</span>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="active-mode">
      <div className="active-topbar">
        <button type="button" onClick={onBack}>
          Back
        </button>
        <div className="active-topbar-actions">
          <span className="active-step-count">{progress} step</span>
          <DisplayModeToggle
            compact
            enabled={displayXxl}
            onToggle={onToggleDisplayXxl}
          />
          <span>{scheduledWorkout.date}</span>
        </div>
      </div>
      <section className="active-card">
        <p className="eyebrow active-workout-label">{workout.name}</p>
        {stepBlock}
        <div className="active-step-progress">
          <div className="active-step-progress-label">
            <span>Steps marked</span>
            <strong>
              {markedStepCount}/{stepCount}
            </strong>
          </div>
          <div className="active-step-progress-track" aria-hidden="true">
            <div
              className="active-step-progress-fill"
              style={{ width: `${stepCompletionPercent}%` }}
            />
          </div>
        </div>
        {controlsBlock}
        <label>
          Session notes
          <textarea
            rows={3}
            value={scheduledWorkout.notes ?? ""}
            onChange={(event) =>
              onUpdate(scheduledWorkout.id, { notes: event.target.value })
            }
            placeholder="Energy, pain, substitutions, or anything to remember."
          />
        </label>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <small>{label}</small>
      <span>{value}</span>
    </div>
  );
}
