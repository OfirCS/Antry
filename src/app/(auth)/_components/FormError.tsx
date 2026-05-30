import { AlertCircle } from "lucide-react";

type FormErrorProps = {
  message: string;
};

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-[#F5C7C9] bg-[#FDF2F2] px-3.5 py-2.5">
      <AlertCircle className="mt-[1px] h-4 w-4 shrink-0 text-[#C42127]" strokeWidth={2} aria-hidden="true" />
      <p className="text-[13px] leading-[1.4] text-[#931518]">{message}</p>
    </div>
  );
}
