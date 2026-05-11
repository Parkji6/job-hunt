---
name: job-profile-analyzer
description: Comprehensive job fit analysis for applications and interviews. Use this skill whenever you're evaluating a job opportunity against your background — whether you're deciding to apply, preparing for an interview, or both. Provide a job posting URL and your resume/LinkedIn profile, and the skill will research the company, analyze the position, identify your strengths and gaps, suggest CV edits tailored to the role, and provide interview talking points. Useful for any stage of the job search process.
compatibility: 
  - WebSearch tool (optional, for company research)
  - WebFetch tool (for job posting extraction)
---

# Job Profile Analyzer Skill

## Overview

This skill helps you understand how your profile aligns with a job opportunity. It produces a comprehensive analysis that covers:
- **Company context** (mission, culture, recent developments) — optional, on-demand
- **Position scope** (key responsibilities, team structure, growth trajectory)
- **Your alignment** (strengths you bring, gaps to address, severity assessment)
- **CV suggestions** (tailored edits to match the job description)
- **Interview prep** (talking points, questions to prepare for, key narratives)

The skill works at any stage: pre-application to identify fit, or post-interview-invitation to prepare talking points.

---

## How to Use

### Input
Provide:
1. **Job posting URL** — the link to the job you're analyzing
2. **Your profile** — one of:
   - Say "use my stored profile" and the skill will reference your background from memory
   - Upload your resume file (PDF or Word doc)
   - Paste your LinkedIn profile or work history
   - Or provide a combination

If you have a stored profile and want to use it, just mention that; the skill will retrieve it from your saved profile (Valentin Houssais - CMO/Product-Led Growth specialist with 6+ years experience in growth strategy, product operations, and executive leadership).

### Output Format

The analysis includes:

**1. Company Overview** (optional; ask if you want it researched)
- Mission and business focus
- Culture signals
- Recent news or funding
- Market position or competitive landscape

**2. Position Scope**
- Core responsibilities
- Team structure and reporting line
- Growth/learning opportunities
- Success metrics or key outcomes

**3. Your Profile vs. This Position**
- **Strengths**: specific skills and experiences that align, with positioning tips (how to talk about these in your CV or interview)
- **Gaps**: missing or weak skills/experience, with severity levels (critical, important, nice-to-have)

**4. CV Suggestions**
A reworked version of your resume tailored to this job, with:
- Reordered bullet points (most relevant experience first)
- Rephrased achievements to match job language
- Highlighted quantifiable results that matter for this role
- Notes on what changed and why

**5. Interview Prep**
- **Key talking points**: stories or examples that demonstrate your fit
- **Questions to prepare for**: likely questions based on your gaps or the role
- **Questions to ask**: intelligent questions that show you understand the company and role
- **Red flags to watch for**: things that might signal bad fit

---

## Tips for Best Results

**On company research:** If you want the skill to research the company, explicitly ask for it (e.g., "Also research the company"). Without this request, the skill will focus only on the job posting itself, which saves time if you've already done your own research.

**On profile input:** If you have multiple resume variants tailored to different industries, upload the variant closest to this role. The skill will rewrite it further. If your LinkedIn profile is more detailed than your resume, include it — the skill uses both to get a fuller picture.

**On CV reworks:** The skill produces a new version of your resume. You don't have to use it wholesale — treat it as a starting point, pull suggestions you like, and adapt to your voice.

**On interview prep:** The talking points are based on your background and the job requirements. Customize them with specific examples from your work.

---

## Workflow

1. **Provide inputs**: Paste the job URL, upload your resume (or profile text), and clarify if you want company research.
2. **Specify your stage**: Mention if you're pre-application, post-interview-invitation, or both (determines which outputs matter most).
3. **Review the analysis**: Start with gaps and strengths to decide if the role is worth pursuing. If applying, use the CV suggestions. If interviewing, focus on prep.
4. **Iterate**: If you want to explore a different angle (e.g., "How would I position this gap in an interview?"), ask follow-up questions.

---

## What the Skill Does (and Doesn't)

**It does:**
- Extract and summarize job postings
- Research companies (on request) using web search
- Analyze gaps and strengths using your actual profile
- Produce a rewritten resume tailored to the role
- Create interview narratives and prep materials
- Surface potential red flags or fit issues

**It doesn't:**
- Make the decision for you (you decide if the role is right)
- Write cover letters (though the analysis informs them)
- Teach interview techniques (focuses on role-specific prep)
- Predict hiring outcomes

---

## Example Workflow

**User input:**
> I'm looking at a role for Senior Data Scientist at TechCorp. Here's the URL: [link]. I've attached my resume. I'm in early exploration mode — should I apply? Also, please research the company so I understand the context.

**Skill output:**
1. Company overview (mission, funding, recent hires in data, culture signals)
2. Position scope (team size, reporting to VP Analytics, growth path)
3. Your profile vs position:
   - **Strengths**: 5 years SQL and Python experience, built 3 ML models in production (position wants 3+ years)
   - **Gaps**: No experience with Spark (position requires it) — severity: important but learnable. No ML ops exposure (position mentions MLOps responsibilities) — severity: important.
4. Reworked resume: reordered to lead with ML modeling work, added quantifiable results from past projects
5. Interview prep: talking points on how you'd approach the MLOps gap, questions to ask about their data infrastructure

**User then decides:** "The gap on MLOps is bigger than I thought. Let me pass on this one, but I'll reach out to the hiring manager about future roles."

---

## Notes

- **Company research takes time** — if you want it, expect a longer analysis. You can always run a simpler version first (just position + profile analysis) and ask for company research later.
- **CV reworks are suggestions** — they're optimized for ATS and job description matching, but they should still sound like you. Personalize them.
- **Gaps don't mean "don't apply"** — some gaps are learnable; some roles are worth pursuing even with gaps. Use the severity rating to inform your decision.
