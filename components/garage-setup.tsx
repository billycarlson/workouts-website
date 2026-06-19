"use client";

import Link from "next/link";
import { RasterCell, RasterGrid } from "@/components/raster";

export function DisplaySetupPage() {
  return (
    <main className="garage-setup book-shell">
      <header className="view-topbar">
        <Link href="/">Back to phone app</Link>
        <h1>Garage displays</h1>
      </header>

      <RasterGrid columns={12} columnsS={4} columnsL={16} className="garage-setup-grid">
        <RasterCell span="row">
          <section className="garage-setup-copy section-block">
            <p className="empty-copy">
              Open one window per monitor. Drag each window to a 27&quot; screen, press{" "}
              <strong>F11</strong> for full screen, and leave both running during workouts.
              Your phone keeps the normal mobile layout.
            </p>
          </section>
        </RasterCell>

        <RasterCell span={6} spanS="row" spanL={8}>
          <article className="garage-setup-card">
            <p className="eyebrow">Monitor 1</p>
            <h2>Workout screen</h2>
            <p className="empty-copy">
              Today&apos;s workout, live step tracking, and big controls while you train.
            </p>
            <a
              className="garage-open-link"
              href="/display/workout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open workout screen
            </a>
          </article>
        </RasterCell>

        <RasterCell span={6} spanS="row" spanL={8}>
          <article className="garage-setup-card">
            <p className="eyebrow">Monitor 2</p>
            <h2>Plan screen</h2>
            <p className="empty-copy">
              Two-week calendar and today&apos;s lineup. Updates when you start a workout on
              the other screen.
            </p>
            <a
              className="garage-open-link"
              href="/display/plan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open plan screen
            </a>
          </article>
        </RasterCell>

        <RasterCell span="row">
          <section className="section-block">
            <p className="eyebrow">One big TV instead?</p>
            <p className="empty-copy">
              Use only the workout screen, or open both links on the same machine if you span
              monitors as one desktop.
            </p>
          </section>
        </RasterCell>
      </RasterGrid>
    </main>
  );
}
