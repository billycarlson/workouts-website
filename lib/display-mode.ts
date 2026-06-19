export const DISPLAY_XXL_STORAGE_KEY = "display-xxl";

export function readDisplayXxlEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISPLAY_XXL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeDisplayXxlEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISPLAY_XXL_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore quota / private mode */
  }
  document.documentElement.classList.toggle("display-xxl", enabled);
}
