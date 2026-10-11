import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; stroke?: string };

const base = (size: number, stroke: string, props: IconProps) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export function Logo({ size = 26 }: { size?: number }) {
  const h = Math.round((size * 22) / 30);
  return (
    <svg width={size} height={h} viewBox="0 0 30 22" aria-hidden="true">
      <circle cx="11" cy="11" r="9" fill="none" stroke="#0F1E33" strokeWidth="2.2" />
      <circle cx="19" cy="11" r="9" fill="none" stroke="#0B6E6E" strokeWidth="2.2" />
    </svg>
  );
}

export function HomeIcon({ size = 22, stroke = "currentColor", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)} strokeWidth={2}>
      <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />
    </svg>
  );
}
export function PlanIcon({ size = 22, stroke = "currentColor", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)}>
      <path d="M4 19l5-6 4 3 7-9" />
      <path d="M15 7h5v5" />
    </svg>
  );
}
export function MoneyIcon({ size = 22, stroke = "currentColor", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}
export function GoalsIcon({ size = 22, stroke = "currentColor", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill={stroke} />
    </svg>
  );
}
export function InsightsIcon({ size = 22, stroke = "currentColor", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z" />
    </svg>
  );
}
export function BellIcon({ size = 20, stroke = "#0F1E33", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}
export function CheckIcon({ size = 18, stroke = "#7FD3C6", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)} strokeWidth={2.4}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
export function HalfIcon({ size = 18, stroke = "#F2B544", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)} strokeWidth={2.4}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill={stroke} />
    </svg>
  );
}
export function CircleIcon({ size = 18, stroke = "#7D8897", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)} strokeWidth={2}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
export function WarnIcon({ size = 18, stroke = "#9A5A08", ...p }: IconProps) {
  return (
    <svg {...base(size, stroke, p)} strokeWidth={2}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 17v.5" />
    </svg>
  );
}
