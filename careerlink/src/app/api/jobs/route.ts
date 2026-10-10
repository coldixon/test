import { NextResponse } from "next/server";
import { getCompanyForJob, getJob } from "@/lib/store";
import { formatSalary, jobLocation } from "@/lib/format";

export const dynamic = "force-dynamic";

/** GET /api/jobs?slugs=a,b,c → compact job summaries, in the order requested. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);

  const jobs = slugs.flatMap((slug) => {
    const job = getJob(slug);
    if (!job) return [];
    const company = getCompanyForJob(job);
    return [
      {
        slug: job.slug,
        title: job.title,
        company: { name: company.name, color: company.color, slug: company.slug },
        location: jobLocation(job),
        type: job.type,
        workMode: job.workMode,
        salary: formatSalary(job),
        postedAt: job.postedAt,
      },
    ];
  });

  return NextResponse.json({ jobs, missing: slugs.filter((s) => !getJob(s)) });
}
