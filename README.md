# Daily Lifeline

Design engineer daily activity lifeline. Log design, code, PRs, and reviews; share a public timeline with your team.

Built with Next.js, Supabase Auth, and [evilrabbit/lifeline](https://github.com/evilrabbit/lifeline) (journey-style day rail).

## Features

- **Invite-only auth** — magic link; only emails in `allowed_emails` can sign up
- **Private dashboard** (`/app`) — manual activity CRUD
- **Public lifeline** (`/u/[slug]`) — teammates see public entries without logging in
- Schema ready for future GitHub / Figma sync (`source`, `external_id`, `metadata`)

## Setup

1. Copy env:

```bash
cp .env.example .env.local
```

2. Fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. In Supabase Auth settings, add redirect URL:

```
http://localhost:3000/auth/callback
```

(and your production URL after deploy)

4. Ensure your email is in `allowed_emails` (SQL):

```sql
insert into public.allowed_emails (email) values ('you@company.com');
```

5. Run:

```bash
npm install
npm run dev
```

## Routes

| Path | Access |
|------|--------|
| `/login` | Magic link sign-in |
| `/app` | Owner dashboard |
| `/app/settings` | Profile + public slug |
| `/u/[slug]` | Public lifeline |

## Deploy

Production: [https://daily-lifeline.vercel.app](https://daily-lifeline.vercel.app)

Vercel project: `oberyon/daily-lifeline` (env vars already set for Production/Preview).

In Supabase → Authentication → URL configuration:

- **Site URL:** `https://daily-lifeline.vercel.app` (not the `*-oberyon.vercel.app` alias)
- **Redirect URLs:**
  - `https://daily-lifeline.vercel.app/**`
  - `https://daily-lifeline-oberyon.vercel.app/**`
  - `http://localhost:3000/**`

Owner email already allowlisted: `ozkalesamet@gmail.com` (add more via `allowed_emails`).
