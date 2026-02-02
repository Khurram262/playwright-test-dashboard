# User Guide - Playwright Test Dashboard

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Running Tests](#running-tests)
4. [Viewing Test Results](#viewing-test-results)
5. [AI-Powered Analysis](#ai-powered-analysis)
6. [Live Test Monitoring](#live-test-monitoring)
7. [Managing Test Runs](#managing-test-runs)
8. [Advanced Features](#advanced-features)
9. [Tips & Tricks](#tips--tricks)
10. [Troubleshooting](#troubleshooting)

---


## Getting Started

### First Time Setup

1. **Start the servers**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run server
   ```

2. **Open the dashboard**
   - Navigate to http://localhost:3000
   - You'll see an empty state if no tests have been run

3. **Run your first tests**
   - Click the "Run All Tests" button in the header
   - Or run tests manually: `npm run test:e2e`

### Understanding the Interface

The dashboard has three main sections:
- **Header** - Navigation, actions, and status
- **Summary Cards** - Quick overview of test metrics
- **Test History** - Detailed list of all test runs

---

## Dashboard Overview

### Header Components

#### Left Side
- **Logo & Title** - Click to return to home
- **Status Indicator** - Shows "Running" or "Ready"
  - 🟢 Green dot = Tests running
  - ⚪ Gray dot = Ready to run

#### Right Side
- **Search** (⌘K) - Quick search for tests
- **Notifications** - Enable browser notifications
- **Live View Toggle** - Show/hide live test monitoring
- **Theme Switcher** - Toggle dark/light mode
- **Run All Tests** - Execute all tests
- **Export** - Download test data as JSON

### Summary Cards

The dashboard displays 6 key metrics:

1. **Total Tests** - Total number of tests executed
2. **Pass Rate** - Percentage of passing tests
3. **Failure Rate** - Percentage of failing tests
4. **Average Duration** - Mean test execution time
5. **Flaky Tests** - Tests with inconsistent results
6. **Last Run** - Time since last test execution

Each card includes:
- Large metric number
- Trend indicator (↑ or ↓)
- Percentage change from previous run
- Mini chart showing historical trend

---

## Running Tests

### Method 1: Dashboard Button

1. Click **"Run All Tests"** in the header
2. Watch the status indicator turn green
3. See live updates in the Live Test View
4. Results appear automatically when complete

### Method 2: Command Line

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests with JSON reporter
npx playwright test --reporter=json,line > public/report.json
```

### Method 3: Rerun Failed Tests

1. Navigate to a test run with failures
2. Click on a failed test to expand
3. Go to "Analysis & Actions" tab
4. Click **"Rerun Test"**

### Stopping Tests

If tests are running and you need to stop:
1. Click the **Stop** button (red square icon)
2. Current test will complete
3. Remaining tests will be cancelled

---

## Viewing Test Results

### Test History Table

The main table shows all test runs with:
- **Run ID** - Unique identifier (first 8 chars)
- **Executed** - Date and time of execution
- **Total** - Total number of tests
- **Passed** - Number of passing tests (green)
- **Failed** - Number of failing tests (red)
- **Skipped** - Number of skipped tests (yellow)
- **Interrupted** - Number of interrupted tests (gray)
- **Flaky** - Number of flaky tests (orange)
- **Actions** - "Details" button to view full report

### Pagination

Navigate large datasets:
- **Show** dropdown - Select rows per page (10, 25, 50, 100)
- **Page info** - Current page and total pages
- **Navigation** - Previous/Next buttons

### Viewing Test Run Details

Click **"Details"** on any run to see:

#### 1. Report Header
- Run metadata (ID, date, duration)
- Browser information
- Summary statistics
- Export button

#### 2. Summary Chart
- Pie chart of test status distribution
- Color-coded segments
- Hover for details

#### 3. Test Details Accordion
Each test shows:
- **Status icon** - Visual indicator
- **Test name** - Full test title
- **Duration** - Execution time
- **Flaky badge** - If test is flaky
- **Quick rerun** - Hover to see rerun button

Expand a test to see:
- **Details tab** - Location, error message
- **Analysis & Actions tab** - AI analysis, rerun, copy commands
- **Attachments tab** - Screenshots, videos

---

## AI-Powered Analysis

### Batch Analysis (All Failures)

1. Scroll to **"AI-Powered Insights"** section
2. Click **"Analyze Failures"** button
3. Wait for AI to process (usually 5-10 seconds)
4. View results in three tabs:

#### Patterns Tab
Shows detected failure patterns:
- Timeout Issues
- Selector Problems
- Network Failures
- Assertion Failures

Each pattern includes:
- Severity badge (high/medium/low)
- Number of affected tests
- List of affected test names

#### AI Deep Dive Tab
Comprehensive analysis:
- Root cause analysis
- Common themes
- Detailed explanations
- Markdown-formatted results

#### Suggestions Tab
Actionable recommendations:
- Specific fixes for each pattern
- Code examples
- Best practices
- Prevention strategies

### Individual Test Analysis

1. Click on a failed test
2. Go to **"Analysis & Actions"** tab
3. Click **"Analyze with AI"**
4. View AI analysis dialog with:
   - **AI Suggestions** - Intelligent insights
   - **Original Error Log** - Full stack trace
   - **Copy buttons** - Copy analysis or log
   - **Create Issue** - Generate issue from analysis

### Understanding AI Results

The AI provides:
- **Root Cause** - Why the test failed
- **Explanation** - What went wrong
- **Recommendations** - How to fix it
- **Code Examples** - Specific code changes

Example AI output:
```markdown
### Root Cause: Selector Timeout

The test failed because the element with selector 
`.login-button` was not found within the 5000ms timeout.

### Likely Reasons:
1. Element takes longer to load
2. Selector is incorrect
3. Element is dynamically generated

### Recommendations:
1. Increase timeout: `await page.waitForSelector('.login-button', { timeout: 10000 })`
2. Use data-testid: `<button data-testid="login-btn">`
3. Wait for network idle: `await page.waitForLoadState('networkidle')`
```

---

## Live Test Monitoring

### Enabling Live View

1. Click **"Show Live View"** in header
2. Live Test View card appears at top
3. Updates in real-time via Server-Sent Events

### Live View Features

The live view shows:
- **Current Status** - Running or Idle
- **Current Test** - Test being executed
- **Counters** - Passed, Failed, Skipped counts
- **Duration** - Time elapsed
- **Clear Button** - Reset live state

### Real-Time Updates

Watch as tests execute:
- Test name updates as each test starts
- Counters increment as tests complete
- Status changes from "Running" to "Idle"
- Duration updates every second

### Clearing Live State

Click **"Clear Live State"** to:
- Reset all counters to zero
- Clear current test name
- Reset duration
- Prepare for next run

---

## Managing Test Runs

### Exporting Data

#### Export All Runs
1. Click **"Export"** (download icon) in header
2. JSON file downloads automatically
3. Filename: `test-runs-export-{timestamp}.json`

#### Export Single Run
1. Open test run details
2. Click **"Export Report"** in header
3. JSON file downloads

### Importing Data

1. Click **"Paste Report"** button
2. Paste Playwright JSON report
3. Click **"Import Report"**
4. Data appears in dashboard

Supported formats:
- Playwright JSON reporter output
- Previously exported dashboard JSON
- Array of test runs

### Clearing Data

1. Click **"Clear All"** button
2. Confirm in dialog
3. All data removed from browser storage

**Warning:** This action cannot be undone. Export data first if needed.

### Filtering & Searching

#### Quick Search (⌘K)
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. Type test name
3. Select from results
4. Navigate directly to test

#### Table Filtering
- Use pagination controls
- Adjust rows per page
- Navigate between pages

---

## Advanced Features

### Browser Notifications

Enable notifications to get alerts about failures:

1. Click **bell icon** in header
2. Allow notifications in browser prompt
3. Receive alerts when tests fail

Notification includes:
- Number of failures
- Which runs have failures
- Click to open dashboard

### Creating Issues

Generate pre-filled issues for your tracker:

1. Expand a failed test
2. Go to "Analysis & Actions" tab
3. Click **"Create Issue"**
4. Select tracker (GitHub, Jira, ClickUp)
5. Review pre-filled content
6. Copy to your issue tracker

Issue template includes:
- Test name and location
- Error message
- Full error log
- Markdown formatting

### Copying Commands

Quick access to CLI commands:

1. Expand any test
2. Click **"Copy Command"**
3. Paste in terminal to run that specific test

Example copied command:
```bash
npx playwright test tests/login.spec.ts:15
```

### Copying Logs

Copy error logs for debugging:

1. Expand a failed test
2. Click **"Copy Log"**
3. Paste in your editor or chat

Logs are cleaned (ANSI codes removed) for readability.

### Flaky Test Detection

The dashboard automatically detects flaky tests:
- Tests that pass sometimes and fail sometimes
- Marked with orange "Flaky" badge
- Count shown in summary cards
- Helps identify unreliable tests

---

## Tips & Tricks

### Keyboard Shortcuts

- `⌘K` / `Ctrl+K` - Open search
- `Esc` - Close dialogs/search
- `Space` - Expand/collapse test (when focused)

### Performance Tips

1. **Pagination** - Use smaller page sizes for better performance
2. **Clear Old Data** - Regularly clear old test runs
3. **Export Important Runs** - Save critical runs before clearing
4. **Disable Live View** - If not needed, hide for better performance

### Best Practices

1. **Regular Cleanup**
   - Export monthly reports
   - Clear data older than 30 days
   - Keep only relevant runs

2. **AI Usage**
   - Use batch analysis for multiple failures
   - Review suggestions before implementing
   - Combine with manual debugging

3. **Monitoring**
   - Enable notifications for CI/CD
   - Check dashboard after each deployment
   - Track flaky tests over time

4. **Organization**
   - Use descriptive test names
   - Group related tests
   - Add meaningful error messages

### Dark Mode

Toggle between light and dark themes:
- Click **theme icon** in header
- Preference saved in browser
- Smooth transition animation

---

## Troubleshooting

### Tests Not Appearing

**Problem:** Tests run but don't show in dashboard

**Solutions:**
1. Check backend server is running (`npm run server`)
2. Verify `NEXT_PUBLIC_SERVER_URL` in `.env.local`
3. Check browser console for errors
4. Ensure JSON reporter is configured
5. Refresh the page

### AI Analysis Not Working

**Problem:** "Analyze with AI" button doesn't work

**Solutions:**
1. Check `GOOGLE_GENAI_API_KEY` is set
2. Verify API key is valid
3. Check network connectivity
4. Look for errors in browser console
5. Try again (may be rate limited)

### Live Tests Not Updating

**Problem:** Live view shows "Idle" when tests are running

**Solutions:**
1. Ensure backend server is running
2. Check SSE connection in Network tab
3. Verify server URL is correct
4. Click "Clear Live State" and try again
5. Restart both servers

### Slow Performance

**Problem:** Dashboard is slow or laggy

**Solutions:**
1. Reduce items per page
2. Clear old test runs
3. Disable live view if not needed
4. Close other browser tabs
5. Use a modern browser

### Export Not Working

**Problem:** Export button doesn't download file

**Solutions:**
1. Check browser download settings
2. Allow downloads from localhost
3. Try different browser
4. Check browser console for errors

### Search Not Finding Tests

**Problem:** ⌘K search doesn't show results

**Solutions:**
1. Ensure tests have been run
2. Check spelling of test name
3. Try partial match
4. Refresh the page
5. Clear browser cache

---

## Getting Help

### Resources

- **README.md** - Project overview and setup
- **API.md** - API documentation
- **This Guide** - User documentation

### Common Questions

**Q: How often does the dashboard update?**
A: Every 5 seconds via polling, or real-time via SSE for live tests.

**Q: Can I use this in CI/CD?**
A: Yes! Configure your pipeline to output JSON and the dashboard will pick it up.

**Q: Is my data secure?**
A: Data is stored locally in your browser. No data is sent to external servers except AI API calls.

**Q: Can I customize the dashboard?**
A: Yes! Edit the source code to customize colors, layout, and features.

**Q: How do I deploy to production?**
A: See the Deployment section in README.md

---

## Feedback & Support

Found a bug or have a suggestion?
- Create an issue in the repository
- Include steps to reproduce
- Add screenshots if applicable

---

**Happy Testing! 🎭✨**
