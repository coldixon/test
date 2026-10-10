import type { Metadata } from "next";
import Link from "next/link";
import PostJobForm from "@/components/PostJobForm";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Post a job",
  description: "Publish a job listing in minutes and start receiving applications.",
};

export default function PostJobPage() {
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Post a job" subtitle="Listings go live immediately and appear in search, browse pages, and matching alerts." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <PostJobForm />
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="card p-5">
            <h2 className="font-semibold text-slate-900">Tips for more applicants</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Use the title candidates search for, not an internal one.</li>
              <li>Include a real pay range. Listings with pay get far more clicks.</li>
              <li>List the skills you screen on. They power search and browse pages.</li>
              <li>Lead with what makes the job good: schedule, bonus, growth.</li>
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="font-semibold text-slate-900">Already posted?</h2>
            <p className="mt-1 text-sm text-slate-600">Track applicants for every listing in one place.</p>
            <Link href="/employers/dashboard" className="btn-secondary mt-3 w-full">
              Open dashboard
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
