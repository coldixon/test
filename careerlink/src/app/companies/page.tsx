import type { Metadata } from "next";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import SectionHeading from "@/components/SectionHeading";
import Badge from "@/components/Badge";
import { listCompanies, openJobCount } from "@/lib/store";
import { pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Companies hiring now",
  description: "Browse verified employers, read about their culture and benefits, and see every job they have open.",
};

export default function CompaniesPage() {
  const companies = listCompanies();
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Companies hiring now" subtitle={`${pluralize(companies.length, "employer")} with open roles. Click through for profiles and jobs.`} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const open = openJobCount(c.slug);
          return (
            <li key={c.slug}>
              <Link href={`/companies/${c.slug}`} className="card flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <CompanyLogo name={c.name} color={c.color} />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900">{c.name}</h2>
                    <p className="text-sm text-slate-500">{c.industry || "Employer"}</p>
                  </div>
                  {c.featured && <Badge tone="amber">Featured</Badge>}
                </div>
                {c.tagline && <p className="mt-3 text-sm text-slate-700">{c.tagline}</p>}
                <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                  <span className="text-slate-500">{c.headquarters}</span>
                  <span className="font-semibold text-brand-700">{pluralize(open, "open job")}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
