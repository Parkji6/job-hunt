# Job Discovery Dashboard

A personalized daily job discovery system for executive-level opportunities matching Valentin's profile and preferences.

## Features

✅ **Daily Automated Discovery**
- Runs automatically at 8:00 AM Warsaw time
- Fetches from 5 sources: LinkedIn, RemoteOK, Google Jobs, Wellfound, European job boards
- Scores each opportunity 0-100 based on fit to profile
- Minimum 10 new qualified jobs per day

✅ **Smart Filtering**
- Seniority: C-Level/Executive > VP > Director > Head
- Locations: Poland priority, Europe hybrid, Global remote
- Languages: English, French, Spanish only (no Polish-only roles)
- Excludes USA-based positions (unless explicitly remote worldwide)

✅ **Interactive Dashboard**
- Displays ranked opportunities with relevance scoring
- Filter by match level (Top Matches 70+, Good Fits 50-69, Worth Considering <50)
- Direct links to job postings
- Source breakdown and daily statistics

✅ **Deep-Dive Analysis**
- Click "Deep Dive" on any job to trigger comprehensive analysis
- Includes company research, fit assessment, gap analysis
- Resume tailoring recommendations
- Interview preparation

## Tech Stack

- **Frontend:** Static HTML + vanilla JavaScript (no build step)
- **Hosting:** Vercel (static site)
- **Automation:** Cowork scheduled tasks (runs daily discovery script)
- **Profile Storage:** Local markdown files + PDF resumes

## Project Structure

```
.
├── public/
│   └── index.html          # Dashboard UI (served by Vercel)
├── job-discovery-config.md # Your search criteria & preferences
├── job-discovery-script.md # Algorithm & ranking logic
├── valentin_profile.md     # Your stored profile & resumes
├── package.json            # Project metadata
├── vercel.json            # Vercel deployment config
├── .vercelignore          # Files to exclude from Vercel
└── .gitignore             # Git ignore patterns
```

## Deployment

### Push to GitHub

```bash
git remote add origin https://github.com/Parkji6/job-hunt.git
git add .
git commit -m "Initial dashboard setup"
git push origin main
```

### Enable Vercel Auto-Deployment

1. Go to vercel.com/import
2. Select your GitHub repository
3. Vercel will auto-detect and deploy
4. Dashboard will be live at your Vercel URL

### Daily Job Discovery

The `daily-job-discovery` scheduled task runs automatically every day at 8:00 AM:
- Fetches jobs from all 5 sources
- Applies ranking algorithm
- Saves results to `job-discovery-data/[DATE]-jobs.json`
- Updates dashboard with new opportunities

## Configuration

Edit `job-discovery-config.md` to customize:
- Target roles (7 function areas)
- Location preferences (tiers)
- Language requirements
- Company stage preferences
- Salary minimums

## Scoring Algorithm

Each job is scored on:
- **Function & Seniority** (35 pts): C-Level 35pts, VP 32pts, Director 28pts, Head 25pts
- **Location Match** (30 pts): Warsaw 30pts, Poland 28pts, EU hybrid 25pts, EU remote 22pts, Global remote 15pts
- **Language** (20 pts): English/French/Spanish 20pts, others 0pts (auto-excluded)
- **Company Context** (15 pts): Tech/SaaS 10pts, Growth stage +3pts, International +2pts

**Minimum threshold:** 50 points to appear on dashboard

## Daily Volume Target

- Minimum 10 new qualified jobs per day
- Deduplicated across sources
- Focused on posts from last 3-5 days
- Stale jobs (30+ days) marked as "Stale"

## Next Steps

1. Push this repo to GitHub (https://github.com/Parkji6/job-hunt.git)
2. Deploy to Vercel with auto-deployment enabled
3. Monitor first week of job discovery for quality
4. Provide feedback on:
   - Are the scoring and rankings accurate?
   - Are there enough jobs daily?
   - Any function areas being missed?
5. Iterate based on feedback

## Questions?

Review:
- `job-discovery-config.md` for your criteria
- `job-discovery-script.md` for the ranking algorithm
- `valentin_profile.md` for your stored profile
