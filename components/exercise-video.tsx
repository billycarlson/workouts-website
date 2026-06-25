"use client";

import { useState } from "react";
import { parseExerciseVideoUrl } from "@/lib/exercise-video";

export function ExerciseVideo({
  url,
  label,
  defaultExpanded = false,
}: {
  url: string | undefined;
  label: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const embed = parseExerciseVideoUrl(url);

  if (!embed) return null;

  if (!expanded) {
    return (
      <button
        type="button"
        className="exercise-video-thumb"
        onClick={() => setExpanded(true)}
        aria-label={`Play form video for ${label}`}
      >
        {embed.kind === "youtube" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={embed.thumbnailUrl} alt="" />
        ) : (
          <span className="exercise-video-thumb-fallback" aria-hidden="true" />
        )}
        <span className="exercise-video-play" aria-hidden="true">
          ▶
        </span>
      </button>
    );
  }

  return (
    <div className="exercise-video-player">
      <button
        type="button"
        className="exercise-video-close"
        onClick={() => setExpanded(false)}
        aria-label="Close video"
      >
        ✕
      </button>
      {embed.kind === "file" ? (
        <video src={embed.src} controls autoPlay playsInline />
      ) : (
        <iframe
          src={`${embed.embedUrl}?autoplay=1`}
          title={`${label} form video`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
