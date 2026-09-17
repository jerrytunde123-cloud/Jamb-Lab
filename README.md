# JAMB Lab

A browser-based UTME/JAMB practice quiz for Nigerian students.

- **Subject quizzes** from a 2,300-question bank (33 subjects)
- **Timed sessions** — 20 questions, 25 minutes, split equally across selected subjects
- **Question images** for diagram questions
- **Points** to start a quiz, earned from channels, daily shares, referrals, and quiz scores
- **Unlock** by joining the WhatsApp and Telegram channels
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
│   ├── unlock.js       # WhatsApp + Telegram unlock
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

## Points Flow

- **Initial balance**: 0 points for new users.
- **Earning points**: Users earn **+10 points** each time they share (Friends, Groups, Class, or Invite link). Points are only earned from sharing, not from exams.
- **Starting an exam**: Costs **5 points** per selected subject. Points are deducted upon starting the exam and refreshed to 0 / spent balance.
- **Exam completion**: Exams do **not** award points. Once points are used up to take the exam, users must share again to earn points for their next quiz.
- **Invite welcome**: A friend who opens an invite link receives a +10 pt welcome bonus to try their first quiz.

## Tests

```bash
git add .
git commit -m "Add buy points + PIN activation + daily reset + JAMB assistance card"
git push
npm install
npm test
```

## Author

Jerry / Newton — JAMB prep tool for Nigerian students.
