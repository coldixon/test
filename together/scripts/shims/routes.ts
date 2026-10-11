/** Route <-> hash mapping shared by the link and navigation shims. */

const ROUTES: Record<string, string> = {
  "/": "home",
  "/plan/": "plan",
  "/money/": "money",
  "/goals/": "goals",
  "/insights/": "insights",
};

export function toHash(path: string): string {
  const clean = path.endsWith("/") || path === "/" ? path : `${path}/`;
  const token = ROUTES[clean] ?? "home";
  return `#${token}`;
}

export function fromHash(hash: string): string {
  const token = hash.replace(/^#/, "").toLowerCase();
  for (const [path, t] of Object.entries(ROUTES)) if (t === token) return path;
  return "/";
}
