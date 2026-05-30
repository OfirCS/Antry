type DividerProps = {
  label: string;
};

export function Divider({ label }: DividerProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[#EBEBEB]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#737373]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#EBEBEB]" />
    </div>
  );
}
