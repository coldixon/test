import Link from "next/link";
import { CATEGORIES, JOB_TYPES, WORK_MODES } from "@/lib/types";

export interface FilterValues {
  q?: string;
  location?: string;
  category?: string;
  type?: string;
  mode?: string;
  skill?: string;
  company?: string;
  minSalary?: string;
  sort?: string;
}

const SALARY_OPTIONS = [
  { value: "", label: "Any pay" },
  { value: "40000", label: "$40,000+ / yr (≈ $19/hr)" },
  { value: "60000", label: "$60,000+ / yr (≈ $29/hr)" },
  { value: "80000", label: "$80,000+ / yr (≈ $38/hr)" },
  { value: "100000", label: "$100,000+ / yr" },
];

export default function FilterSidebar({ values }: { values: FilterValues }) {
  const active = Object.entries(values).filter(([k, v]) => v && k !== "q" && k !== "location" && k !== "sort");
  return (
    <form action="/jobs" method="get" className="card p-4 sm:p-5">
      <input type="hidden" name="q" value={values.q ?? ""} />
      <input type="hidden" name="location" value={values.location ?? ""} />
      {values.sort && <input type="hidden" name="sort" value={values.sort} />}
      {values.skill && <input type="hidden" name="skill" value={values.skill} />}
      {values.company && <input type="hidden" name="company" value={values.company} />}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Filters</h2>
        {active.length > 0 && (
          <Link href={`/jobs?${new URLSearchParams({ q: values.q ?? "", location: values.location ?? "" }).toString()}`} className="text-sm font-medium text-brand-700 hover:underline">
            Clear all
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="f-category" className="label">
            Category
          </label>
          <select id="f-category" name="category" defaultValue={values.category ?? ""} className="input">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">Job type</legend>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="type" value="" defaultChecked={!values.type} className="accent-brand-700" />
              Any
            </label>
            {JOB_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="type" value={t} defaultChecked={values.type === t} className="accent-brand-700" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Work setting</legend>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="mode" value="" defaultChecked={!values.mode} className="accent-brand-700" />
              Any
            </label>
            {WORK_MODES.map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" name="mode" value={m} defaultChecked={values.mode === m} className="accent-brand-700" />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="f-salary" className="label">
            Minimum pay
          </label>
          <select id="f-salary" name="minSalary" defaultValue={values.minSalary ?? ""} className="input">
            {SALARY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full">
          Apply filters
        </button>
      </div>
    </form>
  );
}
