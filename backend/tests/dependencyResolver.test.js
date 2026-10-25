import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveDependency } from '../src/services/dependencyResolver.js';

describe('Dependency Resolver', () => {
  const repoFiles = new Set([
    'src/App.jsx',
    'src/index.js',
    'src/components/Button.jsx',
    'src/components/Header.tsx',
    'src/components/index.js',
    'src/utils/math.js',
    'package.json'
  ]);

  it('should classify external packages correctly', () => {
    const res = resolveDependency('react', 'src/App.jsx', repoFiles);
    assert.strictEqual(res.category, 'external');
    assert.strictEqual(res.packageName, 'react');

    const scopedRes = resolveDependency('@babel/core/lib', 'src/index.js', repoFiles);
    assert.strictEqual(scopedRes.category, 'external');
    assert.strictEqual(scopedRes.packageName, '@babel/core');
  });

  it('should resolve relative imports with matching extensions', () => {
    const res = resolveDependency('./components/Button', 'src/App.jsx', repoFiles);
    assert.strictEqual(res.category, 'internal');
    assert.strictEqual(res.resolvedPath, 'src/components/Button.jsx');
  });

  it('should resolve parent directory paths (../)', () => {
    const res = resolveDependency('../utils/math', 'src/components/Button.jsx', repoFiles);
    assert.strictEqual(res.category, 'internal');
    assert.strictEqual(res.resolvedPath, 'src/utils/math.js');
  });

  it('should resolve index file directory imports', () => {
    const res = resolveDependency('./components', 'src/App.jsx', repoFiles);
    assert.strictEqual(res.category, 'internal');
    assert.strictEqual(res.resolvedPath, 'src/components/index.js');
  });

  it('should mark unresolvable relative imports as unresolved', () => {
    const res = resolveDependency('./components/NonExistent', 'src/App.jsx', repoFiles);
    assert.strictEqual(res.category, 'unresolved');
    assert.strictEqual(res.attemptedPath, 'src/components/NonExistent');
  });
});
