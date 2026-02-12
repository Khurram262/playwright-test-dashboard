import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,          // adjust VUs as needed
  duration: '20s', // adjust duration as needed
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
      email: 'muhammadsabir.dev@gmail.com',
      password: 'Sabir@1234_1',
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

  let access_token = tokens.access_token;
  const refresh_token = tokens.refresh_token;

  sleep(0.2); // small wait to ensure token is active

  // 🔹 POST /applications/create/submit body
  const applicationBody = {
    applicationid: "ac193f9e-4533-4c92-bd5d-67621056eb0b",
    candidateId: "6061964c-7b45-40c9-ac74-34f3d11629d6",
    jobId: "ad3d3071-edbb-44fb-befe-1e99e437e9f3",
    status: "pending",
    videoUrl: "https://res.cloudinary.com/dkxgyjj8a/video/upload/v1766581673/applications/video/4cd1adf0-fb74-4653-ac2c-faa41c978f50_recorded-video.mp4",
    recruiterNotes: null,
    rejectionReason: null,
    submittedAt: "2025-12-24T13:08:09.259Z",
    reviewedAt: null,
    createdAt: "2025-12-24T13:08:09.259Z"
  };

  // 🔹 Make request with access token
  let res = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/applications/create/submit',
    JSON.stringify(applicationBody),
    { headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' } }
  );

  // 🔹 Retry with refresh token if session expired
  if (res.status === 419) {
    console.log('Session expired, refreshing token...');
    tokens = refreshToken(refresh_token);
    if (!tokens) return;

    access_token = tokens.access_token;
    res = http.post(
      'https://recruitai-backend-production.up.railway.app/v1/applications/create/submit',
      JSON.stringify(applicationBody),
      { headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' } }
    );
  }

  check(res, { 'submit application status is 200 or 201': (r) => r.status === 200 || r.status === 201 });

  if (res.status !== 200 && res.status !== 201) {
    console.log(`FAILED SUBMIT APPLICATION: Status=${res.status}, Response=${res.body}`);
  }

  sleep(1);
}
