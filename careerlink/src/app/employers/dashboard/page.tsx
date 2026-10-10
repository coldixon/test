import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import Badge from "@/components/Badge";
import { applicationsForJob, employerPostedJobs, getCompanyForJob, getJobById, listApplications } from "@/lib/store";
import { formatSalary, jobLocation, pluralize, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employer dashboard",
  description: "Your listings and applicants in one place.",
};

export default function DashboardPage() {
  const jobs = employerPostedJobs();
  const applications = listApplications();
  const totalApplicants = applications.length;

  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Employer dashboard" subtitle="Listings you posted and every application received." href="/employers/post" linkLabel="Post another job" />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Your listings", value: jobs.length },
          { label: "Applications (all jobs)", value: totalApplicants },
          { label: "Applications to your jobs", value: jobs.reduce((n, j) => n + applicationsForJob(j.id).length, 0) },
          { label: "Avg. per listing", value: jobs.length ? (jobs.reduce((n, j) => n + applicationsForJob(j.id).length, 0) / jobs.length).toFixed(1) : "0" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Your listings</h2>
        {jobs.length === 0 ? (
          <EmptyState
            title="You haven't posted a job yet"
            action={
              <Link href="/employers/post" className="btn-accent">
                Post your first job
              </Link>
            }
          >
            Jobs you post in this session show up here with their applicant counts. This demo keeps data in memory, so listings reset when the server restarts.
          </EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Pay</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3 text-right">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${j.slug}`} className="font-semibold text-brand-700 hover:underline">
                        {j.title}
                      </Link>
                      <p className="text-xs text-slate-500">{getCompanyForJob(j).name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{jobLocation(j)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatSalary(j)}</td>
                    <td className="px-4 py-3 text-slate-700">{timeAgo(j.postedAt)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{applicationsForJob(j.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Recent applications</h2>
        {applications.length === 0 ? (
          <EmptyState title="No applications yet">When candidates apply to any listing, they appear here with their contact details and resume link.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {applications.slice(0, 25).map((a) => {
              const job = getJobById(a.jobId);
              return (
                <li key={a.id} className="card p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <p className="text-sm text-slate-600">
                        <a href={`mailto:${a.email}`} className="text-brand-700 hover:underline">
                          {a.email}
                        </a>
                        {a.phone && <> · {a.phone}</>}
                      </p>
                      {job && (
                        <p className="mt-1 text-sm text-slate-600">
                          Applied to{" "}
                          <Link href={`/jobs/${job.slug}`} className="font-medium text-slate-800 hover:underline">
                            {job.title}
                          </Link>
                          {job.source === "employer" && (
                            <>
                              {" "}
                              <Badge tone="green">Your listing</Badge>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{timeAgo(a.createdAt)}</p>
                      {a.resumeUrl && (
                        <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-700 hover:underline">
                          Resume
                        </a>
                      )}
                    </div>
                  </div>
                  {a.coverNote && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{a.coverNote}</p>}
                </li>
              );
            })}
          </ul>
        )}
        {applications.length > 25 && <p className="mt-2 text-xs text-slate-500">Showing the 25 most recent of {pluralize(applications.length, "application")}.</p>}
      </section>
    </div>
  );
}
