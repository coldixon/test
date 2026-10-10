"use client";

import { useFormStatus } from "react-dom";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...props} aria-invalid={error ? true : undefined} className={`input ${error ? "input-error" : ""} ${className}`} />;
}

export function Select({ error, className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select {...props} aria-invalid={error ? true : undefined} className={`input ${error ? "input-error" : ""} ${className}`}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...props} aria-invalid={error ? true : undefined} className={`input min-h-24 ${error ? "input-error" : ""} ${className}`} />;
}

export function SubmitButton({ children, pendingText, className = "btn-primary" }: { children: ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`rounded-lg border px-4 py-3 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
    >
      {message}
    </div>
  );
}
