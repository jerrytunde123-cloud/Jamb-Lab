# JAMB Quiz App

A comprehensive UTME/JAMB practice quiz application for Nigerian students. This modular JavaScript application provides subject-specific quizzes with timed sessions, points-based rewards, and progress tracking.

## Project Overview

JAMB Quiz App is a browser-based quiz platform designed to help Nigerian students prepare for their UTME/JAMB examinations. The app features:

- **Subject-specific quizzes** across multiple academic subjects
- **Timed quiz sessions** (25 minutes for 20 questions)
- **Points-based reward system** for engagement and achievements
- **Referral system** to earn bonus points
- **Daily tasks** for consistent practice rewards
- **Channel unlock mechanism** (Telegram + WhatsApp)

## File Structure

```
Jamb-Lab/
├── index.html              # Main HTML structure
├── question-bank.json      # Question database (4000+ questions)
├── js/
│   ├── state.js           # Application state management
│   ├── utils.js           # Utility functions
│   ├── points.js          # Points system
│   ├── referrals.js       # Referral system
│   ├── unlock.js          # Channel unlock system
│   ├── daily.js           # Daily tasks system
│   ├── subjects.js        # Subject selection & question bank
│   ├── quiz.js            # Quiz engine
│   └── main.js            # Application entry point
├── tests/
│   ├── utils.test.js      # Tests for utility functions
│   ├── state.test.js      # Tests for state management
│   ├── points.test.js     # Tests for points system
│   └── README.md          # Test documentation
└── README.md              # This file
```

## Module Descriptions

### `js/state.js` - Application State
Central state management module using the module pattern. Stores:
- User credentials and unlock status
- Points (current, earned, spent)
- Referral information
- Question bank data
- Selected subjects
- Current quiz state
- Daily task timestamps

### `js/utils.js` - Utility Functions
Common helper functions used across the application:
- `todayKey()` - Get today's date as YYYY-MM-DD string
- `isToday(key)` - Check if a task was claimed today
- `markToday(key)` - Mark a task as claimed today
- `shuffleArray(arr)` - Fisher-Yates array shuffle
- `shuffleQuestion(q)` - Shuffle question options and update correct index
- `formatTime(seconds)` - Format seconds to MM:SS
- `showToast(message, color)` - Display notification toast
- DOM helpers: `$`, `getAll`, `createEl`

### `js/points.js` - Points System
Manages the points economy:
- Track current points balance
- Track total earned and spent
- Add/deduct points with localStorage persistence
- Update UI displays
- Manage start quiz button state based on points and selection

### `js/referrals.js` - Referral System
Handles user identification and referral tracking:
- Generate unique user IDs
- Build referral links
- Handle incoming referral parameters
- Award newbie bonuses
- Prevent duplicate referral claims

### `js/unlock.js` - Unlock System
Manages app access through channel verification:
- Check Telegram and WhatsApp channel join status
- Update unlock UI (show/hide lock screen)
- Mark channels as joined
- Award channel join bonuses

### `js/daily.js` - Daily Tasks
Daily engagement tasks and streak system:
- Refresh daily task UI
- Claim daily tasks (tutorial, share, follow)
- Daily top-up streak bonus (30-day intervals)
- Prevent double-claiming

### `js/subjects.js` - Subject Selection
Subject grid and question bank management:
- `getSubjectName(key)` - Get display name for subject
- `getSubjectIcon(key)` - Get Font Awesome icon class
- `loadQuestionBank()` - Fetch and load question-bank.json
- `renderSubjectGrid()` - Display selectable subject buttons
- `selectSubject(key, name)` - Toggle subject selection
- `updateSubjectUI()` - Update selection count and cost
- `generateQuizQuestions(subjectKeys)` - Generate random quiz questions

### `js/quiz.js` - Quiz Engine
Core quiz functionality:
- `startQuiz(subjectKeys)` - Initialize quiz with selected subjects
- `beginQuiz(subjects)` - Start quiz UI and timer
- `startTimer()` / `updateTimerDisplay()` - Timer management
- `formatTime(totalSeconds)` - Time formatting utility
- `renderQuestion()` - Display current question with options
- `selectOption(index)` - Select answer for current question
- `nextQuestion()` / `prevQuestion()` - Navigation
- `finishQuiz()` - End quiz, calculate results
- `calculateScore()` - Compute score, percentage, points earned
- `showResults(results)` - Display results screen
- `restartQuiz()` - Reset to main screen

### `js/main.js` - Application Entry Point
Main initialization and event handling:
- Initialize all modules in correct dependency order
- Set up event listeners for all buttons
- Handle app startup sequence
- Coordinate between modules

## How to Run the App

### Local Development

1. Serve the files using a local server (required for fetch API):

```bash
# Using Python 3
cd /path/to/Jamb-Lab
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000

# Or using PHP
php -S localhost:8000
```

2. Open in browser:
   - `http://localhost:8000`

### Production Deployment

Simply upload all files to any static web hosting:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## How to Run Tests

### Prerequisites

Node.js v14+ and npm installed.

### Setup

```bash
cd /path/to/Jamb-Lab
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npm test -- utils.test.js
npm test -- state.test.js
npm test -- points.test.js
```

### Test with Coverage

```bash
npm test -- --coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Configuration

Key configuration values (in `js/state.js`):

```javascript
const CONFIG = {
  POINTS: {
    UNLOCK_BONUS: 15,
    TG_CHANNEL_BONUS: 15,
    WAEC_CHANNEL_BONUS: 10,
    JAMB_TUTORIAL_BONUS: 10,
    FACEBOOK_BONUS: 5,
    SHARE_REWARD: 10,
    REFERRAL_REWARD: 10,
    QUIZ_COST: 5,
    DAILY_TOPUP: 10,
    MIN_TO_TOPUP: 5
  },
  QUIZ: {
    LENGTH: 20,        // Questions per quiz
    TIME: 25 * 60,     // 25 minutes in seconds
    MAX_SUBJECTS: 4    // Max subjects per quiz
  }
};
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- Requires JavaScript enabled
- Requires localStorage support

## Data Storage

All data is stored locally in `localStorage`:

| Key | Description |
|-----|-------------|
| `jamb_points` | Current points balance |
| `jamb_earned` | Total points earned |
| `jamb_spent` | Total points spent |
| `jamb_uid` | User unique ID |
| `jamb_tg` | Telegram join status |
| `jamb_wa` | WhatsApp join status |
| `jamb_ref_used` | Used referral code |
| `jamb_ref_count` | Referral count |
| `jamb_daily_*` | Daily task completion dates |
| `jamb_daily_topup` | Last top-up timestamp |

## License

This project is open source. See the original repository for license details.

## Author

Developed by Jerry/Newton - A JAMB preparation tool for Nigerian students.
