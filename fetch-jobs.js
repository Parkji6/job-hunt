#!/usr/bin/env node
/**
 * fetch-jobs.js — Real job discovery via Adzuna API
 *
 * Setup:
 *   1. Get a free API key at https://developer.adzuna.com/
 *   2. Copy .env.example → .env and fill in your credentials
 *   3. Run: npm run fetch
 */

const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────

const APP_ID  = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

if (!APP_ID || !APP_KEY) {
  console.error('\n❌  Missing credentials.\n');
  console.error('   1. Register free at https://developer.adzuna.com/');
  console.error('   2. Copy .env.example → .env and add your app_id / app_key\n');
  process.exit(1);
}

// Adzuna country codes to search. pl = Poland (tier-1), gb/nl/fr cover EU remote.
const COUNTRIES = ['pl', 'gb', 'nl', 'fr'];

// Short focused queries — Adzuna treats spaces as AND, so keep each query tight.
// Multiple entries per function area are intentional (each becomes a separate API call).
const SEARCHES = [
  // Revenue
  { fn: 'Revenue',    q: 'Chief Revenue Officer' },
  { fn: 'Revenue',    q: 'VP Revenue' },
  { fn: 'Revenue',    q: 'VP Sales' },
  { fn: 'Revenue',    q: 'VP Business Development' },
  { fn: 'Revenue',    q: 'Director of Sales' },
  // Product
  { fn: 'Product',    q: 'Chief Product Officer' },
  { fn: 'Product',    q: 'VP Product' },
  { fn: 'Product',    q: 'Director of Product' },
  { fn: 'Product',    q: 'Head of Product' },
  // Growth
  { fn: 'Growth',     q: 'VP Growth' },
  { fn: 'Growth',     q: 'Director of Growth' },
  { fn: 'Growth',     q: 'VP Growth Marketing' },
  { fn: 'Growth',     q: 'Head of Growth' },
  // Operations
  { fn: 'Operations', q: 'Chief Operating Officer' },
  { fn: 'Operations', q: 'VP Operations' },
  { fn: 'Operations', q: 'Chief of Staff' },
  { fn: 'Operations', q: 'VP Business Operations' },
  // Marketing — only GTM/commercial scope (filtered further below)
  { fn: 'Marketing',  q: 'Chief Marketing Officer' },
  { fn: 'Marketing',  q: 'VP Marketing' },
  // Ecommerce
  { fn: 'Ecommerce',  q: 'VP Ecommerce' },
  { fn: 'Ecommerce',  q: 'Director Ecommerce' },
  { fn: 'Ecommerce',  q: 'Head of Ecommerce' },
  { fn: 'Ecommerce',  q: 'VP Marketplace' },
  // CRM
  { fn: 'CRM',        q: 'VP CRM' },
  { fn: 'CRM',        q: 'Director CRM' },
  { fn: 'CRM',        q: 'VP Customer Success' },
  { fn: 'CRM',        q: 'Chief Customer Officer' },
];

const SCORE_THRESHOLD = 50;
const MAX_DAYS_OLD    = 10;
const RESULTS_PER_PAGE = 20;

// ─── Adzuna API ─────────────────────────────────────────────────────────────

