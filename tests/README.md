# JAMB Quiz - Test Documentation

This directory contains unit tests for the JAMB Quiz application modules.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Setup

1. Install dependencies:

```bash
npm init -y
npm install --save-dev jest jsdom
```

2. Add test script to `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "testEnvironment": "node",
    "verbose": true
  }
}
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test file

```bash
npm test -- utils.test.js
npm test -- state.test.js
npm test -- points.test.js
```

### Run with coverage

```bash
npm test -- --coverage
```

### Run in watch mode

```bash
npm test -- --watch
```

## Test Files

### `utils.test.js`
Tests for utility functions in `js/utils.js`:
- `todayKey()` - Date formatting
- `isToday()` - Check if task claimed today
- `markToday()` - Mark task as claimed
- `shuffleArray()` - Array shuffling
- `shuffleQuestion()` - Question option shuffling
- `formatTime()` - Time formatting (seconds to MM:SS)
- `showToast()` - Toast notification display
- DOM helpers: `$`, `getAll`, `createEl`

### `state.test.js`
Tests for state management in `js/state.js`:
- Configuration (POINTS, QUIZ settings)
- User state (userId)
- Unlock state
- Points state (points, earned, spent)
- Referral state (referralCount, referralUsed, newbieBonusClaimed)
- Question bank state
- Subject selection state (selectedSubjects Set operations)
- Quiz state
- Daily state (lastTopUpTime)

### `points.test.js`
Tests for points system in `js/points.js`:
- Getting points (getPoints, getEarned, getSpent)
- Adding points (addPoints, addEarned, addSpent)
- Deducting points (deductPoints)
- Setting points (setPoints)
- UI updates (updateUI, updateStartButtonState)

## Test Environment

Tests use:
- **Jest** - Testing framework
- **jsdom** - DOM simulation for browser-like environment
- **Mock localStorage** - In-memory storage for testing persistence

## Writing New Tests

1. Create a new test file: `tests/yourmodule.test.js`
2. Set up JSDOM environment at top of file
3. Import required modules in dependency order
4. Use `describe()` for test suites and `it()` for individual tests
5. Use `beforeEach()` for setup and `afterEach()` for cleanup

Example:

```javascript
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { /* mock */ };

const YourModule = require('../js/yourmodule.js');

describe('YourModule', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  it('should do something', function() {
    expect(YourModule.someFunction()).toBe(expectedValue);
  });
});
```

## Common Test Patterns

### Testing state changes
```javascript
it('should update state correctly', function() {
  JAMB_STATE.setPoints(100);
  expect(JAMB_STATE.getPoints()).toBe(100);
  expect(localStorage.getItem('jamb_points')).toBe('100');
});
```

### Testing DOM updates
```javascript
it('should update DOM element', function() {
  JAMB_POINTS.updateUI();
  expect(document.getElementById('pointsValue').textContent).toBe('100');
});
```

### Testing edge cases
```javascript
it('should handle empty array', function() {
  const result = JAMB_UTILS.shuffleArray([]);
  expect(result).toEqual([]);
});
```
