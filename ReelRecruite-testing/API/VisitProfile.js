import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           // number of virtual users
  duration: '20s',  // test duration
  thresholds: {
    http_req_failed: ['rate<0.05'],       // allow up to 5% failures
    http_req_duration: ['p(95)<2000'],    // 95% under 2s
  },
};

export default function () {
  // 🔹 LOGIN (every iteration – as requested)
  const loginRes = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/auth/signin',
    JSON.stringify({
      email: 'muhammadsabir.dev@gmail.com',
      password: 'Sabir@1234_1',
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

  sleep(0.2); // small wait

  // 🔹 CALL PROTECTED ENDPOINT
  let res = http.get(
    'https://recruitai-backend-production.up.railway.app/v1/profile/read',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // 🔁 HANDLE TOKEN EXPIRY (419)
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
      'https://recruitai-backend-production.up.railway.app/v1/users/profile/read',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const apiSuccess = check(res, {
    'get user profile status is 200': (r) => r.status === 200,
  });

  if (!apiSuccess) {
    console.log(
      `FAILED GET USER PROFILE: Status=${res.status}, Response=${res.body}`
    );
  }

  sleep(1); // pause before next iteration
}
