/**
 * Onboarding state — localStorage-backed, SSR-safe.
 *
 * No auth yet, so we keep the entire flow client-side. When auth lands,
 * the schema can move to a server-side `user_onboarding` row; the public
 * shape of these helpers is what callers depend on, so keep it stable.
 *
 * Storage layout: a single namespaced JSON blob under `antry_onboarding`.
 * One key keeps it easy to clear and easy to reason about — vs scattering
 * `antry_onboarding.username`, `antry_onboarding.step`, etc. across keys.
 */

const STORAGE_KEY = "antry_onboarding";
const BANNER_DISMISSED_KEY = "antry_onboarding.banner_dismissed";

export type OnboardingState = {
  step: number;
  username?: string;
  completed: boolean;
};

const DEFAULT_STATE: OnboardingState = {
  step: 1,
  completed: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRaw(): OnboardingState {
  if (!isBrowser()) return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      step: typeof parsed.step === "number" ? parsed.step : 1,
      username: typeof parsed.username === "string" ? parsed.username : undefined,
      completed: parsed.completed === true,
    };
  } catch {
    // Corrupted blob — reset rather than crash the page.
    return { ...DEFAULT_STATE };
  }
}

function writeRaw(state: OnboardingState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota/private mode — silent. The flow still works for the session.
  }
}

export function getOnboardingState(): OnboardingState {
  return readRaw();
}

export function setOnboardingStep(step: number): void {
  const next = { ...readRaw(), step };
  writeRaw(next);
}

export function setOnboardingUsername(username: string): void {
  const next = { ...readRaw(), username };
  writeRaw(next);
}

export function markOnboardingCompleted(): void {
  const next = { ...readRaw(), completed: true };
  writeRaw(next);
}

/**
 * A "first visit" is anyone who has not completed onboarding yet.
 * Returning `false` on the server avoids a flash of the banner during
 * hydration — callers should mount the banner in a `useEffect` and gate
 * the render on this.
 */
export function isFirstVisit(): boolean {
  if (!isBrowser()) return false;
  const state = readRaw();
  return state.completed !== true;
}

export function isOnboardingBannerDismissed(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(BANNER_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissOnboardingBanner(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(BANNER_DISMISSED_KEY, "1");
  } catch {
    // Silent — see writeRaw note.
  }
}

/**
 * Username validation. The hard rules (used for both live UI feedback
 * and the gate on advancing to step 3) live here so the page component
 * and any future server-side check stay in sync.
 */
export const USERNAME_PATTERN = /^[a-z0-9-]+$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

export type UsernameValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateUsername(value: string): UsernameValidation {
  if (value.length < USERNAME_MIN) {
    return { ok: false, reason: `Must be at least ${USERNAME_MIN} characters.` };
  }
  if (value.length > USERNAME_MAX) {
    return { ok: false, reason: `Must be ${USERNAME_MAX} characters or fewer.` };
  }
  if (!USERNAME_PATTERN.test(value)) {
    return { ok: false, reason: "Lowercase letters, numbers, and hyphens only." };
  }
  return { ok: true };
}
