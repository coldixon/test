import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import CompanyLogo from "@/components/CompanyLogo";
import SectionHeading from "@/components/SectionHeading";
import AlertForm from "@/components/AlertForm";
import { ArrowRightIcon, BriefcaseIcon, CalendarIcon, SearchIcon, SparkIcon, UsersIcon } from "@/components/Icons";
import { HOME_REGION, SITE_NAME } from "@/lib/site";
import { categoryFacets, featuredCompanies, featuredJobs, listCareerFairs, newestJobs, openJobCount, siteStats } from "@/lib/store";
import { formatDate, pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

const POPULAR_SEARCHES = ["Nurse", "Electrician", "CDL-A", "Software Engineer", "Accountant", "Remote"];

export default function HomePage() {
  const stats = siteStats();
  const featured = featuredJobs(6);
  const newest = newestJobs(6);
  const categories = categoryFacets();
  const employers = featuredCompanies();
  const fairs = listCareerFairs().slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="container-x py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Connecting top talent, from {HOME_REGION} to everywhere</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Find a job and get found by recruiters.</h1>
            <p className="mt-4 text-lg text-brand-100">
              Search {pluralize(stats.jobs, "open job")} from {pluralize(stats.companies, "verified employer")}. Save jobs, set alerts, and apply in minutes.
            </p>
          </div>
          <div className="mt-8 max-w-3xl">
            <SearchBar size="lg" />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-brand-100">
              <span>Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={term === "Remote" ? "/jobs?location=remote" : `/jobs?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 hover:bg-white/20"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "Open jobs", value: stats.jobs },
              { label: "Employers", value: stats.companies },
              { label: "Remote roles", value: stats.remote },
              { label: "Cities", value: stats.cities },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-brand-200">{s.label}</dt>
                <dd className="text-3xl font-bold">{s.value.toLocaleString("en-US")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-12">
        <SectionHeading title="Browse by category" subtitle="Jump straight to the kind of work you do." href="/browse" linkLabel="Browse skills and locations" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <li key={c.value}>
              <Link href={`/jobs?category=${encodeURIComponent(c.value)}`} className="card flex h-full flex-col justify-between p-4 transition-colors hover:border-brand-300 hover:bg-brand-50">
                <span className="font-semibold text-slate-900">{c.value}</span>
                <span className="mt-2 text-sm text-slate-500">{pluralize(c.count, "job")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured jobs */}
      <section className="bg-white py-12">
        <div className="container-x">
          <SectionHeading title="Featured jobs" subtitle="Hand-picked openings from employers hiring now." href="/jobs" linkLabel="See all jobs" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Newest + employers */}
      <section className="container-x grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading title="Newest jobs" subtitle={`Fresh postings across ${HOME_REGION} and beyond.`} href="/jobs?sort=newest" linkLabel="All newest jobs" />
          <div className="space-y-3">
            {newest.map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        </div>
        <aside>
          <SectionHeading title="Featured employers" href="/companies" linkLabel="All employers" />
          <ul className="space-y-3">
            {employers.map((c) => (
              <li key={c.slug}>
                <Link href={`/companies/${c.slug}`} className="card flex items-center gap-3 p-3 transition-colors hover:border-brand-300">
                  <CompanyLogo name={c.name} color={c.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {c.industry} · {pluralize(openJobCount(c.slug), "open job")}
                    </p>
                  </div>
                  <ArrowRightIcon size={16} className="text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* How it works */}
      <section className="bg-white py-12">
        <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">For job seekers</h2>
            <ol className="mt-5 space-y-4">
              {[
                { icon: SearchIcon, title: "Search and filter", text: "Find jobs by title, skill, location, pay, and work setting." },
                { icon: BriefcaseIcon, title: "Save and apply", text: "Bookmark jobs for later and apply in under two minutes." },
                { icon: SparkIcon, title: "Get found", text: "Set alerts so you are first in line when the right job posts." },
              ].map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-700">
                    <s.icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    <p className="text-sm text-slate-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/jobs" className="btn-primary mt-6">
              Start searching
            </Link>
          </div>
          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">For employers</h2>
            <ol className="mt-5 space-y-4">
              {[
                { icon: BriefcaseIcon, title: "Post in minutes", text: "Publish a listing with pay, skills, and a clear description." },
                { icon: UsersIcon, title: "Track applicants", text: "Every application lands in your dashboard, organized by job." },
                { icon: CalendarIcon, title: "Meet talent in person", text: "Exhibit at regional career fairs and hiring expos." },
              ].map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-900">
                    <s.icon size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    <p className="text-sm text-slate-600">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/employers/post" className="btn-accent">
                Post a job
              </Link>
              <Link href="/employers" className="btn-secondary">
                Employer solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career fairs + alerts */}
      <section className="container-x grid grid-cols-1 gap-10 py-12 lg:grid-cols-2">
        <div>
          <SectionHeading title="Upcoming career fairs" href="/career-fairs" linkLabel="All events" />
          <ul className="space-y-3">
            {fairs.map((f) => (
              <li key={f.slug} className="card flex gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-800 text-white">
                  <span className="text-xs uppercase">{formatDate(f.date, { month: "short", day: undefined, year: undefined })}</span>
                  <span className="text-2xl font-bold leading-none">{new Date(f.date).getUTCDate()}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{f.name}</p>
                  <p className="text-sm text-slate-600">
                    {f.venue}, {f.city} · {f.startTime}–{f.endTime}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{pluralize(f.employerCount, "employer")} attending</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <AlertForm />
        </div>
      </section>

      {/* Employer band */}
      <section className="bg-brand-900 text-white">
        <div className="container-x flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hiring? Reach {HOME_REGION}&apos;s best candidates on {SITE_NAME}.</h2>
            <p className="mt-2 text-brand-100">Post a job, track applicants, and get a company profile. No sales call required.</p>
          </div>
          <Link href="/employers/post" className="btn-accent shrink-0 px-6">
            Post a job
          </Link>
        </div>
      </section>
    </>
  );
}
