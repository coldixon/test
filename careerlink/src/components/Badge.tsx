import type { ReactNode } from "react";

const TONES = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-100 text-amber-900",
  green: "bg-emerald-50 text-emerald-700",
} as const;

export default function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}
