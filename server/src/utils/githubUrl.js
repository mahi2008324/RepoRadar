/**
 * GitHub URL parsing and normalization utility
 */

export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'Repository URL is required' };
  }

  const trimmed = url.trim();

  // Basic SSRF and scheme validation
  if (!/^https?:\/\//i.test(trimmed)) {
    return { isValid: false, error: 'URL must begin with http:// or https://' };
  }

  try {
    const parsed = new URL(trimmed);

    // Host must strictly be github.com (or www.github.com)
    const host = parsed.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') {
      return { isValid: false, error: 'Only github.com repository URLs are supported' };
    }

    // Split pathname into segments, removing leading/trailing slashes
    const segments = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/');

    if (segments.length < 2 || !segments[0] || !segments[1]) {
      return { isValid: false, error: 'URL must include both owner and repository name (e.g. github.com/owner/repo)' };
    }

    const owner = segments[0];
    let repo = segments[1];

    // Strip trailing .git if present
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }

    // Validate GitHub username / repo naming constraints
    // Usernames: alphanumeric or hyphens, no consecutive hyphens
    // Repo names: alphanumeric, hyphens, underscores, dots
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(owner)) {
      return { isValid: false, error: 'Invalid GitHub repository owner name' };
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      return { isValid: false, error: 'Invalid GitHub repository name' };
    }

    // Optional branch or path extraction if user pasted a tree URL
    let branch = null;
    let path = null;
    if (segments[2] === 'tree' && segments[3]) {
      branch = segments[3];
      if (segments.length > 4) {
        path = segments.slice(4).join('/');
      }
    }

    const canonicalUrl = `https://github.com/${owner}/${repo}`;
    const fullPath = `${owner}/${repo}`;

    return {
      isValid: true,
      owner,
      repo,
      fullPath,
      canonicalUrl,
      branch,
      path
    };
  } catch (err) {
    return { isValid: false, error: 'Malformed URL provided' };
  }
}
