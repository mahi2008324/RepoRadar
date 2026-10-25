import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../index.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('Authentication API Endpoints', () => {
  const testUser = {
    name: 'Ada Lovelace',
    email: `ada.${Date.now()}@example.com`,
    password: 'securePassword123'
  };
  let authToken;

  it('POST /api/auth/register should register a new user and return a JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testUser.email.toLowerCase());
    assert.strictEqual(data.user.name, testUser.name);
    authToken = data.token;
  });

  it('POST /api/auth/register should reject duplicate emails with 409', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already exists/);
  });

  it('POST /api/auth/register should reject passwords shorter than 6 characters', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /at least 6 characters/);
  });

  it('POST /api/auth/login should authenticate with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  it('POST /api/auth/login should reject incorrect password with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongPassword'
      })
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  it('GET /api/auth/me should return current user with valid Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, testUser.email.toLowerCase());
  });

  it('GET /api/auth/me should reject requests without token with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });
});
