"use client";

import { useActionState } from "react";
import { postJob } from "@/lib/actions";
import { initialFormState } from "@/lib/form-state";
import { CATEGORIES, JOB_TYPES, WORK_MODES } from "@/lib/types";
import { Field, FormMessage, Input, Select, SubmitButton, Textarea } from "./form";

export default function PostJobForm() {
  const [state, action] = useActionState(postJob, initialFormState);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      <FormMessage ok={state.ok} message={state.message} />

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Job title" htmlFor="title" error={errors.title}>
            <Input id="title" name="title" required placeholder="e.g. Registered Nurse (Med/Surg)" error={errors.title} />
          </Field>
          <Field label="Category" htmlFor="category" error={errors.category}>
            <Select id="category" name="category" defaultValue="" required error={errors.category}>
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job type" htmlFor="type" error={errors.type}>
            <Select id="type" name="type" defaultValue="Full-time" error={errors.type}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Work setting" htmlFor="workMode" error={errors.workMode}>
            <Select id="workMode" name="workMode" defaultValue="On-site" error={errors.workMode}>
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City" htmlFor="city" error={errors.city}>
            <Input id="city" name="city" required placeholder="Omaha" error={errors.city} />
          </Field>
          <Field label="State" htmlFor="state" error={errors.state} hint="Two-letter code.">
            <Input id="state" name="state" required maxLength={2} placeholder="NE" className="uppercase" error={errors.state} />
          </Field>
        </div>
        <Field label="Skills" htmlFor="skills" error={errors.skills} hint="Comma-separated. These power search and the Browse Skills page.">
          <Input id="skills" name="skills" required placeholder="e.g. Nursing, Epic, BLS" error={errors.skills} />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Pay</h2>
        <p className="text-sm text-slate-600">Listings with pay ranges get up to twice as many applicants.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Minimum" htmlFor="salaryMin" error={errors.salaryMin}>
            <Input id="salaryMin" name="salaryMin" inputMode="decimal" required placeholder="60000" error={errors.salaryMin} />
          </Field>
          <Field label="Maximum" htmlFor="salaryMax" error={errors.salaryMax}>
            <Input id="salaryMax" name="salaryMax" inputMode="decimal" required placeholder="75000" error={errors.salaryMax} />
          </Field>
          <Field label="Per" htmlFor="salaryPeriod" error={errors.salaryPeriod}>
            <Select id="salaryPeriod" name="salaryPeriod" defaultValue="year" error={errors.salaryPeriod}>
              <option value="year">Year</option>
              <option value="hour">Hour</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Description</h2>
        <Field label="One-sentence summary" htmlFor="summary" error={errors.summary} hint="Shown in search results. Lead with what makes this job worth a click.">
          <Input id="summary" name="summary" required placeholder="Join a 32-bed unit with a 5:1 ratio and a $10,000 sign-on bonus." error={errors.summary} />
        </Field>
        <Field label="About the role" htmlFor="description" error={errors.description} hint="One paragraph per line.">
          <Textarea id="description" name="description" required rows={5} error={errors.description} />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Responsibilities" htmlFor="responsibilities" error={errors.responsibilities} hint="One per line.">
            <Textarea id="responsibilities" name="responsibilities" rows={5} />
          </Field>
          <Field label="Requirements" htmlFor="requirements" error={errors.requirements} hint="One per line.">
            <Textarea id="requirements" name="requirements" rows={5} />
          </Field>
          <Field label="Benefits" htmlFor="benefits" error={errors.benefits} hint="One per line.">
            <Textarea id="benefits" name="benefits" rows={5} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Your company</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="companyName" error={errors.companyName} hint="Existing employers are matched by name.">
            <Input id="companyName" name="companyName" required autoComplete="organization" error={errors.companyName} />
          </Field>
          <Field label="Contact email" htmlFor="contactEmail" error={errors.contactEmail} hint="Where we send applications. Not shown publicly.">
            <Input id="contactEmail" name="contactEmail" type="email" required autoComplete="email" error={errors.contactEmail} />
          </Field>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pendingText="Publishing…" className="btn-accent px-6">
          Publish job
        </SubmitButton>
        <p className="text-xs text-slate-500">Your listing goes live immediately and appears in search.</p>
      </div>
    </form>
  );
}
