export type JobType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Temporary";

export type WorkMode = "On-site" | "Hybrid" | "Remote";

export type SalaryPeriod = "year" | "hour";

export interface Company {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  headquarters: string;
  size: string;
  website: string;
  description: string[];
  featured: boolean;
  /** Tailwind-free accent used for the initials logo. */
  color: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  companySlug: string;
  city: string;
  state: string;
  workMode: WorkMode;
  type: JobType;
  category: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: SalaryPeriod;
  postedAt: string;
  summary: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  featured: boolean;
  source: "seed" | "employer";
}

export interface CareerFair {
  slug: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  state: string;
  description: string;
  employerCount: number;
  audience: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
  body: string[];
}

export interface Application {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverNote: string;
  createdAt: string;
}

export interface JobAlert {
  id: string;
  email: string;
  keywords: string;
  location: string;
  createdAt: string;
}

export interface SearchParams {
  q?: string;
  location?: string;
  category?: string;
  type?: string;
  mode?: string;
  skill?: string;
  company?: string;
  minSalary?: number;
  sort?: "relevance" | "newest" | "salary";
  page?: number;
}

export interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const JOB_TYPES: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];

export const WORK_MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

export const CATEGORIES: string[] = [
  "Healthcare",
  "Technology",
  "Finance & Accounting",
  "Sales & Marketing",
  "Skilled Trades",
  "Manufacturing & Logistics",
  "Education",
  "Customer Service",
  "Administrative",
  "Hospitality",
];
