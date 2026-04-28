"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  exportWorkoutState,
  loadWorkoutState,
  parseWorkoutStateExport,
  saveWorkoutState,
} from "@/lib/local-store";
import { createSeedSchedule, seedWorkouts } from "@/lib/seed-workouts";
import {
  movementPatternOptions,
  type ExerciseStep,
  type MovementPattern,
  type ScheduledWorkout,
  type WorkoutAppState,
  type WorkoutImportDraft,
  type WorkoutStatus,
  type WorkoutTemplate,
} from "@/lib/workout-types";

const todayIso = toDateInputValue(new Date());

const starterState: WorkoutAppState = {
  workouts: seedWorkouts,
  scheduled: createSeedSchedule(todayIso),
  imports: [],
  selectedDate: todayIso,
};

const functionalFocusOptions = [
  "strength endurance",
  "mobility",
  "core stability",
  "balance",
  "unilateral control",
  "power",
  "conditioning",
  "recovery",
];

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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function isSeedId(id: string) {
  return id.startsWith("seed-") || id.startsWith("garage-week-1-");
}

function hydrateStoredState(storedState: WorkoutAppState | undefined | null) {
  if (!storedState) {
    return starterState;
  }

  const customWorkouts = storedState.workouts.filter(
    (workout) => !isSeedId(workout.id),
  );
  const customScheduled = storedState.scheduled.filter(
    (scheduledWorkout) =>
      !isSeedId(scheduledWorkout.id) && !isSeedId(scheduledWorkout.workoutId),
  );
  const selectedDate = storedState.selectedDate || todayIso;

  return {
    ...storedState,
    selectedDate,
    workouts: [...seedWorkouts, ...customWorkouts],
    scheduled: [...createSeedSchedule(selectedDate), ...customScheduled],
  };
}

