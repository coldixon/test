import { initials } from "@/lib/format";

export default function CompanyLogo({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "h-16 w-16 text-xl rounded-xl" : size === "sm" ? "h-9 w-9 text-xs rounded-lg" : "h-12 w-12 text-sm rounded-lg";
  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold text-white ${dims}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
