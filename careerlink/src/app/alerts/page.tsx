import type { Metadata } from "next";
import AlertForm from "@/components/AlertForm";
import SectionHeading from "@/components/SectionHeading";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Job alerts",
  description: "Get an email the moment a matching job is posted.",
};

export default function AlertsPage() {
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Job alerts" subtitle="Early applicants get read. Let the jobs come to you." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <AlertForm />
        </div>
        <aside className="card p-5">
          <h2 className="font-semibold text-slate-900">How alerts work</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {[
              "Tell us the keywords and location you care about.",
              "We check every new listing against your alert.",
              "You get one email per day with matches, never more.",
              "Unsubscribe with one click from any email.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckIcon size={16} className="mt-0.5 shrink-0 text-teal-600" />
                {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
