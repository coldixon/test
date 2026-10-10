"use client";

import { useActionState } from "react";
import { subscribeToAlerts } from "@/lib/actions";
import { initialFormState } from "@/lib/form-state";
import { Field, FormMessage, Input, SubmitButton } from "./form";
import { BellIcon } from "./Icons";

export default function AlertForm({ keywords = "", location = "", compact = false }: { keywords?: string; location?: string; compact?: boolean }) {
  const [state, action] = useActionState(subscribeToAlerts, initialFormState);
  const errors = state.errors ?? {};

  if (state.ok) {
    return <FormMessage ok message={state.message} />;
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      {!compact && (
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-amber-100 p-2 text-amber-900">
            <BellIcon />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Get job alerts</h2>
            <p className="text-sm text-slate-600">Be first to apply. We email you when matching jobs are posted.</p>
          </div>
        </div>
      )}
      <FormMessage ok={false} message={state.message} />
      <div className={`grid grid-cols-1 gap-3 ${compact ? "" : "sm:grid-cols-3"}`}>
        <Field label="Keywords" htmlFor="alert-keywords" error={errors.keywords}>
          <Input id="alert-keywords" name="keywords" defaultValue={keywords} placeholder="e.g. nurse, electrician" />
        </Field>
        <Field label="Location" htmlFor="alert-location" error={errors.location}>
          <Input id="alert-location" name="location" defaultValue={location} placeholder="e.g. Omaha, NE or remote" />
        </Field>
        <Field label="Email" htmlFor="alert-email" error={errors.email}>
          <Input id="alert-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" error={errors.email} />
        </Field>
      </div>
      <SubmitButton pendingText="Subscribing…" className="btn-primary">
        Create alert
      </SubmitButton>
    </form>
  );
}
