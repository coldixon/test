import { useEffect, useState } from "react";
import { fromHash } from "./routes";

/** Stand-in for next/navigation's usePathname in the single-file build. */
export function usePathname(): string {
  const read = () => (typeof window === "undefined" ? "/" : fromHash(window.location.hash));
  const [path, setPath] = useState<string>(read);
  useEffect(() => {
    const onChange = () => {
      setPath(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}
