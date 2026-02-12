import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
};

let accessToken;
let refreshToken;

export function setup() {
  const loginRes = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/auth/signin',
    JSON.stringify({
      email: 'muhammadsabir.dev@gmail.com',
      password: 'Sabir@1234_1',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const body = JSON.parse(loginRes.body);

  return {
    accessToken: body.tokens.access_token,
    refreshToken: body.tokens.refresh_token,
  };
}

export default function (data) {
  let token = data.accessToken;

  const res = http.post(
    'https://recruitai-backend-production.up.railway.app/v1/profile/update',
    JSON.stringify({ fullName: 'Sabir Updated' }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 🔁 Handle expiry
  if (res.status === 419) {
    const refreshRes = http.post(
      'https://recruitai-backend-production.up.railway.app/v1/auth/refresh',
      JSON.stringify({ refresh_token: data.refreshToken }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    const newTokens = JSON.parse(refreshRes.body).tokens;
    token = newTokens.access_token;

    // retry request
    http.post(
      'https://recruitai-backend-production.up.railway.app/v1/profile/update',
      JSON.stringify({ fullName: 'Sabir Updated' }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  sleep(1);
}
