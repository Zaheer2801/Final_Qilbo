// Local-only persistence for the prototype phase. No backend, no real database —
// see onboarding-flow.md / the project's approval-gate rules for why nothing here
// pretends to talk to a live system yet. Swap this module out first when a real
// backend gets wired up; nothing else in the app should need to change.
const STATE_KEY = "qilbo:state";

export function loadState<T>(): T | null {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveState<T>(state: T): void {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // best-effort in a prototype — a full/unavailable localStorage shouldn't crash the app
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STATE_KEY);
  } catch {
    /* no-op */
  }
}
