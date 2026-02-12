import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           // you can increase for load testing
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2500'],
  },
};

// 🔹 Helper to login and get tokens
function login() {
  const loginRes = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/auth/signin',
    JSON.stringify({
      email: 'carlos@gmail.com',
      password: 'Carlos@123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const success = check(loginRes, { 'login successful': (r) => r.status === 200 });
  if (!success) {
    console.log(`LOGIN FAILED: ${loginRes.body}`);
    return null;
  }

  const tokens = JSON.parse(loginRes.body).tokens;
  return tokens;
}

// 🔹 Helper to refresh token
function refreshToken(refresh_token) {
  const refreshRes = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/auth/refresh-token',
    JSON.stringify({ refresh_token }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const success = check(refreshRes, { 'refresh token successful': (r) => r.status === 200 });
  if (!success) {
    console.log(`REFRESH FAILED: ${refreshRes.body}`);
    return null;
  }

  return JSON.parse(refreshRes.body).tokens;
}

export default function () {
  let tokens = login();
  if (!tokens) return;

  const token = tokens.access_token;
  const refresh_token = tokens.refresh_token;

  sleep(0.2); // small wait to ensure token is active

  // 🔹 POST /jobs/create body
  const jobBody = {
    recruiterId: "ee568c89-8dde-4c75-9431-0382c9e2e90b",
    companyId: "27dfa07f-ee9e-4a29-842c-28588b114754",
    isAnonymous: false,
    status: "active",
    isDeleted: false,
    title: "SQA Automation Engineer",
    highlight: "We are seeking an experienced SQA Automation Engineer to design, develop, and maintain automated testing frameworks. You will be responsible for ensuring product quality through automated test scripts, CI/CD integration, and performance testing.",
    location: "",
    region: "Asia",
    jobType: "full-time",
    workType: "on-site",
    experienceLevel: "mid",
    salaryRange: "100000",
    currency: "pkr",
    description: "<p>Design, develop, and maintain <strong>automation test scripts</strong> using Selenium / Playwright / Cypress / Appium</p><p>Build and maintain <strong>automation frameworks</strong> for web and mobile applications</p><p>Execute automated tests and analyze test results</p><p>Integrate automated tests into <strong>CI/CD pipelines</strong> (GitHub Actions, Jenkins, GitLab CI)</p><p>Collaborate with developers and QA team to ensure comprehensive test coverage</p><p>Perform API test automation using Postman / REST Assured / Karate</p><p>Identify, document, and track defects using Jira or similar tools</p><p>Ensure quality across functional, regression, smoke, and performance tests</p><p>Continuously improve automation processes and coverage</p>",
    requiredSkills: [
      "Playwright (preferred)  Selenium WebDriver  Cypres",
      "JavaScript / TypeScript / Python",
      "GitHub Actions, Jenkins, GitLab"
    ],
    requirements: ["BS CS"],
    tags: ["fast growing"],
    expiresAt: "2025-12-01T19:00:00.000Z",
    createdAt: "2025-11-28T15:31:15.991Z",
    updatedAt: "2025-11-28T15:31:15.991Z"
  };

  // 🔹 Make request with access token
  let res = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/jobs/create',
    JSON.stringify(jobBody),
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  // 🔹 Retry with refresh token if session expired
  if (res.status === 419) {
    console.log('Session expired, refreshing token...');
    tokens = refreshToken(refresh_token);
    if (!tokens) return;

    res = http.post(
      'https://recruitai-backend-production.up.railway.app/v1/jobs/create',
      JSON.stringify(jobBody),
      { headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' } }
    );
  }

  check(res, { 'create job status is 200': (r) => r.status === 200 || r.status === 201 });

  if (res.status !== 200 && res.status !== 201) {
    console.log(`FAILED CREATE JOB: Status=${res.status}, Response=${res.body}`);
  }

  sleep(1);
}
