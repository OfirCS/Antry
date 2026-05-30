import type { ReactNode } from "react";

/**
 * Reusable wrapper used by every /settings page.
 *
 * Title is a 12px uppercase tracked-out gray label that sits *above*
 * the white card, editorial-style. Body is the card padding. Optional
 * caption for one line of context under the title.
 */
export function SettingsCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2
          className="text-[12px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "#737373" }}
        >
          {title}
        </h2>
        {caption && (
          <p className="mt-1.5 text-[13px]" style={{ color: "#737373" }}>
            {caption}
          </p>
        )}
      </div>
      <div
        className="rounded-[20px]"
        style={{ background: "#FFFFFF", border: "1px solid #EBEBEB" }}
      >
        {children}
      </div>
    </section>
  );
}
