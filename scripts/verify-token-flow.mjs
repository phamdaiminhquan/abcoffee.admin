// Token verification script
// Mô phỏng flow: login → gọi các APIs từ modules (Products, Categories, Orders)
// Kiểm tra token có được gửi kèm trong Authorization header
// Usage: node scripts/verify-token-flow.mjs

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

function fullUrl(p) {
  return API_BASE.replace(/\/$/, '') + p;
}

async function jsonFetch(url, opts = {}) {
  console.log(`\n→ ${opts.method || 'GET'} ${url}`);
  if (opts.headers?.Authorization) {
    console.log(`  Authorization: ${opts.headers.Authorization.substring(0, 30)}...`);
  }
  
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  
  let bodyText = await res.text();
  let body;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }
  
  console.log(`← ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
  return { ok: res.ok, status: res.status, body, headers: res.headers };
}

async function run() {
  console.log('━━━ Token Verification Flow ━━━');
  console.log('API_BASE:', API_BASE);
  console.log('Email:', EMAIL);

  // STEP 1: Login
  console.log('\n[STEP 1] Login');
  const loginRes = await jsonFetch(fullUrl('/auth/login'), {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });

  if (!loginRes.ok) {
    console.error('\n❌ Login failed. Cannot proceed with token verification.');
    console.dir(loginRes.body, { depth: 3 });
    process.exit(1);
  }

  const accessToken = loginRes.body?.tokens?.accessToken;
  const refreshToken = loginRes.body?.tokens?.refreshToken;
  if (!accessToken) {
    console.error('❌ No accessToken in login response');
    process.exit(1);
  }

  console.log('✅ Login successful');
  console.log(`   Access Token: ${accessToken.substring(0, 30)}...`);

  // STEP 2: Test các endpoints từ modules
  const testEndpoints = [
    { name: 'Products', url: '/products' },
    { name: 'Categories', url: '/categories' },
    { name: 'Orders', url: '/orders' },
  ];

  console.log('\n[STEP 2] Test module APIs với token');
  let allPassed = true;

  for (const endpoint of testEndpoints) {
    console.log(`\n--- Testing ${endpoint.name} ---`);
    const res = await jsonFetch(fullUrl(endpoint.url), {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.ok) {
      console.log(`✅ ${endpoint.name}: Token accepted`);
      if (Array.isArray(res.body)) {
        console.log(`   → Returned ${res.body.length} items`);
      }
    } else {
      console.log(`❌ ${endpoint.name}: Failed (status ${res.status})`);
      console.dir(res.body, { depth: 2 });
      allPassed = false;
    }
  }

  // STEP 3: Test refresh token
  if (refreshToken) {
    console.log('\n[STEP 3] Test Refresh Token');
    const refreshRes = await jsonFetch(fullUrl('/auth/refresh-token'), {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });

    if (refreshRes.ok) {
      console.log('✅ Refresh token successful');
      console.log(`   New Access Token: ${refreshRes.body.accessToken?.substring(0, 30)}...`);
    } else {
      console.log('❌ Refresh token failed');
      console.dir(refreshRes.body, { depth: 2 });
      allPassed = false;
    }
  }

  // Summary
  console.log('\n━━━ Summary ━━━');
  if (allPassed) {
    console.log('✅ All checks passed! Token flow is working correctly.');
  } else {
    console.log('⚠️  Some checks failed. Review output above.');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
