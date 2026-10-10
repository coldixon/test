"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "./Icons";

const KEY = "careerlink:rsvp";

function read(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Demo registration: remembered in this browser only. */
export default function RsvpButton({ slug }: { slug: string }) {
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    setRegistered(read().includes(slug));
  }, [slug]);

  const toggle = () => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
    setRegistered(next.includes(slug));
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={registered} className={registered ? "btn-secondary border-emerald-300 bg-emerald-50 text-emerald-800" : "btn-primary"}>
      {registered ? (
        <>
          <CheckIcon size={16} /> Registered
        </>
      ) : (
        "Register free"
      )}
    </button>
  );
}
