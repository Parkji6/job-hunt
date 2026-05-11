# Job Discovery Dashboard

A personal daily job discovery system for executive-level opportunities, tailored to Valentin's profile and search criteria.

## How It Works

1. Run `npm run fetch` locally — the script calls the Adzuna API across Poland, UK, Netherlands, and France
2. It scores and filters each result against your criteria, then writes to `public/jobs-data.json` and `public/jobs-data.js`
3. Push to GitHub — Vercel auto-deploys the updated dashboard in ~30 seconds

## Daily Update Workflow

```bash
npm run fetch
git add public/jobs-data.json public/jobs-data.js
git commit -m "Daily jobs update"
git push
```

That's it. The dashboard at your Vercel URL will reflect the new jobs automatically.

## Setup (first time on a new machine)

1. Get a free Adzuna API key at https://developer.adzuna.com/
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```
3. Run `npm run fetch`

## Filtering Rules

**Seniority:** C-Level > VP > Director > Head (Manager and below excluded)

**Function areas (7):** Revenue, Product, Growth, Operations, Marketing, Ecommerce, CRM
- Marketing: only included when the role has GTM/growth/commercial scope (not pure brand/comms)

**Locations:**
- Tier 1 (preferred): Warsaw on-site or hybrid, anywhere in Poland
- Tier 2 (good): EU hybrid with direct flight from Warsaw, remote Poland, EU remote
- Tier 3 (open): remote worldwide
- Excluded: fully on-site outside Poland, USA-based roles

**Languages:** English, French, Spanish only
- Polish-language postings are auto-detected and excluded
- German-only and Italian-only roles are excluded

## Scoring Algorithm

| Dimension | Points |
|---|---|
| C-Level title | 35 |
| VP title | 32 |
| Director title | 28 |
| Head of title | 25 |
| Warsaw location | 30 |
| Poland (other city) | 28 |
| EU remote | 22 |
| Global remote | 15 |
| Language OK | 20 |
| Tech/SaaS company | 10 |
| Growth-stage funding | 3 |
| International scope | 2 |

**Minimum to appear on dashboard:** 50 points

## Project Structure

```
.
├── fetch-jobs.js           # Run this to fetch real jobs from Adzuna
├── .env                    # Your API credentials (not committed)
├── .env.example            # Credentials template
├── job-discovery-config.md # Full search criteria and preferences
├── valentin_profile.md     # Your profile and resume variants
├── vercel.json             # Vercel deployment config (serves public/)
└── public/
    ├── index.html          # Dashboard UI
    ├── jobs-data.json      # Job data (committed, read by Vercel)
    └── jobs-data.js        # Same data as JS (for opening locally)
```

## Data Source

Jobs are fetched from **Adzuna** (free API, 1000 requests/day).
Adzuna aggregates postings from company career pages, job boards, and recruiters across Europe.
Each result includes a direct link to the original posting.

The script makes ~110 API calls per run (27 search queries × 4 countries), well within the free tier.
