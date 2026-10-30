# ARICT — Official Website

The official website of **ARICT — Association of Rajarata Information & Communication Technology**, the student technology community at Rajarata University of Sri Lanka.

Production: **https://arict.lk**

It is a full web application: a public site (Events, Projects, Team, About, Contact, Join), public project submissions with moderation, membership applications, an admin dashboard with role-based access, PostgreSQL storage, image uploads to Vercel Blob, and a Contact Us form delivered by EmailJS.

---

## Contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Local development](#local-development)
4. [Environment variables](#environment-variables)
5. [Database, migrations and seed data](#database-migrations-and-seed-data)
6. [Admin dashboard and roles](#admin-dashboard-and-roles)
7. [Content workflows](#content-workflows)
8. [Image uploads (4 MB limit)](#image-uploads-4-mb-limit)
9. [EmailJS setup (Contact Us form)](#emailjs-setup-contact-us-form)
10. [Deploying to Vercel](#deploying-to-vercel)
11. [Domain setup: arict.lk](#domain-setup-arictlk)
12. [SEO and Google Search](#seo-and-google-search)
13. [Favicon and site identity files](#favicon-and-site-identity-files)
14. [Caching and performance](#caching-and-performance)
15. [Security](#security)
16. [Scripts](#scripts)

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, Server Actions, Cache Components / Partial Prerendering) |
| Language / UI | TypeScript, Tailwind CSS v4, Lucide icons, Geist font |
| Motion | Framer Motion, Lenis smooth scrolling (disabled for `prefers-reduced-motion`) |
| Database | PostgreSQL (Neon via Vercel Marketplace) with Drizzle ORM and SQL migrations |
| Auth | Auth.js (NextAuth v5), email + password credentials, JWT sessions, roles checked server-side |
| Media | Vercel Blob (direct client uploads with a signed 4 MB / image-only policy) |
| Validation | Zod (shared by client and server) |
| Contact form | EmailJS (`@emailjs/browser`) |

## Project structure

```
app/
  (site)/                 Public website (navbar + footer layout)
    page.tsx              Homepage
    events/ [slug]/       Events list + detail
    projects/ [slug]/ submit/
    team/ [year]/         Current team + past committees
    about/ contact/ join/
  admin/
    login/                Sign-in page
    (dashboard)/          Protected admin area (events, projects, project-submissions,
                          team, team/terms, join-applications, settings, users)
  api/auth/[...nextauth]  Auth.js handlers
  api/upload/             Vercel Blob client-upload token endpoint (+ local dev fallback)
  sitemap.ts robots.ts manifest.ts
  favicon.ico icon.png apple-icon.png
  not-found.tsx error.tsx global-error.tsx
actions/                  Server Actions (public forms, admin mutations)
components/
  ui/ layout/ home/ events/ projects/ team/ contact/ join/ motion/ seo/ admin/
lib/
  db/                     Drizzle schema + client
  auth/                   Auth.js config + data-access layer (role checks)
  data/                   Cached public queries + admin queries
  seo/                    Metadata + JSON-LD builders
  validations/            Zod schemas
  emailjs/                EmailJS config + template params
  settings.ts             Admin-editable site settings (schemas + defaults)
drizzle/                  SQL migrations
scripts/                  migrate, seed, create-admin, generate-assets
proxy.ts                  Optimistic admin redirect (Next.js 16 "proxy", formerly middleware)
public/                   Brand assets, icons, hero image, default OG image
```

The motion primitives live in `components/motion`: `FadeIn`, `FadeUp`, `StaggerContainer`, `StaggerItem`, `RevealText`, `ParallaxImage`, `AnimatedCounter`, `ScrollProgress` and `SmoothScrollProvider`.

## Local development

Requirements: Node.js 20.9+ and a PostgreSQL database. The simplest option is a free Neon database, or any local Postgres.

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
npx auth secret               # prints a value for AUTH_SECRET
npm run db:migrate            # create tables
npm run db:seed               # sample events, projects, committees + a Super Admin
npm run dev                   # http://localhost:3000
```

Sign in at **/admin/login** with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

**Uploads without Vercel Blob:** set `NEXT_PUBLIC_UPLOAD_MODE=local` in `.env`. Images are then saved to `.data/uploads` (git-ignored) and served from `/uploads/…`. This mode is disabled automatically on Vercel.

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Neon connection string (set by the Neon integration) |
| `DATABASE_URL_UNPOOLED` | recommended | Direct connection used for migrations |
| `AUTH_SECRET` | yes | Random 32+ byte secret (`npx auth secret`) |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://arict.lk` (canonical URLs, sitemap, Open Graph) |
| `BLOB_READ_WRITE_TOKEN` | yes (prod) | Set when a Blob store is connected to the Vercel project |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | yes | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | yes | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | yes | EmailJS public key (browser-safe by design) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | for scripts | Used by `db:seed` and `db:create-admin` |
| `NEXT_PUBLIC_UPLOAD_MODE` | dev only | `local` to store uploads on disk |

Never commit real values. `.env*` is git-ignored except `.env.example`.

## Database, migrations and seed data

- The schema is in `lib/db/schema.ts` and the SQL migrations are in `drizzle/`.
- After changing the schema, run `npm run db:generate` and commit the new migration.
- `npm run db:migrate` applies pending migrations. On Vercel this runs automatically: `vercel.json` uses `npm run build:vercel`, which runs migrate and then build.
- `npm run db:seed` **replaces all content** with realistic sample data: events, projects, submissions, three committees of 20 members each, and join applications. It refuses to run with `NODE_ENV=production` unless `--allow-production` is passed. All people in the seed data are fictional.
- `npm run db:create-admin` creates or resets a Super Admin **without touching other data**. Use it for production.

Database rules:

- Foreign keys and indexes on every relation.
- Only one current committee term, enforced by a partial unique index.
- One holder per executive position per term, enforced by a partial unique index.
- Committee seats are capped at 4 per academic year (1st, 2nd and 3rd). This is validated in a locked transaction.
- Images are stored as URLs only. Binary data never goes into Postgres.
- Contact Us messages are **not** stored. EmailJS is the only delivery path, so there is no `contact_messages` table.

## Admin dashboard and roles

`/admin` is protected server-side. Every admin page and every Server Action re-checks the session and the user's role from the database. `proxy.ts` only adds an early redirect to the login page.

| Role | Can manage |
| --- | --- |
| **Super Admin** | Everything, including admin accounts (`/admin/users`) |
| **Admin** | Events, Projects, Team, Project submissions, Join applications, Site settings |
| **Editor** | Events, Projects, Team |

Deactivating a user or changing their role takes effect on their next request.

Admin sections:

- **Dashboard:** totals, upcoming events, published projects, pending submissions, current members, past terms, pending applications.
- **Events:** create, edit, publish/unpublish, feature, archive, delete, cover and photos, registration link, status.
- **Projects:** create, edit, publish/unpublish, feature, archive, delete, screenshots, technologies, contributors, GitHub and live demo links.
- **Project Submissions:** search, filter, review, request changes, reject, and accept & convert into a project.
- **Team Members:** members per term, live capacity view (8 executive posts, 4 seats per year), homepage featuring.
- **Committee Terms:** create, edit, set current (the previous term moves to Past Committees), and delete *empty* terms only.
- **Join Applications:** search, filter by status or year, change status, internal notes, archive.
- **Site Settings:** hero (badge, heading, text, background, video URL, CTA), About preview, statistics, What We Do cards, homepage section titles, Join CTA, About page, contact details, social links, logo, default OG image, SEO description, footer.

## Content workflows

### Project submissions

1. A visitor uses **Share your Project** (`/projects/submit`) and uploads up to 1 cover and 5 screenshots, each 4 MB or less.
2. The submission is saved with status `pending`. It never appears publicly on its own.
3. An admin reviews it at `/admin/project-submissions/[id]` and sets it to `under_review`, `needs_changes` or `rejected`, with internal notes.
4. **Accept & create project** validates the admin-edited data, creates a regular project linked to the submission, and marks the submission `accepted`.
5. The new project is an **unpublished draft**. An admin must explicitly publish it.

Only projects with `published = true` (and not archived) appear publicly. The homepage additionally requires `featured = true`.

### Committee terms

Each member belongs to a term. When a new term becomes current, the old one appears under **Past Committees** (`/team/[year]`) with all its members and links intact. History is never deleted automatically.

## Image uploads (4 MB limit)

All uploads use the same rules: **4 MB or less**, JPG/JPEG/PNG/WebP/AVIF only. The error message is "Image size must be 4 MB or less."

- **Browser:** file size, extension and MIME type are checked before uploading (`lib/uploads.ts`).
- **Upload policy:** `/api/upload` issues a short-lived Vercel Blob client token with `maximumSizeInBytes = 4 MB` and an image-only `allowedContentTypes`, so the storage service itself enforces the limit. Admin uploads require an authenticated editor. Public submission uploads are rate-limited per IP and confined to `submissions/`.
- **Server:** when a submission is saved, every image URL must come from our submission upload path, and its size and content type are re-checked with Blob `head()`.
- **Local dev endpoint:** also checks the file's magic bytes.

## EmailJS setup (Contact Us form)

The Contact Us form sends email straight from the browser through EmailJS. No mail server is needed.

1. **Create an account** at https://www.emailjs.com.
2. **Add an email service** (Email Services → Add New Service) and connect the official ARICT inbox (for example Gmail or Outlook).
3. **Create a template** (Email Templates → Create New Template) called "Contact Us".
   Paste [the branded HTML template](templates/emailjs/contact-notification.html) into the template's HTML/code editor. See [the template setup guide](templates/emailjs/README.md) for exact dashboard fields and [sample test parameters](templates/emailjs/sample-params.json).
4. **Set the template variables.** Use these exact names:

   | Variable | Content |
   | --- | --- |
   | `{{from_name}}` | Sender's name |
   | `{{from_email}}` | Sender's email |
   | `{{phone}}` | Phone, or "Not provided" |
   | `{{subject}}` | Subject |
   | `{{message}}` | Message body |
   | `{{reply_to}}` | Sender's email, for direct replies |
   | `{{submitted_at}}` | Date and time (Sri Lanka time) |
   | `{{source_page}}` | Page URL the form was sent from |

   Suggested settings: **To Email** = the ARICT inbox, **Subject** = `[ARICT Website] {{subject}}`, **Reply To** = `{{reply_to}}` (so "Reply" goes straight to the sender), and **From Name** = `ARICT Website`. For **From Email**, use the connected email service's default address.

   Example body:
   ```
   New message from the ARICT website

   Name: {{from_name}}
   Email: {{from_email}}
   Phone: {{phone}}
   Subject: {{subject}}

   {{message}}

   Sent {{submitted_at}} from {{source_page}}
   ```
5. **Service ID:** copy it from Email Services.
6. **Template ID:** copy it from the template's settings.
7. **Public Key:** copy it from Account → General.
8. **Local:** add all three to `.env` as `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`.
9. **Vercel:** add the same three under Project → Settings → Environment Variables, then redeploy. `NEXT_PUBLIC_` values are inlined at build time.
10. **Security in EmailJS:** under Account → Security, restrict **Allowed origins** to `https://arict.lk`. Keep the **Private Key** out of this project; it is never needed or used.
11. **Test** by sending a message from https://arict.lk/contact after deploying.

Spam protection on the form: a hidden honeypot field, a minimum fill time, a 60-second cooldown per browser, EmailJS rate limiting and headless-browser blocking, and maximum field lengths. If EmailJS isn't configured, the form shows a notice with the official email address instead.

## Deploying to Vercel

Git repository → Vercel project → Neon Postgres → environment variables → Vercel Blob → EmailJS variables → production deployment → custom domain.

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel: **Add New → Project** and import the repository. The framework preset is Next.js; the build command comes from `vercel.json`.
3. **Storage → Create Database → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Choose the **Singapore (ap-southeast-1)** region; `vercel.json` pins functions to `sin1` next to it.
4. **Storage → Create → Blob** and connect it to the project. This sets `BLOB_READ_WRITE_TOKEN`.
5. Under **Settings → Environment Variables**, add `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://arict.lk` and the three `NEXT_PUBLIC_EMAILJS_*` values.
6. Deploy. Migrations run automatically before the build.
7. Create the first admin from your machine using the production `DATABASE_URL`:
   ```bash
   DATABASE_URL="…" SEED_ADMIN_EMAIL=you@arict.lk SEED_ADMIN_PASSWORD='a-long-password' npm run db:create-admin
   ```
8. Sign in at https://arict.lk/admin and fill in Site Settings: contact email, social links and hero video.
9. **Analytics → Enable** in the Vercel project to start collecting visitor stats. The `<SiteAnalytics />` component (`components/analytics.tsx`, rendered in `app/layout.tsx`) is already installed. It tracks public pages only; `/admin` page views are dropped in `beforeSend`. Vercel Web Analytics uses no cookies. In development it runs in debug mode and only logs to the browser console.

> Production builds prerender public pages, so the database must be reachable at build time. The Neon integration takes care of this.

## Domain setup: arict.lk

1. In Vercel: **Project → Settings → Domains** and add both `arict.lk` and `www.arict.lk`.
2. Make **`arict.lk` the primary domain** and set `www.arict.lk` to **redirect (308) to `arict.lk`**. `next.config.ts` also redirects `www` to the apex, as a backup.
3. At the `.lk` registrar or DNS provider, add the records Vercel shows. Usually:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`

   Or switch the nameservers to Vercel DNS.
4. Wait for DNS to propagate. Vercel issues HTTPS certificates automatically.
5. Keep `NEXT_PUBLIC_SITE_URL=https://arict.lk` so canonical URLs, the sitemap and Open Graph always use the apex domain.

## SEO and Google Search

What's implemented:

- **Site name `ARICT`** with alternate name "Association of Rajarata Information & Communication Technology", used consistently in metadata, `og:site_name` and structured data.
- **WebSite** and **Organization** JSON-LD on the homepage. `sameAs` lists only the social links configured in Site Settings, so no links are invented.
- **Event** JSON-LD on event pages (dates in +05:30, location, organizer, status, attendance mode).
- **BreadcrumbList** JSON-LD on all inner pages, with matching visible breadcrumbs.
- Unique `Page Name | ARICT` titles, 120–155 character descriptions, one H1 per page, and a logical H2/H3 structure.
- Self-referencing **canonical URLs** on https://arict.lk.
- Open Graph and Twitter cards with absolute URLs (default image: `public/og-default.jpg`).
- `https://arict.lk/sitemap.xml` (static pages, published events and projects, past committees) and `https://arict.lk/robots.txt`. Admin, API, drafts and submissions are excluded.
- Server-rendered content, real crawlable `<a>` links in the navbar and footer, and descriptive link text.
- Unknown or unpublished pages return `noindex`. Crawlers receive a real HTTP 404.

### Google Search Console checklist

1. Go to https://search.google.com/search-console and add a property for **arict.lk**.
2. Prefer a **Domain property**, verified with a DNS TXT record at the `.lk` DNS provider. It covers `https://`, `http://` and `www`.
3. Under **Sitemaps**, submit `https://arict.lk/sitemap.xml`.
4. **URL Inspection** → inspect `https://arict.lk/` → *Request indexing*.
5. Inspect `https://arict.lk/events`.
6. Inspect `https://arict.lk/projects`.
7. Inspect `https://arict.lk/team`.
8. Inspect `https://arict.lk/about`.
9. Inspect `https://arict.lk/contact`.
10. Monitor **Pages** (indexing), **Core Web Vitals**, and **Enhancements** (structured data: Events, Breadcrumbs) over the following weeks. You can also validate pages with the [Rich Results Test](https://search.google.com/test/rich-results).

**Google sitelinks cannot be guaranteed or manually forced.** Google decides whether to show them. The site is technically eligible: clear site name, favicon, page hierarchy, consistent internal links and a sitemap.

## Favicon and site identity files

A simplified ARICT mark (white geometric "A" with a brand-red base bar on black) is generated from `scripts/generate-assets.mjs`:

| File | Purpose |
| --- | --- |
| `app/favicon.ico` | 16/32/48 px favicon (served at `/favicon.ico`) |
| `app/icon.png` | 512×512 icon (`<link rel="icon">`) |
| `app/apple-icon.png` | 180×180 Apple touch icon |
| `public/icon-192.png`, `public/icon-512.png` | Web manifest icons |
| `public/icon-maskable-512.png` | Maskable manifest icon |
| `public/brand/arict-logo*.png`, `arict-wordmark*.png` | Trimmed logos (dark and light variants) |
| `public/og-default.jpg` | Default 1200×630 social image |
| `public/images/hero-campus.jpg` | Homepage hero background |
| `app/manifest.ts` | Web app manifest |

To regenerate after changing the source files in `public/brand/`, run `npm run assets`.

## Caching and performance

- Cache Components is enabled. Public data is read through `'use cache'` functions in `lib/data/public.ts`, tagged `settings`, `events`, `projects` and `team`. The custom `content` cache profile (`next.config.ts`) refreshes in the background every 15 minutes.
- Admin mutations call `updateTag(...)`, so changes appear on the public site on the next request.
- Pages are prerendered into static shells. Detail pages use partial prerendering for slugs not known at build time.
- Search and filters on Events and Projects run client-side over server-rendered lists, so they are instant and still crawlable.
- `next/image` serves AVIF/WebP. The hero image loads eagerly with high priority; everything else lazy-loads.
- Motion only animates `transform` and `opacity`. With `prefers-reduced-motion`, Lenis, parallax and decorative loops are disabled.

## Security

- Auth.js JWT sessions (8 h); bcrypt password hashes (cost 12); the role is re-read from the database on every admin request.
- Server-side authorization in every admin page, Server Action and upload token request.
- Zod validation on every input, with length limits, URL protocol checks (`http`/`https` only) and control-character stripping.
- User-submitted text is rendered as plain text (a small safe Markdown-like renderer), never as HTML. Submitted links are shown with `rel="nofollow ugc noopener"` and are never fetched or embedded.
- Postgres-backed rate limiting for sign-in, public forms and public uploads. Public forms also have a honeypot and a signed minimum-fill-time token.
- Database errors are never shown to users; actions return safe messages.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) and `X-Robots-Tag: noindex` on `/admin`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run build:vercel` | Migrate, then build (used by Vercel) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Replace content with sample data and create the Super Admin |
| `npm run db:create-admin` | Create or reset a Super Admin only |
| `npm run db:studio` | Drizzle Studio |
| `npm run assets` | Regenerate icons, logos, hero and OG images |
