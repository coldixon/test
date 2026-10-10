import Link from "next/link";
import { EMPLOYER_LINKS, NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { LogoMark } from "./Icons";

const SEEKER_LINKS = [
  ...NAV_LINKS,
  { href: "/saved", label: "Saved Jobs" },
  { href: "/alerts", label: "Job Alerts" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-x grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold text-brand-800">{SITE_NAME}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-slate-600">{SITE_TAGLINE} Connecting top talent, from Omaha to everywhere.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Job seekers</h3>
          <ul className="mt-3 space-y-2">
            {SEEKER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-slate-700 hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Employers</h3>
          <ul className="mt-3 space-y-2">
            {EMPLOYER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-slate-700 hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_NAME}. A simplified job board demo.
          </p>
          <p>Sample listings and companies are fictional.</p>
        </div>
      </div>
    </footer>
  );
}
