import { seedArticles, seedCareerFairs, seedCompanies, seedJobs } from "./seed";
import { slugify } from "./format";
import type {
  Application,
  Article,
  CareerFair,
  Company,
  Job,
  JobAlert,
  SearchParams,
  SearchResult,
} from "./types";

/**
 * In-memory store. Seeded on first access and kept on globalThis so it
 * survives hot reloads in development. Data written at runtime (posted jobs,
 * applications, alerts) lives until the server process restarts. Swap this
 * module for a database adapter when you outgrow it.
 */
interface Database {
  jobs: Job[];
  companies: Company[];
  applications: Application[];
  alerts: JobAlert[];
}

const g = globalThis as unknown as { __careerlinkDb?: Database };

function db(): Database {
  if (!g.__careerlinkDb) {
    g.__careerlinkDb = {
      jobs: [...seedJobs],
      companies: [...seedCompanies],
      applications: [],
      alerts: [],
    };
  }
  return g.__careerlinkDb;
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export const PAGE_SIZE = 10;

// ---------- Companies ----------

export function listCompanies(): Company[] {
  return [...db().companies].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompany(slug: string): Company | undefined {
  return db().companies.find((c) => c.slug === slug);
}

export function getCompanyForJob(job: Job): Company {
  return (
    getCompany(job.companySlug) ?? {
      slug: job.companySlug,
      name: job.companySlug,
      tagline: "",
      industry: "",
      headquarters: `${job.city}, ${job.state}`,
      size: "",
      website: "",
      description: [],
      featured: false,
      color: "#334155",
    }
  );
}

export function featuredCompanies(): Company[] {
  return listCompanies().filter((c) => c.featured);
}

export function openJobCount(companySlug: string): number {
  return db().jobs.filter((j) => j.companySlug === companySlug).length;
}

function findOrCreateCompany(name: string, location: { city: string; state: string }): Company {
  const trimmed = name.trim();
  const existing = db().companies.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  let slug = slugify(trimmed) || "company";
  while (getCompany(slug)) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  const company: Company = {
    slug,
    name: trimmed,
    tagline: "",
    industry: "",
    headquarters: `${location.city}, ${location.state}`,
    size: "",
    website: "",
    description: [],
    featured: false,
    color: pickColor(trimmed),
  };
  db().companies.push(company);
  return company;
}

const PALETTE = ["#0E7C86", "#2F6FED", "#1E3A8A", "#B45309", "#9D174D", "#065F46", "#C2410C", "#0F766E", "#7C3AED", "#B91C1C"];
function pickColor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length]!;
}

// ---------- Jobs ----------

export function listJobs(): Job[] {
  return [...db().jobs].sort(byNewest);
}

export function getJob(slug: string): Job | undefined {
  return db().jobs.find((j) => j.slug === slug);
}

export function getJobById(id: string): Job | undefined {
  return db().jobs.find((j) => j.id === id);
}

export function featuredJobs(limit = 6): Job[] {
  return listJobs().filter((j) => j.featured).slice(0, limit);
}

export function newestJobs(limit = 8): Job[] {
  return listJobs().slice(0, limit);
}

export function jobsForCompany(companySlug: string): Job[] {
  return listJobs().filter((j) => j.companySlug === companySlug);
}

