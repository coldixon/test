"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "careerlink:saved-jobs";
const EVENT = "careerlink:saved-jobs-changed";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // Storage may be unavailable (private mode, blocked). Keep in-memory state only.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Saved jobs live in the viewer's browser only. */
export function useSavedJobs() {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current];
    write(next);
  }, []);

  const remove = useCallback((slug: string) => {
    write(read().filter((s) => s !== slug));
  }, []);

  return { saved, ready, toggle, remove, isSaved: (slug: string) => saved.includes(slug) };
}