async function adzunaSearch(query, country) {
  const params = new URLSearchParams({
    app_id:           APP_ID,
    app_key:          APP_KEY,
    what:             query,
    results_per_page: RESULTS_PER_PAGE,
    sort_by:          'date',
    max_days_old:     MAX_DAYS_OLD,
  });

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
  const res  = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Adzuna ${country} HTTP ${res.status}: ${body.slice(0, 120)}`);
  }

  return res.json();
}

// ─── Scoring ────────────────────────────────────────────────────────────────

function scoreJob(job) {
  const title = (job.title       || '').toLowerCase();
  const desc  = (job.description || '').toLowerCase();
  const loc   = (job.location?.display_name || '').toLowerCase();
  let score   = 0;

  // Function & Seniority (35 pts)
  if (/\b(chief|cro|cpo|cmo|coo|cgo)\b/.test(title)) {
    score += 35;
  } else if (/\bvp\b|vice\s+president/.test(title)) {
    score += 32;
  } else if (/\bdirector\b/.test(title)) {
    score += 28;
  } else if (/\bhead\s+of\b/.test(title)) {
    score += 25;
  } else {
    score += 10; // Manager / other — will usually be filtered by isRelevant()
  }

  // Location (30 pts)
  if (/warsaw|warszawa/.test(loc)) {
    score += 30; // Tier-1 best
  } else if (/poland|polska|kraków|krakow|wrocław|wroclaw|gdańsk|gdansk|pozna/.test(loc)) {
    score += 28; // Tier-1 Poland city
  } else if (/remote/.test(desc) && /europ|emea|\beu\b/.test(desc)) {
    score += 22; // EU remote
  } else if (/remote/.test(desc)) {
    score += 15; // Global remote
  } else {
    score += 20; // Europe on-site (Tier-2)
  }

  // Language (20 pts) — deduct if clearly Polish-only
  const polishOnly = /polish\s+required|fluent\s+polish|native\s+polish|język\s+polski/i.test(desc);
  if (!polishOnly) score += 20;

  // Company context (15 pts)
  if (/\b(saas|software|fintech|edtech|platform|digital|ai\b|startup|tech)\b/i.test(desc)) score += 10;
  if (/series\s+[a-c]|venture|funded|growth\s+stage/i.test(desc)) score += 3;
  if (/international|global|emea|europe/i.test(desc)) score += 2;

  return Math.min(score, 100);
}

// Detect job postings written in Polish by counting Polish-specific diacritics.
// English/French/Spanish don't use ą ę ó ś ź ż ć ń ł — if there are many, it's Polish.
function isPolishLanguagePosting(job) {
  const text = (job.title || '') + ' ' + (job.description || '');
  const polishChars = (text.match(/[ąęóśźżćńłĄĘÓŚŹŻĆŃŁ]/g) || []).length;
  return polishChars > 8;
}

function isRelevantTitle(title) {
  const t = title.toLowerCase();

  // Must include a seniority indicator
  const seniorOk = /\b(chief|vp|vice\s+president|director|head\s+of|cro|cpo|cmo|coo|cgo)\b/.test(t);
  if (!seniorOk) return false;

  // Exclude roles that accidentally match (engineering, finance, legal, HR, etc.)
  const exclude = [
    'engineer', 'developer', 'software', 'data scientist', 'data engineer',
    'accountant', 'finance director', 'financial director',
    'legal', 'compliance', 'hr director', 'people director', 'talent',
    'designer', 'creative director', 'art director',
    'medical', 'clinical', 'nursing',
    'assistant', 'coordinator', 'specialist', 'analyst', 'manager',
  ];
  return !exclude.some(k => t.includes(k));
}

function locationTier(job) {
  const loc  = (job.location?.display_name || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  if (/warsaw|warszawa|poland|polska/.test(loc))           return 'tier-1';
  if (/remote/.test(desc) && /europ|emea|\beu\b/.test(desc)) return 'tier-2';
  if (/remote/.test(desc))                                 return 'tier-3';
  return 'tier-2';
}

function locationType(job) {
  const combined = ((job.title || '') + ' ' + (job.description || '')).toLowerCase();
  if (/\bhybrid\b/.test(combined))      return 'Hybrid';
  if (/\bremote\b/.test(combined))      return 'Remote';
  return 'On-site';
}

function seniority(title) {
  const t = title.toLowerCase();
  if (/\b(chief|cro|cpo|cmo|coo|cgo)\b/.test(t)) return 'C-Level';
  if (/\bvp\b|vice\s+president/.test(t))          return 'VP';
  if (/\bdirector\b/.test(t))                     return 'Director';
  return 'Head';
}

function postedDisplay(isoDate) {
  if (!isoDate) return 'Recently';
  const days = Math.round((Date.now() - new Date(isoDate)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function formatSalary(job) {
  const min = job.salary_min;
  const max = job.salary_max;
  if (!min && !max) return 'Not specified';
  const sym = { EUR: '€', GBP: '£', USD: '$' }[job.salary_currency_code] || '';
  const fmt = n => `${Math.round(n / 1000)}k`;
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (max)        return `Up to ${sym}${fmt(max)}`;
  return `${sym}${fmt(min)}+`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n🔍 Job Discovery — ${today}`);
  console.log('─'.repeat(52));

  const seen    = new Set();
  const newJobs = [];
  let   errors  = 0;

  for (const { fn, q } of SEARCHES) {
    for (const country of COUNTRIES) {
      process.stdout.write(`  ${fn.padEnd(12)} [${country.toUpperCase()}]  `);

      try {
        const data    = await adzunaSearch(q, country);
        const results = data.results || [];
        let   added   = 0;

        for (const job of results) {
          // Skip if no real link or already seen
          if (!job.redirect_url)      continue;
          if (seen.has(job.id))       continue;
          if (!isRelevantTitle(job.title)) continue;

          // Skip Polish-language postings (you don't speak Polish)
          if (isPolishLanguagePosting(job)) continue;

          const loc  = (job.location?.display_name || '').toLowerCase();
          const desc = (job.description || '').toLowerCase();
          const titleLower = (job.title || '').toLowerCase();

          // Skip USA-based unless explicitly remote worldwide
          if (/united states|,\s*us$|\busa\b/.test(loc) && !/remote.*worldwide|no.*us.*territory/i.test(desc)) continue;

          // Skip fully on-site roles outside Poland (config: auto-exclude without remote/hybrid option)
          const isPoland      = /poland|polska|warsaw|warszawa|kraków|krakow|wrocław|wroclaw|gdańsk|gdansk|pozna/i.test(loc);
          const hasFlexibility = /remote|hybrid/i.test(desc + ' ' + titleLower);
          if (!isPoland && !hasFlexibility) continue;

          // Marketing: only include roles with GTM/commercial/growth scope (not pure brand/comms)
          if (fn === 'Marketing' && !/gtm|go.to.market|demand gen|revenue|growth|commercial|b2b|acquisition/i.test(desc)) continue;

          const score = scoreJob(job);
          if (score < SCORE_THRESHOLD) continue;

          seen.add(job.id);
          added++;

          newJobs.push({
            id:            `adzuna_${job.id}`,
            title:         job.title,
            company:       job.company?.display_name || 'Unknown',
            location:      job.location?.display_name || 'Unknown',
            location_type: locationType(job),
            tier:          locationTier(job),
            score,
            function:      fn,
            seniority:     seniority(job.title),
            language:      'English',
            salary:        formatSalary(job),
            posted_date:   (job.created || today).split('T')[0],
            posted_display: postedDisplay(job.created),
            summary:       (job.description || '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim()
                             .slice(0, 320) + '…',
            match_reason:  `${fn} — ${seniority(job.title)} | Score ${score}/100`,
            source:        'Adzuna',
            link:          job.redirect_url,   // ← real URL to original posting
            fetch_date:    today,
          });
        }

        console.log(`${results.length} found → ${added} qualified`);
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
        errors++;
      }

      // Gentle rate-limit pause (Adzuna free tier: 1000 req/day)
      await new Promise(r => setTimeout(r, 250));
    }
  }

  // ─── Write today's jobs only ─────────────────────────────────────────────

  const jsonPath = path.join(__dirname, 'public', 'jobs-data.json');
  const jsPath   = path.join(__dirname, 'public', 'jobs-data.js');

  newJobs.sort((a, b) => b.score - a.score);

  const output = {
    metadata: {
      last_updated:       new Date().toISOString(),
      today,
      total_jobs:         newJobs.length,
      sources_used:       ['Adzuna'],
      countries_searched: COUNTRIES,
    },
    jobs: newJobs,
  };

  // Write JSON (for Vercel hosting)
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  // Write JS (for opening index.html directly as a local file)
  fs.writeFileSync(jsPath, `window.JOBS_DATA = ${JSON.stringify(output, null, 2)};`);

  // ─── Summary ─────────────────────────────────────────────────────────────

  console.log('\n' + '─'.repeat(52));
  if (errors > 0) console.log(`⚠️  ${errors} search(es) failed — check your API key`);
  console.log(`✅  ${newJobs.length} new qualified jobs found today`);
  console.log(`📊  ${allJobs.length} total jobs in dashboard\n`);

  if (newJobs.length > 0) {
    const top5 = [...newJobs].sort((a, b) => b.score - a.score).slice(0, 5);
    console.log('🏆  Top picks:');
    top5.forEach((j, i) =>
      console.log(`  ${i + 1}. [${j.score}] ${j.title} @ ${j.company} — ${j.location}`)
    );
    console.log();
  }

  console.log(`💾  Saved → public/jobs-data.json`);
  console.log(`🌐  Open public/index.html in a browser to view\n`);
}

run().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
