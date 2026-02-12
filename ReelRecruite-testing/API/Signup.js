import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2500'], // signup is heavier than login
  },
};

export default function () {
  const url =
    'https://recruitai-backend-production.up.railway.app/v1/auth/signup';

  // 🔹 Ensure uniqueness across VUs and iterations
  const uniqueId = `${Date.now()}-${__VU}-${__ITER}`;

  // 🔹 Generate valid Pakistan phone format
  const phoneNumber = `(+92)${Math.floor(
    1000000000 + Math.random() * 8999999999
  )}`;

  const payload = JSON.stringify({
    fullName: `k6 User ${uniqueId}`,
    email: `k6_user_${uniqueId}@testmail.dev`,
    phone: phoneNumber,
    password: 'Test@1234',
    userType: 'candidate', // candidate | recruiter
  });

  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const success = check(res, {
    'signup status is 200 or 201': (r) =>
      r.status === 200 || r.status === 201,
  });

  if (!success) {
    console.log(
      `FAILED SIGNUP: Status=${res.status}, Response=${res.body}`
    );
  }

  sleep(1);
}
