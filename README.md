# JAMB Lab

A browser-based UTME/JAMB practice quiz for Nigerian students.

- **Subject quizzes** from a 2,300-question bank (33 subjects)
- **Timed sessions** — 20 questions, 25 minutes, split equally across selected subjects
- **Question images** for diagram questions
- **Points** to start a quiz, earned from channels, daily shares, referrals, and quiz scores
- **Unlock** by joining two WhatsApp channels
- **Personal bests** stored per subject in `localStorage`

## Run it

The app is static. Serve the folder (fetch needs a real origin):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy the folder to Netlify, Vercel, or GitHub Pages.

### Vercel

This is a static site. `vercel.json` tells Vercel not to run npm, not to use a framework, and to publish the repo root (not `assets/`). Push to GitHub and Vercel will redeploy.

In the Vercel project settings, confirm:

- Framework Preset: **Other**
- Root Directory: **empty** (the repo root)
- Output Directory: **`.`**
- Install Command: **empty**
- Build Command: **empty**

## Layout

```
Jamb-Lab/
├── index.html
├── css/app.css
├── js/
│   ├── state.js        # config + in-memory state
│   ├── utils.js        # dates, shuffle, toast, DOM helpers
│   ├── points.js       # balance, spend, start-button, daily top-up
│   ├── referrals.js    # user id + welcome bonus for ?ref=
│   ├── unlock.js       # two WhatsApp channels
│   ├── history.js      # best scores per subject
│   ├── questions.js    # subject grid + quiz engine
│   └── main.js         # wires the UI
├── assets/
│   ├── favicon.svg
│   └── images/         # diagrams referenced by question-bank.json
├── question-bank.json
├── tests/
└── vercel.json
```

## Points

| Action | Amount |
|---|---|
| Join both unlock channels (once) | +15 |
| JAMB Telegram / WAEC / JAMB tutorial / Facebook | +15 / +10 / +10 / +5 (once each) |
| Daily share (friends, groups, class) | +10 each, resets daily |
| Friend opens your invite link | +10 welcome bonus for them |
| Start a quiz | −5 per selected subject |
| Correct / wrong answer | +10 / −5 |
| Answered every question | +20 |
| Perfect score | +50 |
| Daily top-up if under 5 pts | +10 |

All of this is stored in `localStorage` on the device. There is no backend, so a referrer cannot be credited on someone else's phone.

## Tests

```bash
npm install
npm test
```

## Author

Jerry / Newton — JAMB prep tool for Nigerian students.
