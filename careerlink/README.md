# CareerLink clone (simplified)

A simplified clone of [CareerLink.com](https://careerlink.com), the Omaha-based job board, built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

It covers the core product loop for both sides of the marketplace:

**Job seekers**
- Home page with keyword + location search, popular searches, category tiles, featured and newest jobs, featured employers, and upcoming career fairs
- `/jobs` search with relevance ranking, filters (category, job type, work setting, minimum pay, skill, company), sort (relevance, newest, highest pay), active-filter chips, and pagination
- `/jobs/[slug]` job detail with pay, location, description, responsibilities, requirements, benefits, skill links, company card, similar jobs, and an apply form
- `/browse` by skill, location, category, and employer, each with live job counts
- `/companies` and `/companies/[slug]` employer profiles with open jobs
- `/career-fairs` with free registration (remembered per browser)
- `/advice` career advice articles
- `/saved` bookmarked jobs (stored in the browser) and `/alerts` job alert sign-up

**Employers**
- `/employers` product overview and illustrative pricing
- `/employers/post` post-a-job form that publishes immediately and redirects to the live listing
- `/employers/dashboard` listings with applicant counts and every application received

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Checks:

```bash
npm run typecheck
npm run lint
```

## What was simplified

| CareerLink.com | This clone |
| --- | --- |
| Accounts, logins, resumes on file | No auth. Saved jobs and fair registrations live in `localStorage`; applications are sent as a guest |
| Database-backed listings | In-memory store seeded with 37 fictional jobs across 12 fictional employers. Jobs posted and applications received persist until the server restarts |
| Email job alerts | Alert sign-ups are recorded but no email is sent |
| Resume database, QR "Connect" signage, regional subdomains | Described on the employer page, not implemented |
| Paid plans and checkout | Illustrative pricing only; posting is free |

## Where things live

```
src/app/            routes (App Router)
src/components/     UI: header, job card, filters, forms, etc.
src/lib/types.ts    data model
src/lib/seed.ts     fictional companies, jobs, career fairs, articles
src/lib/store.ts    in-memory store: search, facets, create job/application/alert
src/lib/actions.ts  server actions: applyToJob, postJob, subscribeToAlerts
src/lib/site.ts     brand name, tagline, nav links
```

## Making it yours

- **Rebrand:** change `SITE_NAME` and friends in `src/lib/site.ts`. "CareerLink" is CareerLink.com's name; swap it before you launch.
- **Colors:** the `brand` palette is defined in `src/app/globals.css` under `@theme`.
- **Real data:** `src/lib/store.ts` is the only module that touches data. Replace its functions with database queries (Postgres, Supabase, etc.) and the rest of the app keeps working.
- **Real email:** wire `subscribeToAlerts` and `applyToJob` in `src/lib/actions.ts` to your email provider.
