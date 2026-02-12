import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',

  thresholds: {
    http_req_failed: ['rate<0.01'],        // < 1% failures
    http_req_duration: ['p(95)<2000'],     // 95% under 2s
  },
};

export default function () {
  const url =
    'https://recruitai-backend-production.up.railway.app/v1/auth/signin';

  const payload = JSON.stringify({
    email: 'carlos@gmail.com',
    password: 'Carlos@123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Check for successful login
  const success = check(res, {
    'login status is 200': (r) => r.status === 200,
    'response has token': (r) => r.body && r.body.includes('token'),
  });

  // Log failed requests
  if (!success) {
    console.log(
      `FAILED LOGIN: Status=${res.status}, URL=${url}, Response=${res.body}`
    );
  }

  sleep(1);
}
