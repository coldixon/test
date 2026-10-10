"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "./Icons";

interface NavItem {
  href: string;
  label: string;
}

export default function MobileNav({ primary, employer }: { primary: NavItem[]; employer: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="btn-ghost -mr-2 px-2"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>
      {open && (
        <div id="mobile-nav" className="absolute inset-x-0 top-full z-40 border-b border-slate-200 bg-white shadow-lg">
          <nav className="container-x flex flex-col py-3" aria-label="Mobile">
            {primary.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
            <Link href="/saved" className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-100">
              Saved Jobs
            </Link>
            <div className="my-2 border-t border-slate-200" />
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">For employers</p>
            {employer.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
