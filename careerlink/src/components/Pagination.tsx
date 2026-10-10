import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    else sp.delete("page");
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pages.push(p);

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary px-3">
          Previous
        </Link>
      ) : (
        <span className="btn-secondary px-3 opacity-50" aria-disabled="true">
          Previous
        </span>
      )}
      {pages[0]! > 1 && <span className="px-2 text-slate-400">…</span>}
      {pages.map((p) =>
        p === page ? (
          <span key={p} className="btn-primary px-3" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className="btn-ghost px-3">
            {p}
          </Link>
        ),
      )}
      {pages[pages.length - 1]! < totalPages && <span className="px-2 text-slate-400">…</span>}
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn-secondary px-3">
          Next
        </Link>
      ) : (
        <span className="btn-secondary px-3 opacity-50" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}
