"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAlert, createApplication, createJob, getJobById } from "./store";
import { CATEGORIES, JOB_TYPES, WORK_MODES, type JobType, type SalaryPeriod, type WorkMode } from "./types";
import type { FormState } from "./form-state";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function lines(formData: FormData, key: string): string[] {
  return text(formData, key)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export async function applyToJob(_prev: FormState, formData: FormData): Promise<FormState> {
  const jobId = text(formData, "jobId");
  const name = text(formData, "name");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const resumeUrl = text(formData, "resumeUrl");
  const coverNote = text(formData, "coverNote");

  const errors: Record<string, string> = {};
  if (!getJobById(jobId)) errors.jobId = "This job is no longer available.";
  if (name.length < 2) errors.name = "Enter your full name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (resumeUrl && !/^https?:\/\//i.test(resumeUrl)) errors.resumeUrl = "Resume link must start with http:// or https://.";
  if (coverNote.length > 2000) errors.coverNote = "Keep your note under 2,000 characters.";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };

  createApplication({ jobId, name, email, phone, resumeUrl, coverNote });
  revalidatePath("/employers/dashboard");
  return { ok: true, message: `Application sent. ${name.split(" ")[0]}, the employer will reach out to ${email}.` };
}

export async function subscribeToAlerts(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const keywords = text(formData, "keywords");
  const location = text(formData, "location");
  if (!EMAIL_RE.test(email)) {
    return { ok: false, errors: { email: "Enter a valid email address." }, message: "Please fix the highlighted fields." };
  }
  createAlert({ email, keywords, location });
  const what = [keywords, location].filter(Boolean).join(" in ") || "new jobs";
  return { ok: true, message: `You're subscribed. We'll email ${email} when ${what} are posted.` };
}

export async function postJob(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = text(formData, "title");
  const companyName = text(formData, "companyName");
  const city = text(formData, "city");
  const state = text(formData, "state").toUpperCase();
  const workMode = text(formData, "workMode") as WorkMode;
  const type = text(formData, "type") as JobType;
  const category = text(formData, "category");
  const skills = text(formData, "skills")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
  const salaryPeriod = (text(formData, "salaryPeriod") || "year") as SalaryPeriod;
  const salaryMin = Number(text(formData, "salaryMin").replace(/[^0-9.]/g, ""));
  const salaryMax = Number(text(formData, "salaryMax").replace(/[^0-9.]/g, ""));
  const summary = text(formData, "summary");
  const description = lines(formData, "description");
  const responsibilities = lines(formData, "responsibilities");
  const requirements = lines(formData, "requirements");
  const benefits = lines(formData, "benefits");
  const contactEmail = text(formData, "contactEmail");

  const errors: Record<string, string> = {};
  if (title.length < 3) errors.title = "Enter a job title.";
  if (companyName.length < 2) errors.companyName = "Enter your company name.";
  if (!EMAIL_RE.test(contactEmail)) errors.contactEmail = "Enter a valid contact email.";
  if (city.length < 2) errors.city = "Enter a city.";
  if (!/^[A-Z]{2}$/.test(state)) errors.state = "Use a two-letter state code.";
  if (!WORK_MODES.includes(workMode)) errors.workMode = "Choose a work setting.";
  if (!JOB_TYPES.includes(type)) errors.type = "Choose a job type.";
  if (!CATEGORIES.includes(category)) errors.category = "Choose a category.";
  if (skills.length === 0) errors.skills = "List at least one skill, separated by commas.";
  if (!Number.isFinite(salaryMin) || salaryMin <= 0) errors.salaryMin = "Enter a minimum pay amount.";
  if (!Number.isFinite(salaryMax) || salaryMax < salaryMin) errors.salaryMax = "Maximum must be at least the minimum.";
  if (salaryPeriod !== "year" && salaryPeriod !== "hour") errors.salaryPeriod = "Choose per year or per hour.";
  if (summary.length < 20) errors.summary = "Write a one-sentence summary of at least 20 characters.";
  if (description.length === 0) errors.description = "Describe the role.";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Please fix the highlighted fields." };

  const job = createJob({
    title,
    companyName,
    city,
    state,
    workMode,
    type,
    category,
    skills,
    salaryMin,
    salaryMax,
    salaryPeriod,
    summary,
    description,
    responsibilities,
    requirements,
    benefits,
  });
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/employers/dashboard");
  redirect(`/jobs/${job.slug}?posted=1`);
}
