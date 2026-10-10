import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import FilterSidebar from "@/components/FilterSidebar";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import AlertForm from "@/components/AlertForm";
import SortSelect from "@/components/SortSelect";
import { CloseIcon } from "@/components/Icons";
import { getCompany, searchJobs } from "@/lib/store";
import { pluralize } from "@/lib/format";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

type RawParams = Record<string, string | string[] | undefined>;

function first(sp: RawParams, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() ? s.trim() : undefined;
}

function describe(sp: RawParams): string {
  const q = first(sp, "q");
  const location = first(sp, "location");
  const parts = [q ? `${q} jobs` : "Jobs", location ? `in ${location}` : ""].filter(Boolean);
  return parts.join(" ");
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawParams> }): Promise<Metadata> {
  const sp = await searchParams;
  return { title: describe(sp) };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams;
  const values = {
    q: first(sp, "q"),
    location: first(sp, "location"),
    category: first(sp, "category"),
    type: first(sp, "type"),
    mode: first(sp, "mode"),
    skill: first(sp, "skill"),
    company: first(sp, "company"),
    minSalary: first(sp, "minSalary"),
    sort: first(sp, "sort"),
  };
  const page = Number(first(sp, "page") ?? "1") || 1;
  const sortValue = (values.sort ?? (values.q ? "relevance" : "newest")) as NonNullable<SearchParams["sort"]>;

  const result = searchJobs({
    q: values.q,
    location: values.location,
    category: values.category,
    type: values.type,
    mode: values.mode,
    skill: values.skill,
    company: values.company,
    minSalary: values.minSalary ? Number(values.minSalary) : undefined,
    sort: sortValue,
    page,
  });

  const chips: { key: keyof typeof values; label: string }[] = [];
  if (values.category) chips.push({ key: "category", label: values.category });
  if (values.type) chips.push({ key: "type", label: values.type });
  if (values.mode) chips.push({ key: "mode", label: values.mode });
  if (values.skill) chips.push({ key: "skill", label: `Skill: ${values.skill}` });
  if (values.company) chips.push({ key: "company", label: `Company: ${getCompany(values.company)?.name ?? values.company}` });
  if (values.minSalary) chips.push({ key: "minSalary", label: `$${Number(values.minSalary).toLocaleString("en-US")}+` });

  const hrefWithout = (key: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(values)) if (v && k !== key) next.set(k, v);
    const qs = next.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    <div className="container-x py-8">
      <h1 className="sr-only">{describe(sp)}</h1>
      <SearchBar q={values.q} location={values.location} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="min-w-0 space-y-6">
          <FilterSidebar values={values} />
          <div className="card p-4 sm:p-5">
            <h2 className="text-base font-semibold text-slate-900">Alert me about jobs like these</h2>
            <div className="mt-3">
              <AlertForm compact keywords={values.q} location={values.location} />
            </div>
          </div>
        </aside>

        <section aria-label="Search results" className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{pluralize(result.total, "job")}</span>
              {values.q && (
                <>
                  {" "}
                  for <span className="font-medium text-slate-900">“{values.q}”</span>
                </>
              )}
              {values.location && (
                <>
                  {" "}
                  in <span className="font-medium text-slate-900">{values.location}</span>
                </>
              )}
            </p>
            <Suspense>
              <SortSelect value={sortValue} />
            </Suspense>
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <Link href={hrefWithout(c.key)} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-xs font-medium text-brand-800 hover:bg-brand-100">
                    {c.label}
                    <CloseIcon size={14} />
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-3">
            {result.jobs.length === 0 ? (
              <EmptyState
                title="No jobs match that search"
                action={
                  <Link href="/jobs" className="btn-primary">
                    Clear search
                  </Link>
                }
              >
                Try fewer keywords, a broader location, or remove a filter. New jobs are posted every day, so set an alert and we will email you when a match goes live.
              </EmptyState>
            ) : (
              result.jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>

          <Pagination page={result.page} totalPages={result.totalPages} basePath="/jobs" params={values} />
        </section>
      </div>
    </div>
  );
}
