"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoSnapshot } from "@/lib/data/demo";
import { BellIcon, GoalsIcon, HomeIcon, InsightsIcon, Logo, MoneyIcon, PlanIcon } from "./icons";

const NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/plan/", label: "Plan", Icon: PlanIcon },
  { href: "/money/", label: "Money", Icon: MoneyIcon },
  { href: "/goals/", label: "Goals", Icon: GoalsIcon },
  { href: "/insights/", label: "Insights", Icon: InsightsIcon },
];

function isActive(pathname: string, href: string) {
  const clean = (s: string) => s.replace(/\/+$/, "") || "/";
  return clean(pathname) === clean(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const snapshot = demoSnapshot;
  const synced = snapshot.accounts.filter((a) => a.lastSyncedAt).length;
  const latest = snapshot.accounts.map((a) => a.lastSyncedAt).sort().pop();
  const minutesAgo = latest && snapshot.clock ? Math.max(0, Math.round((Date.parse(snapshot.clock) - Date.parse(latest)) / 60000)) : null;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" aria-label="Together home">
            <Logo />
            <span className="brand-name">Together</span>
          </Link>
          <nav className="topnav" aria-label="Primary">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="topbar-status">
            <span className="sync">
              <span className="sync-dot" aria-hidden="true" />
              {synced} accounts synced{minutesAgo !== null ? ` · ${minutesAgo} min ago` : ""}
            </span>
            <div className="avatars" aria-label="Partners">
              {snapshot.partners.map((p) => (
                <span key={p.id} className="avatar" title={p.name} style={{ background: p.color }}>
                  {p.initial}
                </span>
              ))}
            </div>
          </div>
          <Link href="/insights/" className="icon-btn mobile-only" aria-label="Notifications">
            <BellIcon />
            <span className="badge" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main className="main">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <Icon stroke={active ? "#0F1E33" : "#4B5869"} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
