import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — the canonical "nothing here yet / no results" surface.
 *
 * Use it inside lists, feeds, search results, and dashboards whenever a
 * collection resolves to zero items. It is purely presentational: pass an
 * `action` (usually a <Button>) if the user can do something about it.
 *
 * @example
 *   <EmptyState
 *     icon={<Inbox className="h-6 w-6" />}
 *     title="No projects yet"
 *     description="Ship something and it'll show up here."
 *     action={<Button href="/submit">Submit a project</Button>}
 *   />
 */
export interface EmptyStateProps {
  /** Optional glyph rendered in a soft circle above the title. */
  icon?: ReactNode;
  /** Short, sentence-case headline. Required. */
  title: string;
  /** One or two lines of supporting copy. */
  description?: ReactNode;
  /** Optional call-to-action node, e.g. a <Button>. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-lg border border-dashed border-border bg-bg-warm",
        "px-6 py-14 sm:py-16",
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-text-tertiary shadow-sm"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-[420px] text-[14px] leading-[1.6] text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
