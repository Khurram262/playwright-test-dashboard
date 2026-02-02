# Playwright Test Dashboard

A modern, feature-rich web dashboard for visualizing and analyzing Playwright test results with AI-powered insights, real-time monitoring, and comprehensive test management capabilities.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)
![React](https://img.shields.io/badge/React-19.2.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Dashboard Features](#dashboard-features)
- [AI-Powered Analysis](#ai-powered-analysis)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 📊 **Visual Test Reports** - Beautiful, interactive charts and graphs for test results
- 🤖 **AI-Powered Insights** - Intelligent failure analysis using Google Gemini AI
- 🔴 **Live Test Monitoring** - Real-time test execution tracking with Server-Sent Events (SSE)
- 📈 **Historical Trends** - Track test performance over time
- 🎯 **Flaky Test Detection** - Automatically identify unreliable tests
- 🌓 **Dark/Light Mode** - Fully themed interface with smooth transitions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 💾 **Local Storage** - Persist test data in browser
- 📤 **Export/Import** - Export test runs as JSON for backup or sharing

### Advanced Features
- 🔍 **Smart Search** - Quick command menu (⌘K) to find tests instantly
- 🎨 **Premium UI** - Glassmorphism design with smooth animations
- 📊 **Multiple Chart Types** - Pie charts, bar charts, and trend lines
- 🔔 **Browser Notifications** - Get alerted about test failures
- ♻️ **Test Rerun** - Rerun individual tests or entire suites
- 🎫 **Issue Creation** - Pre-filled issue templates for GitHub, Jira, ClickUp
- 📋 **Detailed Logs** - View full error logs and stack traces
- 🖼️ **Screenshot Support** - View test failure screenshots and videos
- 📄 **Pagination** - Efficient handling of large test datasets

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.9 (App Router)
- **UI Library:** React 19.2.1
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.4.1
- **Components:** Radix UI primitives
- **Charts:** Recharts 2.15.1
- **Animations:** Framer Motion 12.24.12
- **Icons:** Lucide React

### Backend & AI
- **AI Framework:** Google Genkit 1.20.0
- **AI Model:** Google Gemini (via @genkit-ai/google-genai)
- **Server:** Node.js with Express (custom server)
- **Real-time:** Server-Sent Events (SSE)

### Testing
- **Test Framework:** Playwright 1.45.3
- **Test Runner:** Playwright Test Runner

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Playwright test project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright-test-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SERVER_URL=http://localhost:3001
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   ```

   Get your Google Gemini API key from: https://aistudio.google.com/app/apikey

4. **Start the development server**
   
   You need to run two servers:
   
   ```bash
   # Terminal 1 - Start the Next.js frontend
   npm run dev
   
   # Terminal 2 - Start the backend server
   npm run server
   ```

5. **Access the dashboard**
   
   Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📖 Usage

### Running Tests

1. **Run all tests**
   ```bash
   npm run test:e2e
   ```

2. **Run tests with JSON reporter**
   ```bash
   npx playwright test --reporter=json,line > public/report.json
   ```

### Viewing Results

The dashboard automatically picks up test results from:
- The backend server (polling every 5 seconds)
- Local storage (persisted data)
- Manual JSON import

### Manual Import

1. Click the "Paste Report" button in the header
2. Paste your Playwright JSON report
3. Click "Import Report"

## 🎯 Dashboard Features

### 1. **Main Dashboard**

The home page displays:
- **Overall Summary Cards**
  - Total tests, pass rate, failure rate
  - Average duration, flaky tests count
  - Historical trend charts

- **Test History Table**
  - Paginated list of all test runs
  - Status badges (Passed, Failed, Skipped, Interrupted)
  - Quick actions (View details, Export)

- **AI-Powered Insights**
  - Automatic failure pattern detection
  - Smart recommendations
  - Batch analysis of multiple failures

### 2. **Live Test View**

Real-time monitoring of test execution:
- Live status updates via SSE
- Current test being executed
- Pass/Fail counters
- Duration tracking
- Clear button to reset state

### 3. **Test Run Details**

Click on any test run to view:
- **Report Header**
  - Run metadata (date, duration, browser)
  - Summary statistics
  - Export options

- **Summary Charts**
  - Pie chart of test status distribution
  - Visual breakdown of results

- **Test Details**
  - Expandable accordion for each test
  - Error messages and stack traces
  - Test location and metadata
  - Attachments (screenshots, videos)

### 4. **Individual Test Actions**

For each test, you can:
- **Rerun Test** - Execute a single test again
- **Analyze with AI** - Get AI-powered failure insights
- **Copy Command** - Get the CLI command to run the test
- **Copy Log** - Copy error logs to clipboard
- **Create Issue** - Generate pre-filled issue for your tracker

### 5. **AI Analysis Dialog**

When analyzing a test failure:
- **AI Suggestions** - Intelligent analysis of the error
- **Root Cause** - Likely reasons for failure
- **Fix Recommendations** - Actionable steps to resolve
- **Original Error Log** - Full stack trace with ANSI stripping
- **Copy Results** - Copy analysis to clipboard
- **Create Issue** - Generate issue from analysis

## 🤖 AI-Powered Analysis

### Features

1. **Batch Analysis**
   - Analyze multiple test failures at once
   - Identify common patterns
   - Group similar failures
   - Prioritize by severity

2. **Pattern Detection**
   - Timeout issues
   - Selector problems
   - Network failures
   - Assertion errors

3. **Smart Insights**
   - Failure rate analysis
   - Flakiness detection
   - Performance trends
   - Stability metrics

4. **Recommendations**
   - Specific fixes for each pattern
   - Best practices
   - Code examples
   - Prevention strategies

### How It Works

The AI analysis uses Google Gemini to:
1. Parse error logs and stack traces
2. Identify error patterns
3. Generate human-readable explanations
4. Suggest actionable fixes

Example AI prompt flow:
```typescript
const result = await analyzeTestFailureLogs({
  errorLog: test.errorLog
});
// Returns structured analysis with reasons and suggestions
```

## 🔌 API Endpoints

The backend server (`server/server.js`) provides:

### Test Execution
- `POST /api/run-all-tests` - Run all Playwright tests
- `POST /api/rerun-test` - Rerun a specific test
- `POST /api/stop-run` - Stop current test execution

### Data Retrieval
- `GET /api/runs` - Get all test runs
- `GET /api/live-tests` - SSE endpoint for live test updates

### Example Request
```javascript
// Rerun a specific test
fetch('http://localhost:3001/api/rerun-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file: 'tests/example.spec.ts',
    title: 'should pass'
  })
});
```

## ⚙️ Configuration

### Next.js Configuration

The `next.config.ts` includes:
- Turbopack for faster development
- Image optimization settings
- Environment variable handling

### Playwright Configuration

The `playwright.config.ts` includes:
- Multiple browsers (Chromium, Firefox, WebKit)
- Parallel execution
- Retry logic
- Screenshot/video on failure
- JSON reporter output

### Tailwind Configuration

Custom theme with:
- Glassmorphism utilities
- Custom color palette
- Dark mode support
- Animation utilities

## 📁 Project Structure

```
playwright-test-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main dashboard
│   │   ├── run/[id]/page.tsx  # Test run details
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ai-insights.tsx    # AI analysis component
│   │   ├── live-test-view.tsx # Real-time monitoring
│   │   ├── overall-summary.tsx # Summary cards & charts
│   │   ├── test-details.tsx   # Test accordion
│   │   ├── report-header.tsx  # Run metadata
│   │   ├── report-summary-chart.tsx # Charts
│   │   ├── command-menu.tsx   # Search (⌘K)
│   │   ├── theme-switcher.tsx # Dark/light toggle
│   │   └── ui/               # Reusable UI components
│   ├── ai/                    # AI/Genkit flows
│   │   └── flows/
│   │       └── analyze-test-failure-logs.ts
│   ├── lib/                   # Utilities
│   │   └── utils.ts          # Helper functions
│   ├── types/                 # TypeScript types
│   │   └── index.ts          # Type definitions
│   └── hooks/                 # React hooks
├── ReelRecruite-testing/      # Test project
│   └── server/
│       └── server.js         # Backend API server
├── public/                    # Static assets
├── docs/                      # Documentation
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── next.config.ts            # Next.js config
└── playwright.config.ts      # Playwright config
```

## 📜 Scripts

```json
{
  "dev": "next dev --turbopack",           // Start Next.js dev server
  "build": "next build",                   // Build for production
  "start": "next start",                   // Start production server
  "server": "node server/server.js",       // Start backend API
  "test:e2e": "playwright test",           // Run Playwright tests
  "lint": "next lint",                     // Run ESLint
  "typecheck": "tsc --noEmit"             // Type checking
}
```

## 🎨 UI Components

The dashboard uses a comprehensive set of UI components:

### Layout Components
- `Card` - Container with header, content, footer
- `Tabs` - Tabbed navigation
- `Accordion` - Expandable sections
- `Dialog` - Modal dialogs
- `ScrollArea` - Custom scrollbars

### Data Display
- `Table` - Data tables with sorting
- `Badge` - Status indicators
- `Progress` - Progress bars
- `Skeleton` - Loading states

### Forms & Inputs
- `Button` - Various button styles
- `Input` - Text inputs
- `Select` - Dropdown selects
- `Textarea` - Multi-line text
- `Switch` - Toggle switches

### Feedback
- `Toast` - Notifications
- `Alert Dialog` - Confirmation dialogs
- `Tooltip` - Hover tooltips

## 🔧 Customization

### Theme Colors

Edit `tailwind.config.ts` to customize colors:
```typescript
colors: {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  // ... more colors
}
```

### AI Model

Change the AI model in `src/ai/flows/analyze-test-failure-logs.ts`:
```typescript
model: 'googleai/gemini-1.5-flash', // or gemini-1.5-pro
```

### Server Port

Change the server port in `ReelRecruite-testing/server/server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **AI Analysis not working**
   - Check `GOOGLE_GENAI_API_KEY` is set
   - Verify API key is valid
   - Check network connectivity

2. **Live tests not updating**
   - Ensure backend server is running
   - Check SSE connection in Network tab
   - Verify `NEXT_PUBLIC_SERVER_URL` is correct

3. **Tests not appearing**
   - Check JSON reporter is configured
   - Verify report.json is in public folder
   - Check browser console for errors

## 📝 Best Practices

1. **Regular Cleanup**
   - Clear old test runs periodically
   - Export important runs before clearing

2. **AI Usage**
   - Use batch analysis for multiple failures
   - Review AI suggestions before implementing

3. **Performance**
   - Use pagination for large datasets
   - Limit items per page based on needs

4. **Notifications**
   - Enable browser notifications for CI/CD
   - Set up proper notification permissions

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts by [Recharts](https://recharts.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting section

---

**Made with ❤️ for better test reporting**
