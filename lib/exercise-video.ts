export type ExerciseVideoEmbed =
  | { kind: "youtube"; embedUrl: string; thumbnailUrl: string }
  | { kind: "vimeo"; embedUrl: string; thumbnailUrl?: string }
  | { kind: "file"; src: string };

/**
 * Accepts a pasted YouTube link, Vimeo link, bare video ID, or direct file URL
 * (mp4/webm/mov, including your own hosted clips) and returns how to render it.
 * Returns null if the input doesn't look like any recognizable video source.
 */
export function parseExerciseVideoUrl(rawUrl: string | undefined): ExerciseVideoEmbed | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  if (isDirectVideoFile(url)) {
    return { kind: "file", src: url };
  }

  return null;
}

function extractYoutubeId(url: string): string | null {
  // Bare 11-char ID pasted directly.
  if (/^[\w-]{11}$/.test(url)) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (shortsMatch) return shortsMatch[1];
      const embedMatch = parsed.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embedMatch) return embedMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

function extractVimeoId(url: string): string | null {
  if (/^\d+$/.test(url)) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const match = parsed.pathname.match(/(\d+)/);
      return match ? match[1] : null;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideoFile(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /\.(mp4|webm|mov|m4v)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
