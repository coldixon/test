/**
 * Build Together as one HTML file that runs from disk or any static host.
 *
 *   npm run bundle
 *
 * Writes:
 *   dist/together.html           a complete document; double-click it
 *   dist/together.artifact.html  the same page without the document skeleton,
 *                                for hosts that wrap the file themselves
 *
 * Everything, React included, is inlined, so the file also works offline.
 * Routing is by hash (#plan, #money, ...) so no server is needed.
 */

import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");

const FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap";

const result = await esbuild.build({
  absWorkingDir: root,
  entryPoints: [path.join(here, "single-file", "main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  alias: {
    "next/link": path.join(here, "shims", "link.tsx"),
    "next/navigation": path.join(here, "shims", "navigation.tsx"),
  },
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: path.join(root, "tsconfig.json"),
  outdir: dist,
  write: false,
  logLevel: "warning",
});

const js = result.outputFiles.find((f) => f.path.endsWith(".js"))?.text ?? "";
const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
if (!js) throw new Error("No JavaScript output");

const safeJs = js.replace(/<\/script/gi, "<\\/script");

const head = `<title>Together</title>
<meta name="description" content="Shared money for couples: a cash-flow forecast, a safe-to-spend number, and a proactive assistant whose numbers always come from the calculation engine.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
/* Layout: one column of cards under a top bar on desktop, a bottom tab bar on phones. Light theme by design. */
:root { color-scheme: light; }
${css}
</style>
`;

const app = `<div id="together-root"></div>
<script>
${safeJs}
</script>
`;

// Hosts that wrap the file in their own document skeleton take head and app together.
const body = head + app;

const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}</head>
<body>
${app}</body>
</html>
`;

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "together.html"), document);
fs.writeFileSync(path.join(dist, "together.artifact.html"), body);
const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
console.log(`dist/together.html ${kb(document)} · dist/together.artifact.html ${kb(body)}`);
