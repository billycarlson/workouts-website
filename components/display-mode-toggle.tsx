"use client";

type DisplayModeToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export function DisplayModeToggle({
  enabled,
  onToggle,
  compact = false,
}: DisplayModeToggleProps) {
  return (
    <button
      type="button"
      className={`display-mode-toggle${enabled ? " is-on" : ""}${compact ? " is-compact" : ""}`}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {compact ? (enabled ? "XXL on" : "XXL off") : enabled ? "Garage display: XXL on" : "Garage display: XXL off"}
    </button>
  );
}
