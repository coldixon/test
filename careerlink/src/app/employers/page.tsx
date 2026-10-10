import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseIcon, BuildingIcon, CalendarIcon, CheckIcon, SearchIcon, SparkIcon, UsersIcon } from "@/components/Icons";
import { HOME_REGION, SITE_NAME } from "@/lib/site";
import { siteStats } from "@/lib/store";
import { pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employer solutions: post jobs, track applicants, find talent",
  description: "Post jobs, track applicants, search resumes, and build a company profile that attracts local talent.",
};

const PRODUCTS = [
  { icon: BriefcaseIcon, title: "Job posting", text: "Publish in minutes. Listings appear in search, on category and skill pages, and in matching job alerts." },
  { icon: UsersIcon, title: "Applicant tracking", text: "Every application lands in one dashboard, organized by job, with the candidate's resume link and note." },
  { icon: SearchIcon, title: "Resume database", text: "Search candidates who opted in to be found, filtered by skill and location, and reach out first." },
  { icon: BuildingIcon, title: "Company profile", text: "Tell your story with a branded page that lists every open role and links from each listing." },
  { icon: CalendarIcon, title: "Career fairs", text: "Exhibit at regional hiring events with pre-event candidate lists and on-site interview rooms." },
  { icon: SparkIcon, title: "Hiring signage", text: "Download a QR code for your 'Now Hiring' signs so walk-in candidates see your openings instantly." },
];

const PLANS = [
  { name: "Single job", price: "$199", period: "per 30-day listing", features: ["One active listing", "Applicant dashboard", "Company profile"], cta: "Post a job", href: "/employers/post", highlight: false },
  { name: "Growth", price: "$499", period: "per month", features: ["Five active listings", "Resume database access", "Featured placement on the home page", "Job alert distribution"], cta: "Start Growth", href: "/employers/post", highlight: true },
  { name: "Unlimited", price: "Talk to us", period: "annual agreement", features: ["Unlimited listings", "Career fair booths", "Dedicated recruiting partner", "Regional site placement"], cta: "Contact sales", href: "mailto:sales@example.com", highlight: false },
];

export default function EmployersPage() {
  const stats = siteStats();
  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="container-x py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">For employers</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Hire {HOME_REGION}&apos;s best people, faster.</h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-100">
            {SITE_NAME} puts your openings in front of local candidates who are actively looking, and in front of the ones who are not looking yet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/employers/post" className="btn-accent px-6 text-base">
              Post a job
            </Link>
            <Link href="/employers/dashboard" className="btn-secondary px-6 text-base">
              Go to dashboard
            </Link>
          </div>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            {[
              { label: "Active listings", value: stats.jobs },
              { label: "Employers", value: stats.companies },
              { label: "Cities covered", value: stats.cities },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-brand-200">{s.label}</dt>
                <dd className="text-3xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="text-2xl font-bold text-slate-900">Everything you need to hire</h2>
        <p className="mt-1 text-slate-600">One platform from posting to offer.</p>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <li key={p.title} className="card p-5">
              <span className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-700">
                <p.icon />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-14">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-slate-900">Simple pricing</h2>
          <p className="mt-1 text-slate-600">No contracts on monthly plans. Cancel any time.</p>
          <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <li key={plan.name} className={`card flex flex-col p-6 ${plan.highlight ? "border-brand-600 ring-2 ring-brand-600" : ""}`}>
                {plan.highlight && <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Most popular</span>}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
                <p className="text-sm text-slate-500">{plan.period}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckIcon size={16} className="mt-0.5 shrink-0 text-teal-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`${plan.highlight ? "btn-primary" : "btn-secondary"} mt-6`}>
                  {plan.cta}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">Pricing shown is illustrative for this demo.</p>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="card grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
          {[
            { step: "1", title: "Post your job", text: "Fill out one form with pay, skills, and a clear description. It goes live immediately." },
            { step: "2", title: "Candidates apply", text: `Your listing shows in search, on browse pages, and in alerts. ${pluralize(stats.applications, "application has", "applications have")} been sent this session.` },
            { step: "3", title: "Review and hire", text: "Open your dashboard to see every applicant with their contact details and resume link." },
          ].map((s) => (
            <div key={s.step}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-bold text-brand-950">{s.step}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
