import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import RsvpButton from "@/components/RsvpButton";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "@/components/Icons";
import { listCareerFairs } from "@/lib/store";
import { formatDate, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "Career fairs and hiring events",
  description: "Find career fairs and networking events near you. Meet recruiters face to face and interview on the spot.",
};

export default function CareerFairsPage() {
  const fairs = listCareerFairs();
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Career fairs" subtitle="Meet employers in person. Registration is free for job seekers." />

      <ul className="space-y-4">
        {fairs.map((f) => (
          <li key={f.slug} className="card flex flex-col gap-5 p-6 md:flex-row">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-800 text-white">
              <span className="text-xs font-semibold uppercase">{formatDate(f.date, { month: "short", day: undefined, year: undefined })}</span>
              <span className="text-3xl font-bold leading-none">{new Date(f.date).getUTCDate()}</span>
              <span className="text-xs">{formatDate(f.date, { year: "numeric", month: undefined, day: undefined })}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-slate-900">{f.name}</h2>
              <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={16} className="text-slate-400" />
                  <dt className="sr-only">Date</dt>
                  <dd>{formatDate(f.date, { weekday: "long" })}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon size={16} className="text-slate-400" />
                  <dt className="sr-only">Time</dt>
                  <dd>
                    {f.startTime} – {f.endTime}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPinIcon size={16} className="text-slate-400" />
                  <dt className="sr-only">Venue</dt>
                  <dd>
                    {f.venue}
                    {f.city !== "Remote" ? `, ${f.city}, ${f.state}` : ""}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersIcon size={16} className="text-slate-400" />
                  <dt className="sr-only">Employers</dt>
                  <dd>{pluralize(f.employerCount, "employer")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-slate-700">{f.description}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">For: {f.audience}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:items-end">
              <RsvpButton slug={f.slug} />
              <Link href={f.city === "Remote" ? "/jobs?location=remote" : `/jobs?location=${encodeURIComponent(`${f.city}, ${f.state}`)}`} className="btn-ghost">
                Jobs in {f.city === "Remote" ? "remote" : f.city}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <section className="card mt-10 flex flex-col items-start gap-4 bg-brand-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Employers: exhibit at an upcoming fair</h2>
          <p className="mt-1 text-sm text-brand-100">Booth space includes a company profile, pre-event candidate list, and on-site interview rooms.</p>
        </div>
        <Link href="/employers" className="btn-accent shrink-0">
          Learn more
        </Link>
      </section>
    </div>
  );
}
