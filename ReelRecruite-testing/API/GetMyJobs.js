import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  // 🔹 LOGIN (every iteration)
  const loginRes = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/auth/signin',
    JSON.stringify({
      email: 'carlos@gmail.com',
      password: 'Carlos@123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginSuccess = check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  if (!loginSuccess) {
    console.log(`LOGIN FAILED: ${loginRes.status} ${loginRes.body}`);
    return;
  }

  const loginBody = JSON.parse(loginRes.body);
  let accessToken = loginBody.tokens.access_token;
  const refreshToken = loginBody.tokens.refresh_token;

  sleep(0.2);

  // 🔹 CALL PROTECTED API
  let res = http.get(
    'https://recruitai-backend-production.up.railway.app/v1/jobs/read/get-all',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // 🔁 HANDLE SESSION EXPIRY (419)
  if (res.status === 419) {
    const refreshRes = http.post(
      'https://recruitai-backend-production.up.railway.app/v1/auth/refresh',
      JSON.stringify({
        refresh_token: refreshToken,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const refreshSuccess = check(refreshRes, {
      'refresh successful': (r) => r.status === 200,
    });

    if (!refreshSuccess) {
      console.log(`REFRESH FAILED: ${refreshRes.status} ${refreshRes.body}`);
      return;
    }

    accessToken = JSON.parse(refreshRes.body).tokens.access_token;

    // 🔁 RETRY ORIGINAL REQUEST
    res = http.get(
      'https://recruitai-backend-production.up.railway.app/v1/jobs/read/my-jobs',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  check(res, {
    'get all jobs status is 200': (r) => r.status === 200,
  });

  if (res.status !== 200) {
    console.log(`FAILED GET ALL JOBS: ${res.status} ${res.body}`);
  }

  sleep(1);
}