export function relatedJobs(job: Job, limit = 4): Job[] {
  const skills = new Set(job.skills.map((s) => s.toLowerCase()));
  return listJobs()
    .filter((j) => j.id !== job.id)
    .map((j) => {
      let score = 0;
      if (j.category === job.category) score += 3;
      if (j.companySlug === job.companySlug) score += 1;
      if (j.city === job.city) score += 1;
      for (const s of j.skills) if (skills.has(s.toLowerCase())) score += 2;
      return { j, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.j);
}

function byNewest(a: Job, b: Job): number {
  return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
}

function annualized(job: Job): number {
  // Rough comparison basis: hourly × 2,080 hours.
  const mid = (job.salaryMin + job.salaryMax) / 2;
  return job.salaryPeriod === "hour" ? mid * 2080 : mid;
}

function matchesLocation(job: Job, location: string): boolean {
  const q = location.trim().toLowerCase();
  if (!q) return true;
  if (q === "remote") return job.workMode === "Remote";
  const city = job.city.toLowerCase();
  const state = job.state.toLowerCase();
  const full = `${city}, ${state}`;
  const stateNames: Record<string, string> = {
    ne: "nebraska",
    ia: "iowa",
    co: "colorado",
    mo: "missouri",
    il: "illinois",
    az: "arizona",
    pa: "pennsylvania",
  };
  const stateName = stateNames[state] ?? "";
  return (
    full.includes(q) ||
    city.includes(q) ||
    state === q ||
    (stateName !== "" && stateName.includes(q)) ||
    (q.includes("remote") && job.workMode === "Remote")
  );
}

function relevance(job: Job, company: Company, terms: string[]): number {
  if (terms.length === 0) return 0;
  const title = job.title.toLowerCase();
  const skills = job.skills.map((s) => s.toLowerCase());
  const companyName = company.name.toLowerCase();
  const haystack = `${job.summary} ${job.category} ${job.description.join(" ")}`.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 10;
    if (skills.some((s) => s.includes(t))) score += 6;
    if (companyName.includes(t)) score += 5;
    if (haystack.includes(t)) score += 2;
  }
  return score;
}

export function searchJobs(params: SearchParams): SearchResult {
  const terms = (params.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const scored = db()
    .jobs.map((job) => ({ job, company: getCompanyForJob(job) }))
    .filter(({ job }) => {
      if (params.location && !matchesLocation(job, params.location)) return false;
      if (params.category && job.category !== params.category) return false;
      if (params.type && job.type !== params.type) return false;
      if (params.mode && job.workMode !== params.mode) return false;
      if (params.company && job.companySlug !== params.company) return false;
      if (params.skill && !job.skills.some((s) => s.toLowerCase() === params.skill!.toLowerCase())) return false;
      if (params.minSalary && annualized(job) < params.minSalary) return false;
      return true;
    })
    .map(({ job, company }) => ({ job, score: relevance(job, company, terms) }))
    .filter(({ score }) => terms.length === 0 || score > 0);

  const sort = params.sort ?? (terms.length > 0 ? "relevance" : "newest");
  scored.sort((a, b) => {
    if (sort === "salary") return annualized(b.job) - annualized(a.job);
    if (sort === "relevance" && b.score !== a.score) return b.score - a.score;
    return byNewest(a.job, b.job);
  });

  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page ?? 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  return {
    jobs: scored.slice(start, start + PAGE_SIZE).map((x) => x.job),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

export interface NewJobInput {
  title: string;
  companyName: string;
  city: string;
  state: string;
  workMode: Job["workMode"];
  type: Job["type"];
  category: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: Job["salaryPeriod"];
  summary: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export function createJob(input: NewJobInput): Job {
  const company = findOrCreateCompany(input.companyName, { city: input.city, state: input.state });
  let slug = slugify(`${input.title}-${company.name}`) || "job";
  while (getJob(slug)) slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
  const job: Job = {
    id: newId("job"),
    slug,
    title: input.title,
    companySlug: company.slug,
    city: input.city,
    state: input.state,
    workMode: input.workMode,
    type: input.type,
    category: input.category,
    skills: input.skills,
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    salaryPeriod: input.salaryPeriod,
    postedAt: new Date().toISOString(),
    summary: input.summary,
    description: input.description,
    responsibilities: input.responsibilities,
    requirements: input.requirements,
    benefits: input.benefits,
    featured: false,
    source: "employer",
  };
  db().jobs.unshift(job);
  return job;
}

export function employerPostedJobs(): Job[] {
  return listJobs().filter((j) => j.source === "employer");
}

// ---------- Facets ----------

export interface Facet {
  value: string;
  count: number;
}

function countBy(values: string[]): Facet[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function categoryFacets(): Facet[] {
  return countBy(db().jobs.map((j) => j.category));
}

export function skillFacets(limit?: number): Facet[] {
  const facets = countBy(db().jobs.flatMap((j) => j.skills));
  return limit ? facets.slice(0, limit) : facets;
}

export function locationFacets(): Facet[] {
  return countBy(db().jobs.map((j) => `${j.city}, ${j.state}`));
}

export function typeFacets(): Facet[] {
  return countBy(db().jobs.map((j) => j.type));
}

export function modeFacets(): Facet[] {
  return countBy(db().jobs.map((j) => j.workMode));
}

export function companyFacets(): Facet[] {
  return countBy(db().jobs.map((j) => getCompanyForJob(j).name));
}

// ---------- Career fairs & advice ----------

export function listCareerFairs(): CareerFair[] {
  return [...seedCareerFairs].sort((a, b) => a.date.localeCompare(b.date));
}

export function getCareerFair(slug: string): CareerFair | undefined {
  return seedCareerFairs.find((f) => f.slug === slug);
}

export function listArticles(): Article[] {
  return [...seedArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(slug: string): Article | undefined {
  return seedArticles.find((a) => a.slug === slug);
}

// ---------- Applications & alerts ----------

export function createApplication(input: Omit<Application, "id" | "createdAt">): Application {
  const application: Application = { ...input, id: newId("app"), createdAt: new Date().toISOString() };
  db().applications.push(application);
  return application;
}

export function applicationsForJob(jobId: string): Application[] {
  return db().applications.filter((a) => a.jobId === jobId);
}

export function listApplications(): Application[] {
  return [...db().applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createAlert(input: Omit<JobAlert, "id" | "createdAt">): JobAlert {
  const alert: JobAlert = { ...input, id: newId("alert"), createdAt: new Date().toISOString() };
  db().alerts.push(alert);
  return alert;
}

// ---------- Stats ----------

export function siteStats() {
  const jobs = db().jobs;
  return {
    jobs: jobs.length,
    companies: db().companies.length,
    remote: jobs.filter((j) => j.workMode === "Remote").length,
    cities: new Set(jobs.map((j) => `${j.city}, ${j.state}`)).size,
    applications: db().applications.length,
  };
}
