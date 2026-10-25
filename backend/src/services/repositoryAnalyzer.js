/**
 * Complete repository analysis engine
 */
import { parseGitHubUrl } from '../utils/githubUrl.js';
import {
  isSupportedSourceFile,
  shouldIgnorePath,
  detectLanguage,
  CONFIG_LIMITS
} from '../utils/fileFilters.js';
import { fetchRepoMetadata, fetchRepoTree, batchFetchFiles } from './githubService.js';
import { parseSourceImports } from './importParser.js';
import { resolveDependency } from './dependencyResolver.js';
import { buildGraphAndMetrics } from './graphService.js';

/**
 * Analyzes a GitHub repository from its URL
 * @param {string} rawUrl - GitHub repository URL
 * @param {Object} options - Optional overrides (e.g. branch, limits)
 * @returns {Promise<Object>} Complete analysis payload
 */
export async function analyzeRepository(rawUrl, options = {}) {
  // 1. Validate & Parse URL
  const urlCheck = parseGitHubUrl(rawUrl);
  if (!urlCheck.isValid) {
    throw new Error(urlCheck.error || 'Invalid repository URL');
  }

  const { owner, repo, canonicalUrl, branch: urlBranch } = urlCheck;

  // 2. Fetch Repository Metadata
  const metadata = await fetchRepoMetadata(owner, repo);
  const branchToUse = options.branch || urlBranch || metadata.defaultBranch || 'main';

  // 3. Fetch Recursive Tree
  const { tree, truncated } = await fetchRepoTree(owner, repo, branchToUse);

  if (!tree || tree.length === 0) {
    throw new Error(`Repository ${owner}/${repo} appears to be empty or contains no files.`);
  }

  // 4. Filter Tree Entries
  const allRepoFilePaths = new Set();
  const fileTreeSummary = [];
  const languageCounts = {};
  const supportedCandidates = [];

  for (const entry of tree) {
    // We only care about files ('blob')
    if (entry.type !== 'blob') continue;

    const filePath = entry.path;
    if (shouldIgnorePath(filePath)) continue;

    allRepoFilePaths.add(filePath);

    const lang = detectLanguage(filePath);
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;

    const isSupported = isSupportedSourceFile(filePath);
    const size = entry.size || 0;

    fileTreeSummary.push({
      path: filePath,
      language: lang,
      size,
      isSupported
    });

    if (isSupported && size <= CONFIG_LIMITS.MAX_FILE_SIZE_BYTES) {
      supportedCandidates.push({
        path: filePath,
        language: lang,
        size
      });
    }
  }

  // Bound the maximum source files to download & analyze
  const filesToAnalyze = supportedCandidates.slice(0, CONFIG_LIMITS.MAX_SOURCE_FILES_ANALYZED);

  // 5. Batch Fetch Source Code
  const { results: sourceContents, errors: fetchErrors } = await batchFetchFiles(
    owner,
    repo,
    branchToUse,
    filesToAnalyze,
    8
  );

  // 6. AST Import Extraction and Dependency Resolution
  const analyzedFiles = [];
  const rawEdges = [];
  const externalPackagesSet = new Set();
  const parseErrors = [];
  const unresolvedImports = [];
  const fileContentsMap = {};

  for (const file of filesToAnalyze) {
    const code = sourceContents.get(file.path);
    if (!code) {
      if (fetchErrors.has(file.path)) {
        parseErrors.push({
          path: file.path,
          error: `Fetch error: ${fetchErrors.get(file.path)}`
        });
      }
      continue;
    }

    // Store for code viewer
    fileContentsMap[file.path] = code;

    const lineCount = code.split('\n').length;
    const { imports, parseError } = parseSourceImports(code, file.path);

    if (parseError) {
      parseErrors.push({
        path: file.path,
        error: parseError.message,
        line: parseError.line
      });
    }

    const fileInternalImports = [];
    const fileExternalImports = [];

    for (const imp of imports) {
      const resolution = resolveDependency(imp.source, file.path, allRepoFilePaths);

      if (resolution.category === 'internal') {
        fileInternalImports.push({
          target: resolution.resolvedPath,
          rawSource: imp.source,
          type: imp.type,
          line: imp.line
        });

        rawEdges.push({
          source: file.path,
          target: resolution.resolvedPath,
          importType: imp.type,
          line: imp.line
        });
      } else if (resolution.category === 'external') {
        externalPackagesSet.add(resolution.packageName);
        fileExternalImports.push({
          packageName: resolution.packageName,
          rawSource: imp.source
        });
      } else if (resolution.category === 'unresolved') {
        unresolvedImports.push({
          sourceFile: file.path,
          rawSource: imp.source,
          attemptedPath: resolution.attemptedPath
        });
      }
    }

    analyzedFiles.push({
      path: file.path,
      language: file.language,
      size: file.size,
      lines: lineCount,
      imports: fileInternalImports,
      externalImports: fileExternalImports,
      hasParseError: Boolean(parseError)
    });
  }

  // 7. Graph Generation, Cycles, and Metrics
  const { nodes, edges, metrics, cycles, directorySummary } = buildGraphAndMetrics(
    analyzedFiles,
    rawEdges
  );

  // Map importedBy reverse lists into analyzedFiles
  const incomingMap = new Map();
  for (const edge of edges) {
    if (!incomingMap.has(edge.target)) {
      incomingMap.set(edge.target, []);
    }
    incomingMap.get(edge.target).push(edge.source);
  }

  const enrichedFiles = analyzedFiles.map((file) => ({
    ...file,
    importedBy: incomingMap.get(file.path) || [],
    inDegree: (incomingMap.get(file.path) || []).length,
    outDegree: (file.imports || []).length
  }));

  // Build language statistics
  const languageStats = Object.entries(languageCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / (fileTreeSummary.length || 1)) * 100)
  })).sort((a, b) => b.count - a.count);

  return {
    metadata: {
      ...metadata,
      canonicalUrl,
      branch: branchToUse
    },
    summary: {
      totalRepoFiles: tree.length,
      filteredFilesCount: fileTreeSummary.length,
      supportedSourceFiles: supportedCandidates.length,
      analyzedFilesCount: analyzedFiles.length,
      internalEdgesCount: edges.length,
      externalPackagesCount: externalPackagesSet.size,
      cycleCount: cycles.length,
      parseErrorsCount: parseErrors.length,
      unresolvedImportsCount: unresolvedImports.length,
      isTreeTruncated: truncated
    },
    languages: languageStats,
    files: enrichedFiles,
    allFiles: fileTreeSummary,
    fileContents: fileContentsMap,
    nodes,
    edges,
    cycles,
    metrics,
    directorySummary,
    externalPackages: Array.from(externalPackagesSet).sort(),
    parseErrors,
    unresolvedImports
  };
}
