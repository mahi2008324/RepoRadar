/**
 * GitHub API service for metadata, recursive file trees, and source content fetching
 */
import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';
const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com';

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoRadar-Analyzer'
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetches repository metadata from GitHub API
 */
export async function fetchRepoMetadata(owner, repo) {
  try {
    const res = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
      timeout: 10000
    });

    const data = res.data;
    return {
      owner: data.owner?.login || owner,
      name: data.name || repo,
      fullName: data.full_name,
      description: data.description || 'No description provided',
      defaultBranch: data.default_branch || 'main',
      htmlUrl: data.html_url,
      primaryLanguage: data.language || 'JavaScript',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      size: data.size || 0,
      isPrivate: data.private || false,
      updatedAt: data.updated_at
    };
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        throw new Error(`Repository ${owner}/${repo} not found or is private.`);
      }
      if (err.response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Set a GITHUB_TOKEN in server/.env or try again later.');
      }
    }
    throw new Error(`Failed to fetch GitHub repository metadata: ${err.message}`);
  }
}

/**
 * Fetches the recursive file tree of the repository
 */
export async function fetchRepoTree(owner, repo, branch = 'main') {
  try {
    const res = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: getHeaders(),
      timeout: 15000
    });

    const tree = res.data.tree || [];
    return {
      tree,
      truncated: res.data.truncated || false
    };
  } catch (err) {
    if (err.response?.status === 404) {
      // If branch failed, try master or main
      throw new Error(`Tree for branch '${branch}' not found.`);
    }
    if (err.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded while retrieving tree.');
    }
    throw new Error(`Failed to fetch repository tree: ${err.message}`);
  }
}

/**
 * Fetches the raw content of a source file
 */
export async function fetchFileContent(owner, repo, branch, filePath) {
  try {
    // 1. Try raw.githubusercontent.com (very fast, plain text)
    const rawUrl = `${RAW_GITHUB_BASE}/${owner}/${repo}/${branch}/${filePath}`;
    const res = await axios.get(rawUrl, {
      responseType: 'text',
      timeout: 8000,
      headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}
    });
    return typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
  } catch (rawErr) {
    // 2. Fallback to GitHub Contents API
    try {
      const res = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
        headers: getHeaders(),
        timeout: 8000
      });
      if (res.data?.content && res.data?.encoding === 'base64') {
        return Buffer.from(res.data.content, 'base64').toString('utf8');
      }
      throw new Error('File content not available as base64');
    } catch (contentsErr) {
      throw new Error(`Could not fetch source for ${filePath}: ${contentsErr.message}`);
    }
  }
}

/**
 * Batch fetches source files with controlled concurrency
 */
export async function batchFetchFiles(owner, repo, branch, fileList, concurrency = 6) {
  const results = new Map();
  const errors = new Map();

  for (let i = 0; i < fileList.length; i += concurrency) {
    const chunk = fileList.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (file) => {
        try {
          const content = await fetchFileContent(owner, repo, branch, file.path);
          results.set(file.path, content);
        } catch (err) {
          errors.set(file.path, err.message);
        }
      })
    );
  }

  return { results, errors };
}
