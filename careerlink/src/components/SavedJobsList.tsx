"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSavedJobs } from "@/lib/saved";
import { initials, timeAgo } from "@/lib/format";
import EmptyState from "./EmptyState";
import { BookmarkIcon } from "./Icons";

interface SavedJob {
  slug: string;
  title: string;
  company: { name: string; color: string; slug: string };
  location: string;
  type: string;
  workMode: string;
  salary: string;
  postedAt: string;
}

export default function SavedJobsList() {
  const { saved, ready, remove } = useSavedJobs();
  const [jobs, setJobs] = useState<SavedJob[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (saved.length === 0) {
      setJobs([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/jobs?slugs=${encodeURIComponent(saved.join(","))}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: { jobs: SavedJob[] }) => setJobs(data.jobs))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("We couldn't load your saved jobs. Please refresh.");
      });
    return () => controller.abort();
  }, [saved, ready]);

  if (!ready || jobs === null) {
    return error ? (
      <EmptyState title="Something went wrong">{error}</EmptyState>
    ) : (
      <p className="text-sm text-slate-500" aria-live="polite">
        Loading saved jobs…
      </p>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No saved jobs yet"
        action={
          <Link href="/jobs" className="btn-primary">
            Browse jobs
          </Link>
        }
      >
        Tap the bookmark on any job to save it here. Saved jobs are stored in this browser.
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li key={job.slug} className="card flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: job.company.color }} aria-hidden="true">
            {initials(job.company.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-900">
              <Link href={`/jobs/${job.slug}`} className="hover:text-brand-700">
                {job.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-600">
              {job.company.name} · {job.location}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {job.type} · {job.workMode} · <span className="font-medium text-slate-800">{job.salary}</span> · {timeAgo(job.postedAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href={`/jobs/${job.slug}#apply`} className="btn-accent px-3 py-1.5">
              Apply
            </Link>
            <button type="button" onClick={() => remove(job.slug)} className="btn-secondary px-3 py-1.5" aria-label={`Remove ${job.title} from saved jobs`}>
              <BookmarkIcon size={16} filled />
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
