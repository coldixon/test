"use client";

import { useActionState } from "react";
import { applyToJob } from "@/lib/actions";
import { initialFormState } from "@/lib/form-state";
import { Field, FormMessage, Input, SubmitButton, Textarea } from "./form";

export default function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [state, action] = useActionState(applyToJob, initialFormState);
  const errors = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="card p-6" id="apply">
        <FormMessage ok message={state.message} />
        <p className="mt-4 text-sm text-slate-600">Keep your momentum: save a few similar jobs or set up an alert so you hear about the next one first.</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-6" id="apply" noValidate>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Apply for this job</h2>
        <p className="mt-1 text-sm text-slate-600">Your application goes straight to the hiring team for {jobTitle}.</p>
      </div>
      <FormMessage ok={false} message={state.message} />
      <input type="hidden" name="jobId" value={jobId} />
      {errors.jobId && <p className="text-sm text-red-600">{errors.jobId}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" autoComplete="name" required error={errors.name} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required error={errors.email} />
        </Field>
        <Field label="Phone (optional)" htmlFor="phone" error={errors.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        </Field>
        <Field label="Resume link (optional)" htmlFor="resumeUrl" error={errors.resumeUrl} hint="A link to your resume, portfolio, or LinkedIn profile.">
          <Input id="resumeUrl" name="resumeUrl" type="url" placeholder="https://" error={errors.resumeUrl} />
        </Field>
      </div>
      <Field label="Short note to the employer (optional)" htmlFor="coverNote" error={errors.coverNote}>
        <Textarea id="coverNote" name="coverNote" maxLength={2000} placeholder="Two or three sentences on why you're a fit." error={errors.coverNote} />
      </Field>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pendingText="Sending…" className="btn-accent">
          Submit application
        </SubmitButton>
        <p className="text-xs text-slate-500">By applying you agree to share this information with the employer.</p>
      </div>
    </form>
  );
}
