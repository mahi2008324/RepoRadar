import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseGitHubUrl } from '../src/utils/githubUrl.js';

describe('GitHub URL Parser & Validator', () => {
  it('should parse standard repository URLs', () => {
    const res = parseGitHubUrl('https://github.com/facebook/react');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'facebook');
    assert.strictEqual(res.repo, 'react');
    assert.strictEqual(res.canonicalUrl, 'https://github.com/facebook/react');
  });

  it('should handle trailing slashes', () => {
    const res = parseGitHubUrl('https://github.com/vercel/next.js/');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'vercel');
    assert.strictEqual(res.repo, 'next.js');
  });

  it('should handle URLs with .git suffix', () => {
    const res = parseGitHubUrl('https://github.com/tailwindlabs/tailwindcss.git');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'tailwindlabs');
    assert.strictEqual(res.repo, 'tailwindcss');
  });

  it('should parse branch tree URLs', () => {
    const res = parseGitHubUrl('https://github.com/facebook/react/tree/main/packages/react');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.owner, 'facebook');
    assert.strictEqual(res.repo, 'react');
    assert.strictEqual(res.branch, 'main');
    assert.strictEqual(res.path, 'packages/react');
  });

  it('should reject non-GitHub hosts', () => {
    const res = parseGitHubUrl('https://gitlab.com/owner/repo');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /Only github\.com/);
  });

  it('should reject URLs without repository name', () => {
    const res = parseGitHubUrl('https://github.com/facebook');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /must include both owner and repository/);
  });

  it('should reject malformed or arbitrary strings', () => {
    const res = parseGitHubUrl('not-a-url');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /URL must begin with http/);
  });
});
