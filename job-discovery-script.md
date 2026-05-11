# Daily Job Discovery Script

This script runs daily to fetch job opportunities from multiple sources, rank them by fit to Valentin's profile, and update the job discovery dashboard with today's top candidates.

## Job Sources & Search Strategy

### 1. LinkedIn Jobs (Public Search)
**Endpoint:** LinkedIn job search pages (publicly accessible, no login)
**Search Queries:**
- "CRO Poland" OR "Chief Revenue Officer Poland"
- "VP Revenue Warsaw" OR "Head of Revenue Poland"
- "VP Product Poland" OR "Chief Product Officer Europe"
- "VP Growth" + "Poland" OR "Europe" + "Remote"
- "Chief Operations Officer" OR "COO" + location filters
- "Chief Ecommerce Officer" OR "VP Ecommerce" + location
- "VP CRM" OR "Chief Customer Officer" + location filters
- Same searches with "remote" modifier
- Same searches with "Warsaw" + "hybrid" modifier
- **EXCLUDE:** Any posting mentioning "USA only" or "United States territory required"

**Coverage:** ~40-100 relevant jobs per day (Europe + Poland focus, excluding US)

---

### 2. RemoteOK.com API
**Endpoint:** RemoteOK.com has public API endpoints for job listings
**Filters:**
- Title contains: "CRO", "VP Revenue", "Chief Revenue", "VP Product", "Head of Growth", "COO", etc.
- Tags: "europe", "poland", "remote"
- Salary range: €80K+ (to filter senior roles)
- **EXCLUDE:** "USA" or "United States" only postings

**Coverage:** ~15-40 remote jobs per day

---

### 3. Google Jobs Aggregator
**Endpoint:** Google's job search aggregator
**Search Queries:**
- "[Role Title] [Location]" combinations (VP Product Warsaw, CMO Poland, etc.)
- Aggregate results from multiple sources
- Filter out USA-only positions

**Coverage:** ~20-60 aggregated jobs per day

---

### 4. Wellfound/AngelList
**Endpoint:** Wellfound job listings (startup-focused)
**Filters:**
- Role: CRO, VP Revenue, VP Product, Head of Growth, COO, etc.
- Location: Europe, Poland, Remote
- Company stage: Any
- **EXCLUDE:** USA-based (unless explicitly "Remote - no US territory required")

**Coverage:** ~5-20 startup jobs per day

---

### 5. European Job Boards (Builtin.eu, JobFluent, Experteer)
**Builtin.eu:** European tech jobs
**JobFluent:** Tech startup roles across Europe
**Experteer:** Executive roles in Europe

**Search Queries:** Same role + location combinations, EU-focused

**Coverage:** ~10-30 jobs per day

---

## Ranking Algorithm

For each job found, score on:

1. **Function Area & Seniority (35 pts max)**
   - C-Level/Executive: 35 pts
   - VP-level: 32 pts
   - Director-level: 28 pts
   - Head-level (if growth-focused): 25 pts
   - Below Director: 0 pts (exclude)

2. **Location Match (30 pts max)**
   - Tier 1 (Warsaw on-site/hybrid): 30 pts
   - Tier 1 (Poland remote): 28 pts
   - Tier 2 (European hybrid): 25 pts
   - Tier 2 (European remote): 22 pts
   - Tier 3 (Global remote): 15 pts
   - Non-matching or USA: 0 pts

3. **Language Match (20 pts max - CRITICAL FILTER)**
   - English: 20 pts
   - French: 18 pts
   - Spanish: 18 pts
   - Polish-only, German-only, or unsupported: 0 pts → EXCLUDE JOB
   - Multilingual team: +2 bonus pts

4. **Company Context (15 pts max)**
   - Tech/SaaS: 10 pts
   - Growth-stage (Series B+): +3 pts
   - International/remote culture: +2 pts

**MINIMUM THRESHOLD:** 50 points (must have language match + not USA-only)

