import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/Badge";
import CompanyLogo from "@/components/CompanyLogo";
import JobCard from "@/components/JobCard";
import ApplyForm from "@/components/ApplyForm";
import SaveJobButton from "@/components/SaveJobButton";
import { BriefcaseIcon, CheckIcon, ClockIcon, DollarIcon, MapPinIcon } from "@/components/Icons";
import { getCompanyForJob, getJob, jobsForCompany, relatedJobs } from "@/lib/store";
import { formatDate, formatSalary, jobLocation, pluralize, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) return { title: "Job not found" };
  const company = getCompanyForJob(job);
  return {
    title: `${job.title} at ${company.name} in ${jobLocation(job)}`,
    description: job.summary,
  };
}

export default async function JobPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const job = getJob(slug);
  if (!job) notFound();
  const company = getCompanyForJob(job);
  const related = relatedJobs(job, 4);
  const moreFromCompany = jobsForCompany(company.slug).filter((j) => j.id !== job.id).length;
  const justPosted = sp.posted === "1";

  return (
    <div className="container-x py-8">
      {justPosted && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          Your job is live. Applications will appear in your{" "}
          <Link href="/employers/dashboard" className="font-semibold underline">
            employer dashboard
          </Link>
          .
        </div>
      )}

      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/jobs" className="hover:text-brand-700">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/jobs?category=${encodeURIComponent(job.category)}`} className="hover:text-brand-700">
              {job.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-slate-700">{job.title}</li>
        </ol>
      </nav>

      <header className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <CompanyLogo name={company.name} color={company.color} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {job.featured && <Badge tone="amber">Featured</Badge>}
              <Badge tone="neutral">{job.type}</Badge>
              <Badge tone="teal">{job.workMode}</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-lg text-slate-700">
              <Link href={`/companies/${company.slug}`} className="font-semibold text-brand-700 hover:underline">
                {company.name}
              </Link>
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPinIcon size={18} className="text-slate-400" />
                <dt className="sr-only">Location</dt>
                <dd>{jobLocation(job)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <DollarIcon size={18} className="text-slate-400" />
                <dt className="sr-only">Pay</dt>
                <dd className="font-medium text-slate-900">{formatSalary(job)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseIcon size={18} className="text-slate-400" />
                <dt className="sr-only">Category</dt>
                <dd>{job.category}</dd>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon size={18} className="text-slate-400" />
                <dt className="sr-only">Posted</dt>
                <dd>
                  Posted {timeAgo(job.postedAt)} <span className="text-slate-400">({formatDate(job.postedAt)})</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
            <a href="#apply" className="btn-accent px-6">
              Apply now
            </a>
            <SaveJobButton slug={job.slug} label />
          </div>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 space-y-8">
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">About the role</h2>
            <p className="mt-3 text-base font-medium text-slate-800">{job.summary}</p>
            <div className="prose-simple mt-4">
              {job.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {job.responsibilities.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">What you&apos;ll do</h3>
                <ul className="mt-3 space-y-2">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-2 text-slate-700">
                      <CheckIcon size={18} className="mt-0.5 shrink-0 text-teal-600" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.requirements.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">What you&apos;ll bring</h3>
                <ul className="mt-3 space-y-2">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex gap-2 text-slate-700">
                      <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.benefits.length > 0 && (
              <>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Benefits</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.benefits.map((b) => (
                    <li key={b}>
                      <Badge tone="green">{b}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-6 text-lg font-semibold text-slate-900">Skills</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <li key={s}>
                  <Link href={`/jobs?skill=${encodeURIComponent(s)}`} className="inline-flex rounded-md bg-brand-50 px-2.5 py-1 text-sm font-medium text-brand-800 hover:bg-brand-100">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <ApplyForm jobId={job.id} jobTitle={job.title} />
        </article>

        <aside className="min-w-0 space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <CompanyLogo name={company.name} color={company.color} size="sm" />
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-slate-900">{company.name}</h2>
                {company.industry && <p className="text-xs text-slate-500">{company.industry}</p>}
              </div>
            </div>
            {company.tagline && <p className="mt-3 text-sm text-slate-700">{company.tagline}</p>}
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              {company.headquarters && (
                <div className="flex justify-between gap-2">
                  <dt>Headquarters</dt>
                  <dd className="text-right text-slate-800">{company.headquarters}</dd>
                </div>
              )}
              {company.size && (
                <div className="flex justify-between gap-2">
                  <dt>Size</dt>
                  <dd className="text-right text-slate-800">{company.size}</dd>
                </div>
              )}
            </dl>
            <Link href={`/companies/${company.slug}`} className="btn-secondary mt-4 w-full">
              View company{moreFromCompany > 0 ? ` (${pluralize(moreFromCompany, "more job")})` : ""}
            </Link>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Similar jobs</h2>
              <div className="space-y-3">
                {related.map((j) => (
                  <JobCard key={j.id} job={j} compact />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