export function WorkoutApp() {
  const [state, setState] = useState<WorkoutAppState>(starterState);
  const [loaded, setLoaded] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    loadWorkoutState()
      .then((storedState) => {
        if (isMounted) {
          setState(hydrateStoredState(storedState));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      void saveWorkoutState(state);
    }
  }, [loaded, state]);

  const selectedDateWorkouts = useMemo(
    () =>
      state.scheduled.filter(
        (scheduledWorkout) => scheduledWorkout.date === state.selectedDate,
      ),
    [state.scheduled, state.selectedDate],
  );

  const selectedDateLabel = getDayLabel(state.selectedDate);
  const primaryScheduledWorkout = selectedDateWorkouts[0] ?? null;
  const primaryWorkout = primaryScheduledWorkout
    ? state.workouts.find(
        (workout) => workout.id === primaryScheduledWorkout.workoutId,
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
    setState((current) => updater(current));
  }

  async function handleScreenshotUpload(files: FileList | null) {
    if (!files?.length) return;

    const fileList = Array.from(files);
    setOcrProgress("Reading screenshots...");

    for (const file of fileList) {
      const imageDataUrl = await readFileAsDataUrl(file);
      const draftId = createId("import");

      updateState((current) => ({
        ...current,
        imports: [
          {
            id: draftId,
            fileName: file.name,
            imageDataUrl,
            ocrText: "",
            status: "processing",
          },
          ...current.imports,
        ],
      }));

      try {
        const Tesseract = await import("tesseract.js");
        setOcrProgress(`Extracting text from ${file.name}...`);
        const result = await Tesseract.recognize(file, "eng", {
          logger(message) {
            if (message.status) {
              setOcrProgress(`${message.status} ${Math.round((message.progress ?? 0) * 100)}%`);
            }
          },
        });

        updateState((current) => ({
          ...current,
          imports: current.imports.map((draft) =>
            draft.id === draftId
              ? { ...draft, ocrText: result.data.text, status: "ready" }
              : draft,
          ),
        }));
      } catch (error) {
        updateState((current) => ({
          ...current,
          imports: current.imports.map((draft) =>
            draft.id === draftId
              ? {
                  ...draft,
                  status: "failed",
                  error:
                    error instanceof Error
                      ? error.message
                      : "OCR failed for this screenshot.",
                }
              : draft,
          ),
        }));
      }
    }

    setOcrProgress("");
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  }

  function saveDraftAsWorkout(draft: WorkoutImportDraft, formData: FormData) {
    const now = new Date().toISOString();
    const cleanInstructions = String(formData.get("cleanInstructions") || "");
    const movementPatterns = formData.getAll("movementPatterns") as MovementPattern[];

    const workout: WorkoutTemplate = {
      id: createId("workout"),
      name: String(formData.get("name") || getWorkoutName(draft.ocrText, draft.fileName)),
      createdAt: now,
      updatedAt: now,
      screenshotDataUrl: draft.imageDataUrl,
      ocrText: draft.ocrText,
      cleanInstructions,
      steps: parseExerciseSteps(cleanInstructions || draft.ocrText),
      movementPatterns,
      bodyAreas: splitCsv(String(formData.get("bodyAreas") || "")),
      equipment: splitCsv(String(formData.get("equipment") || "")),
      functionalFocus: formData.getAll("functionalFocus").map(String),
      intensity: String(formData.get("intensity") || "moderate") as WorkoutTemplate["intensity"],
      durationMinutes: Number(formData.get("durationMinutes")) || undefined,
      progressionNotes: String(formData.get("progressionNotes") || ""),
      schedulingNotes: String(formData.get("schedulingNotes") || ""),
    };

    updateState((current) => ({
      ...current,
      workouts: [workout, ...current.workouts],
      imports: current.imports.map((item) =>
        item.id === draft.id ? { ...item, status: "reviewed" } : item,
      ),
    }));
  }

  function scheduleWorkout(workoutId: string) {
    const scheduledWorkout: ScheduledWorkout = {
      id: createId("scheduled"),
      workoutId,
      date: state.selectedDate,
      status: "planned",
      activeStepIndex: 0,
    };

    updateState((current) => ({
      ...current,
      scheduled: [...current.scheduled, scheduledWorkout],
    }));
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
  }

  function removeScheduledWorkout(id: string) {
    updateState((current) => ({
      ...current,
      scheduled: current.scheduled.filter(
        (scheduledWorkout) => scheduledWorkout.id !== id,
      ),
    }));
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
    setState(parseWorkoutStateExport(text));
  }

  if (activeScheduledWorkout && activeWorkout) {
    return (
      <ActiveWorkout
        scheduledWorkout={activeScheduledWorkout}
        workout={activeWorkout}
        onBack={() => setActiveScheduleId(null)}
        onUpdate={updateScheduledWorkout}
      />
    );
  }

  return (
    <main className="book-shell">
      <section className="hero-grid today-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            {selectedDateLabel.day} / {selectedDateLabel.month}
          </p>
          <h1>{primaryWorkout ? primaryWorkout.name : "Today's workout"}</h1>
          {primaryWorkout && primaryScheduledWorkout ? (
            <>
              <p>{primaryWorkout.cleanInstructions.slice(0, 180)}</p>
              <div className="hero-actions">
                <button
                  type="button"
                  onClick={() => setActiveScheduleId(primaryScheduledWorkout.id)}
                >
                  Start workout
                </button>
                <span>{statusLabel(primaryScheduledWorkout.status)}</span>
              </div>
            </>
          ) : (
            <>
              <p>Nothing scheduled yet. Pick a workout from the library below.</p>
              <div className="hero-actions">
                <a href="#library">Choose workout</a>
                <a href="#schedule">Open calendar</a>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>01</span>
          <h2>Today</h2>
        </div>
        <SelectedDateList
          scheduledWorkouts={selectedDateWorkouts}
          workouts={state.workouts}
          selectedDate={state.selectedDate}
          onStart={(id) => setActiveScheduleId(id)}
        />
      </section>

      <section className="section-block" id="schedule">
        <div className="section-heading">
          <span>02</span>
          <h2>Calendar</h2>
        </div>
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
          onStart={(id) => setActiveScheduleId(id)}
          onRemove={removeScheduledWorkout}
        />
      </section>

      <section className="section-block" id="library">
        <div className="section-heading">
          <span>03</span>
          <h2>Workout library</h2>
        </div>
        <div className="workout-grid">
          {state.workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSchedule={() => scheduleWorkout(workout.id)}
            />
          ))}
          {state.workouts.length === 0 ? (
            <p className="empty-copy">
              No workouts saved yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="section-block" id="import">
        <div className="section-heading">
          <span>04</span>
          <h2>Add workouts</h2>
        </div>
        <div className="upload-card">
          <input
            ref={importFileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => void handleScreenshotUpload(event.target.files)}
          />
          {ocrProgress ? <strong>{ocrProgress}</strong> : null}
        </div>

        <div className="review-grid">
          {state.imports.map((draft) => (
            <ImportReviewCard
              key={draft.id}
              draft={draft}
              onSave={saveDraftAsWorkout}
            />
          ))}
          {state.imports.length === 0 ? (
            <p className="empty-copy">Upload screenshots when you are ready.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function SelectedDateList({
  scheduledWorkouts,
  workouts,
  selectedDate,
  onStart,
}: {
  scheduledWorkouts: ScheduledWorkout[];
  workouts: WorkoutTemplate[];
  selectedDate: string;
  onStart: (id: string) => void;
}) {
  return (
    <div className="today-list">
      <h3>{selectedDate}</h3>
      {scheduledWorkouts.map((scheduledWorkout) => {
        const workout = workouts.find(
          (item) => item.id === scheduledWorkout.workoutId,
        );

        if (!workout) return null;

        return (
          <div className="planned-row" key={scheduledWorkout.id}>
            <div>
              <strong>{workout.name}</strong>
              <span>{statusLabel(scheduledWorkout.status)}</span>
            </div>
            <button type="button" onClick={() => onStart(scheduledWorkout.id)}>
              Start
            </button>
          </div>
        );
      })}
      {scheduledWorkouts.length === 0 ? (
        <p className="empty-copy">No workout scheduled for this day.</p>
      ) : null}
    </div>
  );
}

function ImportReviewCard({
  draft,
  onSave,
}: {
  draft: WorkoutImportDraft;
  onSave: (draft: WorkoutImportDraft, formData: FormData) => void;
}) {
  if (draft.status === "reviewed") {
    return (
      <article className="review-card is-reviewed">
        <strong>{draft.fileName}</strong>
        <p>Added to library.</p>
      </article>
    );
  }

  return (
    <article className="review-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={draft.imageDataUrl} alt={`Workout screenshot ${draft.fileName}`} />
      <form
        action={(formData) => {
          onSave(draft, formData);
        }}
      >
        <label>
          Name
          <input
            name="name"
            defaultValue={getWorkoutName(draft.ocrText, draft.fileName)}
          />
        </label>
        <label>
          Clean instructions
          <textarea
            name="cleanInstructions"
            rows={7}
            defaultValue={draft.ocrText}
            placeholder="Review OCR text and rewrite it into usable workout steps."
          />
        </label>
        <fieldset>
          <legend>Movement patterns</legend>
          <div className="chip-grid">
            {movementPatternOptions.map((pattern) => (
              <label key={pattern}>
                <input type="checkbox" name="movementPatterns" value={pattern} />
                {pattern}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Functional focus</legend>
          <div className="chip-grid">
            {functionalFocusOptions.map((focus) => (
              <label key={focus}>
                <input type="checkbox" name="functionalFocus" value={focus} />
                {focus}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-split">
          <label>
            Body areas
            <input name="bodyAreas" placeholder="chest, hips, core" />
          </label>
          <label>
            Equipment
            <input name="equipment" placeholder="dumbbells, bench" />
          </label>
        </div>
        <div className="form-split">
          <label>
            Intensity
            <select name="intensity" defaultValue="moderate">
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Minutes
            <input name="durationMinutes" type="number" min="1" />
          </label>
        </div>
        <label>
          Progression notes
          <textarea name="progressionNotes" rows={2} />
        </label>
        <label>
          Scheduling notes
          <textarea name="schedulingNotes" rows={2} />
        </label>
        {draft.status === "failed" ? <p className="error-copy">{draft.error}</p> : null}
        <button type="submit" disabled={draft.status === "processing"}>
          {draft.status === "processing" ? "OCR running..." : "Add to library"}
        </button>
      </form>
    </article>
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
}: {
  days: string[];
  selectedDate: string;
  scheduled: ScheduledWorkout[];
  workouts: WorkoutTemplate[];
  onSelectDate: (date: string) => void;
  onStart: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="calendar-grid">
      {days.map((date) => {
        const label = getDayLabel(date);
        const dayWorkouts = scheduled.filter((item) => item.date === date);

        return (
          <div
            className={`calendar-day ${date === selectedDate ? "is-selected" : ""}`}
            key={date}
          >
            <button
              className="day-select"
              type="button"
              onClick={() => onSelectDate(date)}
            >
              <span className="day-name">{label.day}</span>
              <span className="day-number">{label.number}</span>
              <span className="day-month">{label.month}</span>
              <span className="day-count">{dayWorkouts.length} planned</span>
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
                  <button
                    type="button"
                    onClick={() => onRemove(scheduledWorkout.id)}
                  >
                    Remove
                  </button>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function WorkoutCard({
  workout,
  onSchedule,
}: {
  workout: WorkoutTemplate;
  onSchedule: () => void;
}) {
  return (
    <article className="workout-card">
      <div className="workout-card-media">
        {workout.screenshotDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={workout.screenshotDataUrl} alt="" />
        ) : (
          <span>{workout.movementPatterns[0] || "workout"}</span>
        )}
      </div>
      <div>
        <p className="eyebrow">{workout.movementPatterns.join(" / ") || "untagged"}</p>
        <h3>{workout.name}</h3>
        <p>{workout.cleanInstructions.slice(0, 180)}</p>
        <div className="tag-row">
          {[...workout.functionalFocus, ...workout.bodyAreas].slice(0, 5).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <button type="button" onClick={onSchedule}>
        Schedule on selected date
      </button>
    </article>
  );
}

function ActiveWorkout({
  scheduledWorkout,
  workout,
  onBack,
  onUpdate,
}: {
  scheduledWorkout: ScheduledWorkout;
  workout: WorkoutTemplate;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<ScheduledWorkout>) => void;
}) {
  const stepIndex = scheduledWorkout.activeStepIndex ?? 0;
  const step = workout.steps[stepIndex] ?? workout.steps[0];
  const progress = workout.steps.length
    ? `${Math.min(stepIndex + 1, workout.steps.length)} / ${workout.steps.length}`
    : "1 / 1";
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

  function setStatus(status: WorkoutStatus) {
    onUpdate(scheduledWorkout.id, {
      status,
      completedAt: status === "planned" ? undefined : new Date().toISOString(),
    });
  }

  return (
    <main className="active-mode">
      <div className="active-topbar">
        <button type="button" onClick={onBack}>
          Back to calendar
        </button>
        <span>{scheduledWorkout.date}</span>
      </div>
      <section className="active-card">
        <p className="eyebrow">Active workout</p>
        <h1>{workout.name}</h1>
        <div className="active-number-row">
          <span className="active-number">{progress}</span>
          <span>step</span>
        </div>
        {step ? (
          <div className="active-step">
            <p>{step.label}</p>
            {step.detail ? <span>{step.detail}</span> : null}
            {stepMetrics.length > 0 ? (
              <div className="active-metrics">
                {stepMetrics.map((metric) => (
                  <Metric
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="active-step">
            {workout.cleanInstructions || "No parsed steps yet. Use the screenshot reference."}
          </p>
        )}
        <div className="active-controls">
          <button
            type="button"
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
            onClick={() =>
              onUpdate(scheduledWorkout.id, {
                activeStepIndex: Math.min(stepIndex + 1, workout.steps.length - 1),
              })
            }
          >
            Next step
          </button>
        </div>
        <div className="active-status">
          <button type="button" onClick={() => setStatus("done")}>
            Done
          </button>
          <button type="button" onClick={() => setStatus("modified")}>
            Modified
          </button>
          <button type="button" onClick={() => setStatus("skipped")}>
            Skip
          </button>
        </div>
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
      {workout.screenshotDataUrl ? (
        <details className="screenshot-reference">
          <summary>Original screenshot</summary>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={workout.screenshotDataUrl} alt="" />
        </details>
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}
