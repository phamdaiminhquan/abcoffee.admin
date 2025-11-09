// Simple backend auth smoke test (Node 20 ESM)
// Reads .env.local (optional) and process env vars:
//   LOGIN_EMAIL, LOGIN_PASSWORD, VITE_APP_API_BASE_URL
// Usage (PowerShell):
//   $env:LOGIN_EMAIL="test@example.com"; $env:LOGIN_PASSWORD="123456"; node scripts/auth-check.mjs

import fs from 'fs';
import path from 'path';

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf8');
  return Object.fromEntries(
    raw.split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(line => {
        const [key, ...rest] = line.split('=');
        return [key.trim(), rest.join('=').trim()];
      })
  );
}

const envLocal = parseEnvFile(path.resolve('.env.local'));
const API_BASE = process.env.VITE_APP_API_BASE_URL || envLocal.VITE_APP_API_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.LOGIN_EMAIL || 'test@example.com';
const PASSWORD = process.env.LOGIN_PASSWORD || '123456';
const REGISTER_IF_MISSING = /^true$/i.test(process.env.REGISTER_IF_MISSING || '');
const REGISTER_DOMAIN = process.env.REGISTER_DOMAIN || 'example.com';

const endpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh-token',
  profile: '/auth/profile',
  register: '/auth/register',
};

function fullUrl(p) {
  return API_BASE.replace(/\/$/, '') + p;
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  let bodyText = await res.text();
  let body;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }
  return { ok: res.ok, status: res.status, body };
}

async function run() {
  console.log('--- Auth Smoke Test ---');
  console.log('API_BASE        :', API_BASE);
  console.log('Login email     :', EMAIL);

  // LOGIN
  let loginRes = await jsonFetch(fullUrl(endpoints.login), {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  console.log('\n[LOGIN]', loginRes.status, loginRes.ok ? 'OK' : 'FAIL');
  console.dir(loginRes.body, { depth: 3 });
  if (!loginRes.ok && REGISTER_IF_MISSING && loginRes.status === 401) {
    const regEmail = EMAIL.includes('@') ? EMAIL : `${Date.now()}@${REGISTER_DOMAIN}`;
    console.log(`\n[REGISTER] Trying to create user: ${regEmail}`);
    const registerRes = await jsonFetch(fullUrl(endpoints.register), {
      method: 'POST',
      body: JSON.stringify({ fullName: 'Demo User', email: regEmail, password: PASSWORD, phone: '0900000000' })
    });
    console.log('[REGISTER]', registerRes.status, registerRes.ok ? 'OK' : 'FAIL');
    console.dir(registerRes.body, { depth: 3 });
    if (registerRes.ok) {
      // attempt login again (if register didn’t return tokens)
      loginRes = registerRes;
      if (!registerRes.body?.tokens?.accessToken) {
        loginRes = await jsonFetch(fullUrl(endpoints.login), {
          method: 'POST',
          body: JSON.stringify({ email: regEmail, password: PASSWORD })
        });
        console.log('\n[LOGIN after register]', loginRes.status, loginRes.ok ? 'OK' : 'FAIL');
        console.dir(loginRes.body, { depth: 3 });
      }
    }
  }
  if (!loginRes.ok) {
    console.error('Login failed -> stop');
    process.exit(1);
  }

  const accessToken = loginRes.body?.tokens?.accessToken;
  const refreshToken = loginRes.body?.tokens?.refreshToken;
  if (!accessToken) {
    console.error('No accessToken in response');
    process.exit(1);
  }

  // PROFILE
  const profileRes = await jsonFetch(fullUrl(endpoints.profile), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log('\n[PROFILE]', profileRes.status, profileRes.ok ? 'OK' : 'FAIL');
  console.dir(profileRes.body, { depth: 2 });

  // REFRESH (optional)
  if (refreshToken) {
    const refreshRes = await jsonFetch(fullUrl(endpoints.refresh), {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    console.log('\n[REFRESH]', refreshRes.status, refreshRes.ok ? 'OK' : 'FAIL');
    console.dir(refreshRes.body, { depth: 2 });
  }

  console.log('\nDone.');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
