# Pivot — remote career pivot prototype

A web app that helps US adults (25–45) move into a remote career without quitting their job:
skill match → minimum skillset → 4-week sprint with free lessons, portfolio tasks reviewed by AI,
an AI mentor, remote job links and a readiness verdict.

## What is inside

```
index.html      the whole frontend (React + Tailwind from CDN, no build step)
lib/gemini.js   calls the Gemini API (shared by local server and Vercel)
api/ai.js       Vercel serverless function: POST /api/ai
server.js       local dev server, no npm packages needed
.env.example    copy to .env and put your key there
```

## Run locally (VS Code)

1. Install Node.js 18 or newer (https://nodejs.org).
2. Get a free Gemini API key in Google AI Studio: https://aistudio.google.com/apikey
3. Copy `.env.example` to `.env` and paste the key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. In the VS Code terminal:
   ```
   node server.js
   ```
5. Open http://localhost:3000 — the header badge shows **Live AI · Gemini**.

No key? The app still works: the badge shows **Offline AI** and reviews/mentor use built-in templates.

## Deploy (public link for the jury)

1. Push this folder to GitHub (`.env` is ignored by git, the key will not leak).
2. On https://vercel.com → Add New Project → import the repo → Deploy (no build settings needed).
3. Project → Settings → Environment Variables → add `GEMINI_API_KEY` → Redeploy.

## Where AI is used

| Feature | AI does | Code does |
|---|---|---|
| Skill match | writes the 2–3 sentence "Mentor's take" | computes the % match, gaps, salary comparison |
| Task review | feedback, strengths, improvements, resume bullets | rubric checks; grades the data-analyst dataset answers exactly |
| AI mentor | answers questions with the user's plan as context | — |
| Readiness verdict | — | formula over 4 pillars: skills, money, work fit, remote fit |

Final task score = 50% automatic checks + 50% AI score. Pass mark: 70.

## Pricing and paywall (test mode)

- **Free:** skill match, 4-module minimum skillset, week 1 lessons and task review, remote job links.
- **Sprint Pass, $49 per career sprint:** unlocks weeks 2–4, the AI mentor's full plan, portfolio bullets and the readiness verdict.
- Weeks 2–4 show a paywall. Checkout runs in **test mode**: use card `4242 4242 4242 4242`,
  any future expiry (e.g. `12/34`) and any CVC (e.g. `123`), or press "Fill test card".
  No real charge; card details stay in the browser. Production: replace with Stripe Checkout.

## For the jury: fastest path (2 minutes)

1. Open the site → **See a sample sprint** (Jessica, teacher → instructional designer, week 1 done).
2. Week 2 shows the paywall → **Get the Sprint Pass** → **Fill test card** → **Pay $49 (test)**.
3. Submit the week 2 task → **Submit for AI Review** → see the score, feedback and resume bullets.
4. Open **Ask mentor** (bottom right), then the **Readiness** and **My Portfolio** tabs.
5. Or press **Start over** and try your own job title.

## Notes

- Model: `gemini-2.5-flash` by default. If Google retires it, set `GEMINI_MODEL` in `.env`
  to a current model name from AI Studio (the server also retries with `gemini-flash-latest`).
- The free Gemini tier has rate limits, and Google may use free-tier prompts to improve its products.
  Fine for a demo; don't send real personal data.
- `/api/ai` is public: it is limited to 30 requests/minute per IP and 20k characters per request.
- Salary ranges and skill profiles are prototype estimates. Production version: import O*NET
  (skills, CC BY 4.0) and BLS OEWS (wages).

## Appendix (details behind the pitch deck)

The deck is limited to 10 slides, so the full numbers live here.

### A. Problem and user
| Figure | Value | Source |
|---|---|---|
| US workers who want to change careers this year | 43% | FlexJobs survey of 4,000+ workers, reported by Entrepreneur, Mar 2026 |
| Monthly quits rate, total nonfarm | 2.1% (Sept 2026) | BLS JOLTS news release, Nov 3, 2026 |
| Employed Americans aged 25–44 | 73.3M (36.3M aged 25–34 + 37.0M aged 35–44) | BLS CPS Table 3, 2025 annual averages |

Example user: Jessica, 34, elementary teacher, two kids, mortgage, wants a remote job.
Similar segments: retail and restaurant managers, support reps, admin assistants, healthcare workers, drivers.

### B. Market
| Layer | Value | How |
|---|---|---|
| TAM | 31.5M | 73.3M employed aged 25–44 × 43% who want a career change |
| SAM | ~3M | 10% of TAM who want to learn online and work remotely (assumption) |
| SOM, year 1 | 3,000 payers | ≈ $190k revenue at $64 LTV; at 2% conversion needs ~150k free users (assumption) |
| $100M a year | ≈ 1.06M payers × $94 | $64 sprint LTV + $30 assumed course-referral fee; 3.4% of TAM |

### C. Unit economics
| Metric | Value | Basis |
|---|---|---|
| Price | $49 per career sprint | Week 1 free |
| Free → paid conversion | 2% | RevenueCat State of Subscription Apps 2026: median download-to-paid 2.0% (D35, all apps) |
| Finish all 4 weeks | 45% | Assumption to test |
| Buy a second sprint | 30% | Assumption to test |
| LTV | $64 | 1.3 sprints × $49 |
| CAC, organic content | ~$8 | Assumption (TikTok, YouTube, r/teachers, r/careerguidance) |
| CAC, referrals / shareable match card | ~$5 | Assumption |
| CAC, paid social | ~$30 | $1.20 CPC ÷ 4% conversion (assumption) |
| Blended CAC target | ≤ $25 | LTV / CAC ≈ 2.5×; with $30 referral fee ≈ 3.7× |
| Year 1 | ≈ $75k spend for ≈ $190k revenue | 3,000 payers × $25 CAC / × $64 LTV |

### D. Risks and how we handle them
| Risk | Mitigation |
|---|---|
| AI grades wrongly | Half of every score comes from deterministic code checks; dataset answers are graded exactly |
| Verdict read as a guarantee | Shown as guidance, not a promise of a job; disclaimer in the footer |
| Skill and pay data are estimates | Next step: import O*NET (CC BY 4.0) and BLS OEWS |
| Free courses exist | We sell checked practice and a decision, not content |

### E. Sources
- BLS, Employed persons by age, 2025: https://www.bls.gov/cps/cpsaat03.htm
- BLS JOLTS, September 2026: https://www.bls.gov/news.release/archives/jolts_11032026.htm
- FlexJobs via Entrepreneur, Mar 2026: https://www.entrepreneur.com/business-news/43-of-workers-want-career-changes-but-most-wont-leave-jobs/503145
- RevenueCat, State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps-2026/
