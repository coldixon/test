import type { AnchorHTMLAttributes, ReactNode } from "react";
import { toHash } from "./routes";

/**
 * Stand-in for next/link in the single-file build. Routes become hash
 * tokens ("#plan") so the page works from a file or a static host with no
 * server-side routing.
 */
export default function Link({
  href,
  children,
  ...rest
}: { href: string | { pathname?: string }; children?: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const path = typeof href === "string" ? href : href.pathname ?? "/";
  return (
    <a href={toHash(path)} {...rest}>
      {children}
    </a>
  );
}
