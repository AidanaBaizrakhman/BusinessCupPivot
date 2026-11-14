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
