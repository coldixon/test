import Link from "next/link";
import type { Job } from "@/lib/types";
import { getCompanyForJob } from "@/lib/store";
import { formatSalary, jobLocation, timeAgo } from "@/lib/format";
import Badge from "./Badge";
import CompanyLogo from "./CompanyLogo";
import SaveJobButton from "./SaveJobButton";

export default function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const company = getCompanyForJob(job);
  return (
    <article className="card relative flex min-w-0 gap-4 p-4 transition-shadow hover:shadow-md sm:p-5">
      <CompanyLogo name={company.name} color={company.color} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
              <Link href={`/jobs/${job.slug}`} className="hover:text-brand-700 after:absolute after:inset-0 after:content-['']">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-slate-600">
              <span className="font-medium text-slate-800">{company.name}</span>
              <span aria-hidden="true"> · </span>
              {jobLocation(job)}
            </p>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            {job.featured && <Badge tone="amber">Featured</Badge>}
            <SaveJobButton slug={job.slug} />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
          <span>{job.type}</span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span>{job.workMode}</span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span className="font-medium text-slate-800">{formatSalary(job)}</span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span>{timeAgo(job.postedAt)}</span>
        </div>

        {!compact && <p className="mt-2 line-clamp-2 text-sm text-slate-700">{job.summary}</p>}

        {!compact && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
            {job.skills.slice(0, 5).map((s) => (
              <li key={s}>
                <Badge tone="brand">{s}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
