"use client";

import { useSavedJobs } from "@/lib/saved";
import { BookmarkIcon } from "./Icons";

export default function SaveJobButton({ slug, label = false }: { slug: string; label?: boolean }) {
  const { isSaved, toggle, ready } = useSavedJobs();
  const saved = ready && isSaved(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      title={saved ? "Saved" : "Save job"}
      className={
        label
          ? `btn-secondary ${saved ? "border-brand-300 bg-brand-50 text-brand-800" : ""}`
          : `rounded-lg p-1.5 transition-colors hover:bg-slate-100 ${saved ? "text-brand-700" : "text-slate-400 hover:text-brand-700"}`
      }
    >
      <BookmarkIcon size={label ? 18 : 20} filled={saved} />
      {label && (saved ? "Saved" : "Save job")}
    </button>
  );
}
