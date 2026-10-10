import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/Badge";
import AlertForm from "@/components/AlertForm";
import { getArticle, listArticles } from "@/lib/store";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const more = listArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="container-x py-8">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/advice" className="hover:text-brand-700">
          Career advice
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{article.category}</span>
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <article className="card min-w-0 p-6 sm:p-10">
          <Badge tone="brand">{article.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{article.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{article.excerpt}</p>
          <p className="mt-3 text-sm text-slate-500">
            {article.readMinutes} min read · {formatDate(article.publishedAt)}
          </p>
          <div className="prose-simple mt-8 text-base">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        <aside className="min-w-0 space-y-6">
          <section className="card p-5">
            <h2 className="text-base font-semibold text-slate-900">Put it into practice</h2>
            <p className="mt-1 text-sm text-slate-600">Get new jobs that match your skills delivered to your inbox.</p>
            <div className="mt-3">
              <AlertForm compact />
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">More advice</h2>
            <ul className="space-y-3">
              {more.map((a) => (
                <li key={a.slug}>
                  <Link href={`/advice/${a.slug}`} className="card block p-4 hover:shadow-md">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{a.category}</p>
                    <p className="mt-1 font-semibold leading-snug text-slate-900">{a.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
