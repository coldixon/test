import type { Metadata } from "next";
import Link from "next/link";
import Badge from "@/components/Badge";
import SectionHeading from "@/components/SectionHeading";
import { listArticles } from "@/lib/store";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Career advice",
  description: "Practical advice on resumes, interviews, salary negotiation, and getting found by recruiters.",
};

export default function AdvicePage() {
  const articles = listArticles();
  const [lead, ...rest] = articles;
  return (
    <div className="container-x py-8">
      <SectionHeading as="h1" title="Career advice" subtitle="Short, practical reads from people who hire." />

      {lead && (
        <Link href={`/advice/${lead.slug}`} className="card block bg-gradient-to-br from-brand-800 to-brand-700 p-8 text-white transition-shadow hover:shadow-lg">
          <Badge tone="amber">{lead.category}</Badge>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{lead.title}</h2>
          <p className="mt-2 max-w-2xl text-brand-100">{lead.excerpt}</p>
          <p className="mt-4 text-sm text-brand-200">
            {lead.readMinutes} min read · {formatDate(lead.publishedAt)}
          </p>
        </Link>
      )}

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <li key={a.slug}>
            <Link href={`/advice/${a.slug}`} className="card flex h-full flex-col p-5 transition-shadow hover:shadow-md">
              <Badge tone="brand">{a.category}</Badge>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{a.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{a.excerpt}</p>
              <p className="mt-auto pt-4 text-xs text-slate-500">
                {a.readMinutes} min read · {formatDate(a.publishedAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
