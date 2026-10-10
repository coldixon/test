import { MapPinIcon, SearchIcon } from "./Icons";

export default function SearchBar({
  q = "",
  location = "",
  size = "md",
  autoFocus = false,
}: {
  q?: string;
  location?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
}) {
  const pad = size === "lg" ? "py-3.5" : "py-2.5";
  return (
    <form action="/jobs" method="get" role="search" className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 sm:flex-row sm:items-stretch">
      <label className="relative flex-1">
        <span className="sr-only">Job title, keywords, or company</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus={autoFocus}
          placeholder="Job title, keywords, or company"
          className={`input border-0 pl-10 ring-0 focus:ring-0 ${pad}`}
        />
      </label>
      <div className="hidden w-px bg-slate-200 sm:block" />
      <label className="relative flex-1">
        <span className="sr-only">City, state, or remote</span>
        <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          name="location"
          defaultValue={location}
          placeholder="City, state, or “remote”"
          className={`input border-0 pl-10 ring-0 focus:ring-0 ${pad}`}
        />
      </label>
      <button type="submit" className={`btn-primary ${size === "lg" ? "px-6 text-base" : ""}`}>
        Find Jobs
      </button>
    </form>
  );
}
