import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import Badge from "@/components/Badge";
import { BuildingIcon, MapPinIcon, UsersIcon } from "@/components/Icons";
import { getCompany, jobsForCompany } from "@/lib/store";
import { pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Company not found" };
  return { title: `${company.name} careers and jobs`, description: company.tagline || `Open jobs at ${company.name}.` };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  const jobs = jobsForCompany(company.slug);

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/companies" className="hover:text-brand-700">
          Companies
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{company.name}</span>
      </nav>

      <header className="card mt-4 flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
        <CompanyLogo name={company.name} color={company.color} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{company.name}</h1>
            {company.featured && <Badge tone="amber">Featured employer</Badge>}
          </div>
          {company.tagline && <p className="mt-1 text-lg text-slate-700">{company.tagline}</p>}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {company.industry && (
              <div className="flex items-center gap-1.5">
                <BuildingIcon size={16} className="text-slate-400" />
                <dt className="sr-only">Industry</dt>
                <dd>{company.industry}</dd>
              </div>
            )}
            {company.headquarters && (
              <div className="flex items-center gap-1.5">
                <MapPinIcon size={16} className="text-slate-400" />
                <dt className="sr-only">Headquarters</dt>
                <dd>{company.headquarters}</dd>
              </div>
            )}
            {company.size && (
              <div className="flex items-center gap-1.5">
                <UsersIcon size={16} className="text-slate-400" />
                <dt className="sr-only">Size</dt>
                <dd>{company.size}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="shrink-0">
          <a href="#jobs" className="btn-primary">
            {pluralize(jobs.length, "open job")}
          </a>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <section id="jobs" className="min-w-0 scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Open jobs at {company.name}</h2>
          {jobs.length === 0 ? (
            <EmptyState title="No open jobs right now">Set a job alert for {company.name} and we will email you when they post.</EmptyState>
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </section>
        <aside>
          {company.description.length > 0 && (
            <section className="card p-5">
              <h2 className="text-base font-semibold text-slate-900">About {company.name}</h2>
              <div className="prose-simple mt-3 text-sm">
                {company.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 hover:underline">
                  Visit website
                </a>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
