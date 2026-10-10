"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-slate-600">
      Sort by
      <select
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams(searchParams.toString());
          sp.set("sort", e.target.value);
          sp.delete("page");
          router.push(`${pathname}?${sp.toString()}`);
        }}
        className="input w-auto py-1.5"
        aria-label="Sort results"
      >
        <option value="relevance">Relevance</option>
        <option value="newest">Newest</option>
        <option value="salary">Highest pay</option>
      </select>
    </label>
  );
}
