import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./Icons";

export default function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
  as: Tag = "h2",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Tag className={Tag === "h1" ? "text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" : "text-2xl font-bold tracking-tight text-slate-900"}>{title}</Tag>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          {linkLabel ?? "View all"}
          <ArrowRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}
