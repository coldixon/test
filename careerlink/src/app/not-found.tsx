import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">The job may have been filled or the link may be out of date. Try a search instead.</p>
      <div className="mx-auto mt-8 max-w-2xl">
        <SearchBar />
      </div>
      <Link href="/" className="btn-ghost mt-6">
        Back to home
      </Link>
    </div>
  );
}
