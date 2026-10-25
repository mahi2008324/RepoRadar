/**
 * Dependency resolver: maps import strings to internal repository paths or external packages
 */
import path from 'path';

// Use posix for consistent forward-slash path handling across OSes
const posix = path.posix;

const CANDIDATE_EXTENSIONS = [
  '',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '/index.js',
  '/index.jsx',
  '/index.ts',
  '/index.tsx'
];

/**
 * Normalizes a relative path string removing redundant slashes and dots
 */
export function normalizePath(p) {
  if (!p) return '';
  return posix.normalize(p.replace(/\\/g, '/')).replace(/^\.\//, '');
}

/**
 * Resolves an import source string within the repository context
 * @param {string} rawSource - e.g. './Header', '../utils/math.js', 'react', '@/components/Footer'
 * @param {string} currentFilePath - e.g. 'src/App.jsx'
 * @param {Set<string>} allRepoFiles - Set of all files present in the repo
 * @returns {Object} Resolution result
 */
export function resolveDependency(rawSource, currentFilePath, allRepoFiles) {
  if (!rawSource || typeof rawSource !== 'string') {
    return { category: 'unknown', source: rawSource };
  }

  const trimmed = rawSource.trim();

  // 1. External packages (e.g. 'react', 'express', '@mui/material', 'lodash/debounce')
  const isRelative = trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/');
  const isAlias = trimmed.startsWith('@/') || trimmed.startsWith('~/');

  if (!isRelative && !isAlias) {
    // Extract base package name (handle scoped packages like @babel/parser)
    let packageName = trimmed;
    if (trimmed.startsWith('@')) {
      const parts = trimmed.split('/');
      packageName = parts.slice(0, 2).join('/');
    } else {
      packageName = trimmed.split('/')[0];
    }

    return {
      category: 'external',
      rawSource: trimmed,
      packageName
    };
  }

  // 2. Resolve Path
  const currentDir = posix.dirname(currentFilePath);
  let basePath;

  if (isAlias) {
    // Common alias conventions: '@/...' or '~/...' usually maps to 'src/...' or root
    const stripped = trimmed.slice(2);
    // Check candidate in 'src/' first, then root
    const srcCandidate = normalizePath(posix.join('src', stripped));
    const rootCandidate = normalizePath(stripped);

    const resolvedAlias = testCandidates(srcCandidate, allRepoFiles) || testCandidates(rootCandidate, allRepoFiles);
    if (resolvedAlias) {
      return {
        category: 'internal',
        rawSource: trimmed,
        resolvedPath: resolvedAlias
      };
    }
  }

  // Standard relative import
  basePath = normalizePath(posix.join(currentDir, trimmed));

  const resolved = testCandidates(basePath, allRepoFiles);
  if (resolved) {
    return {
      category: 'internal',
      rawSource: trimmed,
      resolvedPath: resolved
    };
  }

  // If we reach here, it was an attempted internal/relative import that could not be resolved
  return {
    category: 'unresolved',
    rawSource: trimmed,
    attemptedPath: basePath
  };
}

/**
 * Tests candidate file extensions against existing repository files
 */
function testCandidates(basePath, allRepoFiles) {
  for (const ext of CANDIDATE_EXTENSIONS) {
    const candidate = normalizePath(basePath + ext);
    if (allRepoFiles.has(candidate)) {
      return candidate;
    }
  }
  return null;
}