---

## Output Format (Daily Dashboard)

### JSON Structure

```json
{
  "date": "2026-05-09",
  "source_summary": {
    "linkedin": 45,
    "remote_ok": 12,
    "google_jobs": 38,
    "wellfound": 8,
    "european_boards": 22,
    "total_before_filter": 125,
    "us_excluded": 8
  },
  "jobs": [
    {
      "id": "unique_id",
      "title": "Chief Revenue Officer",
      "company": "Company Name",
      "location": "Warsaw, Poland",
      "location_type": "On-site",
      "tier": "tier-1",
      "score": 92,
      "function": "Revenue",
      "seniority": "C-Level",
      "language": "English",
      "salary": "€120,000 - €150,000",
      "salary_currency": "EUR",
      "posted_date": "2026-05-07",
      "posted_display": "2 days ago",
      "summary": "2-3 sentence summary of role responsibilities",
      "match_reason": "Why this job appeared for Valentin",
      "source": "LinkedIn",
      "link": "https://url_to_posting"
    }
  ],
  "stats": {
    "total_found": 125,
    "total_qualified": 85,
    "high_matches_70plus": 12,
    "medium_matches_50_69": 34,
    "low_matches_30_49": 39,
    "avg_score": 67,
    "us_excluded": 8,
    "language_excluded": 2
  }
}
```

### Field Definitions

- **location_type**: "On-site" / "Hybrid" / "Remote"
- **location**: Full location (e.g., "Berlin, Germany", "Remote (EU)", "Warsaw, Poland")
- **salary**: String with range (e.g., "€120,000 - €150,000" or "Not specified")
- **salary_currency**: "EUR" / "GBP" / "USD" / empty if "Not specified"
- **posted_date**: ISO format (YYYY-MM-DD) for sorting
- **posted_display**: Human-readable (e.g., "2 days ago", "Posted: May 9, 2026")
- **link**: Full URL to job posting (clickable, goes directly to offer)

---

## Dashboard Display Requirements

Each job card must show:

1. **Job Title** + Company
2. **Score & Stars** (relevance rating)
3. **Location** with type (e.g., "Berlin, Germany - Hybrid")
4. **Salary Range** (if available) - e.g., "€120-150K" or "Not specified"
5. **Posted Date** - e.g., "2 days ago"
6. **Summary** (2-3 sentences)
7. **Match Reason** (why it was selected)
8. **Action Buttons:** "Deep Dive Analysis" (links to job-profile-analyzer), "Save", "View Posting" (direct link)

---

## Daily Update Schedule

**Run Time:** 8:00 AM Warsaw Time (daily)
**Duration:** ~2-5 minutes (depending on source load)
**Refresh Cadence:** Complete refresh (new jobs + re-ranking)

**Dashboard Updates:**
- New jobs appear at top (sorted by score)
- Jobs older than 30 days marked as "Stale" (likely filled)
- Minimum 10 new jobs daily (target: 15-25)

---

## Quality Gates

✅ **Must deliver:**
- Minimum 10 qualified jobs per day (score 50+)
- All jobs non-USA or explicitly "Remote - no US territory required"
- All jobs have language match (English, French, or Spanish)
- Salary range shown when available
- Posted date visible
- Direct link to job posting
- Location type specified (Remote/Hybrid/On-site)
- No duplicates across sources

✅ **Stats to track:**
- Total jobs found across sources
- US jobs excluded (count)
- Language-excluded jobs (count)
- High matches (70+), Medium (50-69), Low (30-49)
- Average score

---

## Notes

- Be respectful of rate limits (2-3 second delays between requests)
- Deduplicate jobs found on multiple sources (same job, count once)
- Focus on jobs posted in last 3-5 days
- If a job is older than 30 days, mark as "stale"
- Only include jobs that match seniority levels AND language requirements
- **US positions ONLY if explicitly "Remote - no US territory required"**
- Language requirement is a FILTER, not optional
