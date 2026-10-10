import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { categoryFacets, companyFacets, listCompanies, locationFacets, skillFacets } from "@/lib/store";
import { pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse jobs by skill, location, category, and employer",
  description: "Explore every open job by the skills employers are asking for, by city, by category, and by employer.",
};

function FacetList({ items, href, columns = 3 }: { items: { value: string; count: number }[]; href: (v: string) => string; columns?: number }) {
  return (
    <ul className={`grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {items.map((f) => (
        <li key={f.value}>
          <Link href={href(f.value)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white hover:shadow-sm">
            <span className="font-medium text-slate-800">{f.value}</span>
            <span className="text-slate-500">{pluralize(f.count, "job")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function BrowsePage() {
  const skills = skillFacets();
  const locations = locationFacets();
  const categories = categoryFacets();
  const companies = companyFacets();
  const companyBySlug = new Map(listCompanies().map((c) => [c.name, c.slug]));

  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Browse jobs" subtitle="Every open job, organized the way you think about your search." />

      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Browse sections">
        {[
          ["#skills", "Skills"],
          ["#locations", "Locations"],
          ["#categories", "Categories"],
          ["#employers", "Employers"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="btn-secondary px-3 py-1.5">
            {label}
          </a>
        ))}
      </nav>

      <section id="skills" className="card scroll-mt-24 p-6">
        <h2 className="text-xl font-bold text-slate-900">Browse skills</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">{pluralize(skills.length, "skill")} employers are hiring for right now.</p>
        <FacetList items={skills} href={(v) => `/jobs?skill=${encodeURIComponent(v)}`} columns={4} />
      </section>

      <section id="locations" className="card mt-6 scroll-mt-24 p-6">
        <h2 className="text-xl font-bold text-slate-900">Browse locations</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">Jobs by city, plus remote roles you can do from anywhere.</p>
        <FacetList items={locations} href={(v) => `/jobs?location=${encodeURIComponent(v)}`} />
        <Link href="/jobs?location=remote" className="btn-ghost mt-3">
          See all remote jobs
        </Link>
      </section>

      <section id="categories" className="card mt-6 scroll-mt-24 p-6">
        <h2 className="text-xl font-bold text-slate-900">Browse categories</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">The kind of work, from healthcare to the trades.</p>
        <FacetList items={categories} href={(v) => `/jobs?category=${encodeURIComponent(v)}`} />
      </section>

      <section id="employers" className="card mt-6 scroll-mt-24 p-6">
        <h2 className="text-xl font-bold text-slate-900">Browse employers</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">Who is hiring, and how many roles each has open.</p>
        <FacetList items={companies} href={(v) => `/jobs?company=${encodeURIComponent(companyBySlug.get(v) ?? v)}`} />
        <Link href="/companies" className="btn-ghost mt-3">
          View company profiles
        </Link>
      </section>
    </div>
  );
}
