import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           
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
      email: 'super-admin@recruitai.com',
      password: 'Password@123',
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

  // 🔹 GET /sessions/read/get-all
  let res = http.get(
    'https://recruitai-backend-production.up.railway.app/v1/sessions/read/get-all',
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  // 🔹 Retry with refresh token if session expired
  if (res.status === 419) {
    console.log('Session expired, refreshing token...');
    tokens = refreshToken(refresh_token);
    if (!tokens) return;

    access_token = tokens.access_token;
    res = http.get(
      'https://recruitai-backend-production.up.railway.app/v1/sessions/read/get-stats',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
  }

  check(res, { 'get all sessions status is 200': (r) => r.status === 200 });

  if (res.status !== 200) {
    console.log(`FAILED GET ALL SESSIONS: Status=${res.status}, Response=${res.body}`);
  }

  sleep(1);
}
