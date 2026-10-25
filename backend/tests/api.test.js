import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../index.js';
import { RepositoryAnalysis } from '../src/models/repository.model.js';

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

describe('RepoRadar REST API Endpoints', () => {
  it('GET /api/health should return 200 OK and health payload', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.status, 'ok');
    assert.strictEqual(json.service, 'RepoRadar API');
    assert.ok(json.database);
  });

  it('GET /api/repositories should return list and platform stats', async () => {
    const res = await fetch(`${baseUrl}/api/repositories`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.repositories));
    assert.ok(json.stats);
    assert.strictEqual(typeof json.stats.repositoriesCount, 'number');
  });

  it('POST /api/repositories/analyze should reject invalid GitHub URLs with 400', async () => {
    const res = await fetch(`${baseUrl}/api/repositories/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://gitlab.com/invalid/repo' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.match(json.message, /Only github\.com/);
  });

  it('GET /api/repositories/:id should return 404 for unknown record', async () => {
    const res = await fetch(`${baseUrl}/api/repositories/non-existent-id-9999`);
    assert.strictEqual(res.status, 404);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  it('DELETE /api/repositories/:id should return 404 for non-existent record', async () => {
    const res = await fetch(`${baseUrl}/api/repositories/fake-id-12345`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 404);
  });
});
