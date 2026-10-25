/**
 * File filter and classification utilities
 */

export const SUPPORTED_SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs'
]);

export const IGNORE_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
  'vendor',
  '.vscode',
  '.idea',
  'public',
  'assets',
  'static'
]);

export const IGNORE_FILE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.pdf', '.zip', '.tar', '.gz', '.7z',
  '.lock', '.map',
  '.exe', '.dll', '.so', '.dylib', '.bin'
]);

export const IGNORE_EXACT_FILENAMES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'composer.lock',
  'Gemfile.lock',
  'Cargo.lock'
]);

export const CONFIG_LIMITS = {
  MAX_TREE_FILES: 1000,
  MAX_SOURCE_FILES_ANALYZED: 150,
  MAX_FILE_SIZE_BYTES: 250 * 1024, // 250 KB
};

/**
 * Determine if a repository tree entry should be completely skipped
 */
export function shouldIgnorePath(path) {
  if (!path) return true;

  const normalized = path.replace(/\\/g, '/');
  const segments = normalized.split('/');
  const filename = segments[segments.length - 1];

  // Check directories
  for (let i = 0; i < segments.length - 1; i++) {
    if (IGNORE_DIRECTORIES.has(segments[i].toLowerCase())) {
      return true;
    }
  }

  // Check exact files
  if (IGNORE_EXACT_FILENAMES.has(filename)) {
    return true;
  }

  // Minified or map files
  if (filename.endsWith('.min.js') || filename.endsWith('.min.css') || filename.endsWith('.map') || filename.endsWith('.d.ts')) {
    return true;
  }

  // Check ignored extensions
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex !== -1) {
    const ext = filename.slice(dotIndex).toLowerCase();
    if (IGNORE_FILE_EXTENSIONS.has(ext)) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if a file is a supported source file for AST import analysis
 */
export function isSupportedSourceFile(path) {
  if (!path || shouldIgnorePath(path)) return false;

  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const ext = path.slice(dotIndex).toLowerCase();
  return SUPPORTED_SOURCE_EXTENSIONS.has(ext);
}

/**
 * Classify programming language / type based on file path
 */
export function detectLanguage(path) {
  if (!path) return 'Unknown';
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) return 'Other';

  const ext = path.slice(dotIndex).toLowerCase();
  switch (ext) {
    case '.js':
      return 'JavaScript';
    case '.jsx':
      return 'JavaScript (JSX)';
    case '.ts':
      return 'TypeScript';
    case '.tsx':
      return 'TypeScript (TSX)';
    case '.mjs':
      return 'JavaScript (ESM)';
    case '.cjs':
      return 'JavaScript (CJS)';
    case '.json':
      return 'JSON';
    case '.css':
    case '.scss':
    case '.sass':
    case '.less':
      return 'CSS/Style';
    case '.html':
      return 'HTML';
    case '.md':
    case '.markdown':
      return 'Markdown';
    case '.py':
      return 'Python';
    case '.go':
      return 'Go';
    case '.rs':
      return 'Rust';
    case '.java':
      return 'Java';
    default:
      return 'Other';
  }
}
