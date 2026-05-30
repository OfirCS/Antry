"use client";

/**
 * Small "1 · 2 · 3 · 4" step indicator that lives at the top of the
 * onboarding card. Current step highlighted in ink, the rest in
 * tertiary gray. Visual only — navigation is controlled by the parent.
 */
export function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <ol
      aria-label={`Step ${current} of ${total}`}
      className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.18em]"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n, i) => {
        const active = n === current;
        const done = n < current;
        return (
          <li key={n} className="inline-flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors"
              style={{
                background: active ? "#0A0A0A" : done ? "#C6F135" : "#F5F5F5",
                color: active ? "#FFFFFF" : "#0A0A0A",
                fontSize: 10,
              }}
            >
              {n}
            </span>
            {i < total - 1 && (
              <span
                aria-hidden
                className="w-3 h-px"
                style={{ background: "#EBEBEB" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
