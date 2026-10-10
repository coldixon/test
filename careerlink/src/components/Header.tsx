import Link from "next/link";
import { EMPLOYER_LINKS, NAV_LINKS, SITE_NAME } from "@/lib/site";
import { BookmarkIcon, LogoMark } from "./Icons";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="relative z-40 border-b border-slate-200 bg-white">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <LogoMark />
          <span className="text-xl font-bold tracking-tight text-brand-800">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-brand-800">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/saved" className="btn-ghost px-3">
            <BookmarkIcon size={18} />
            Saved
          </Link>
          <Link href="/employers" className="btn-secondary">
            Employers
          </Link>
          <Link href="/employers/post" className="btn-accent">
            Post a Job
          </Link>
        </div>

        <MobileNav primary={NAV_LINKS} employer={EMPLOYER_LINKS} />
      </div>
    </header>
  );
}
