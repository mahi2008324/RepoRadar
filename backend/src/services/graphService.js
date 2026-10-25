/**
 * Graph analysis, cycle detection, impact analysis, and metric calculation
 */

/**
 * Builds the directed graph and computes repository-level graph metrics
 * @param {Array} analyzedFiles - Array of { path, language, size, lines, imports, etc. }
 * @param {Array} resolvedEdges - Array of { source, target, importType, line }
 * @returns {Object} Graph data and metrics
 */
export function buildGraphAndMetrics(analyzedFiles, resolvedEdges) {
  const inDegreeMap = new Map();
  const outDegreeMap = new Map();
  const adjacencyList = new Map(); // source -> Set of targets (out-edges)
  const reverseAdjacencyList = new Map(); // target -> Set of sources (in-edges)

  // Initialize all nodes
  for (const file of analyzedFiles) {
    inDegreeMap.set(file.path, 0);
    outDegreeMap.set(file.path, 0);
    adjacencyList.set(file.path, new Set());
    reverseAdjacencyList.set(file.path, new Set());
  }

  // Deduplicate edges and calculate degrees
  const edgeSet = new Set();
  const validEdges = [];

  for (const edge of resolvedEdges) {
    const { source, target, importType, line } = edge;

    // Both ends must exist in analyzed files
    if (!adjacencyList.has(source) || !adjacencyList.has(target)) {
      continue;
    }

    const edgeKey = `${source}->${target}`;
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      validEdges.push({
        id: edgeKey,
        source,
        target,
        type: 'imports',
        importType: importType || 'es_named',
        line: line || null
      });

      adjacencyList.get(source).add(target);
      reverseAdjacencyList.get(target).add(source);
      outDegreeMap.set(source, (outDegreeMap.get(source) || 0) + 1);
      inDegreeMap.set(target, (inDegreeMap.get(target) || 0) + 1);
    }
  }

  // Build nodes with updated degrees
  const nodes = analyzedFiles.map((file) => {
    const inDegree = inDegreeMap.get(file.path) || 0;
    const outDegree = outDegreeMap.get(file.path) || 0;
    const segments = file.path.split('/');
    const label = segments[segments.length - 1];

    return {
      id: file.path,
      label,
      path: file.path,
      language: file.language || 'JavaScript',
      size: file.size || 0,
      lines: file.lines || 0,
      inDegree,
      outDegree
    };
  });

  // Most imported files (highest inDegree)
  const mostImported = [...nodes]
    .filter((n) => n.inDegree > 0)
    .sort((a, b) => b.inDegree - a.inDegree)
    .slice(0, 10)
    .map((n) => ({
      path: n.path,
      label: n.label,
      language: n.language,
      inDegree: n.inDegree,
      importedByCount: n.inDegree
    }));

  // Most dependent files (highest outDegree)
  const mostDependent = [...nodes]
    .filter((n) => n.outDegree > 0)
    .sort((a, b) => b.outDegree - a.outDegree)
    .slice(0, 10)
    .map((n) => ({
      path: n.path,
      label: n.label,
      language: n.language,
      outDegree: n.outDegree,
      dependenciesCount: n.outDegree
    }));

  // Disconnected files (inDegree === 0 && outDegree === 0)
  const disconnectedFiles = nodes
    .filter((n) => n.inDegree === 0 && n.outDegree === 0)
    .map((n) => ({
      path: n.path,
      label: n.label,
      language: n.language
    }));

  // Cycle detection via DFS
  const cycles = detectCycles(adjacencyList, 15);

  // Directory-level insights
  const directorySummary = calculateDirectoryInsights(nodes, validEdges);

  return {
    nodes,
    edges: validEdges,
    metrics: {
      totalNodes: nodes.length,
      totalEdges: validEdges.length,
      mostImported,
      mostDependent,
      disconnectedFiles,
      cycleCount: cycles.length,
      isCyclic: cycles.length > 0
    },
    cycles,
    directorySummary
  };
}

/**
 * Detects directed cycles using Depth-First Search with recursion stack
 * @param {Map<string, Set<string>>} adjacencyList
 * @param {number} maxCycles - Limit to prevent exponential explosion
 * @returns {Array<Array<string>>} Array of cycle paths, e.g. [['A', 'B', 'A']]
 */
export function detectCycles(adjacencyList, maxCycles = 15) {
  const visited = new Set();
  const inStack = new Set();
  const stack = [];
  const detectedCycles = [];
  const seenCycleSignatures = new Set();

  function dfs(node) {
    if (detectedCycles.length >= maxCycles) return;

    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adjacencyList.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (detectedCycles.length >= maxCycles) break;

      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (inStack.has(neighbor)) {
        // Cycle detected! Extract path from neighbor to current
        const startIndex = stack.indexOf(neighbor);
        if (startIndex !== -1) {
          const cyclePath = stack.slice(startIndex).concat([neighbor]);
          // Canonical signature to avoid duplicate cyclic shifts
          const sorted = [...cyclePath.slice(0, -1)].sort().join('|');
          if (!seenCycleSignatures.has(sorted)) {
            seenCycleSignatures.add(sorted);
            detectedCycles.push(cyclePath);
          }
        }
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  for (const node of adjacencyList.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
    if (detectedCycles.length >= maxCycles) break;
  }

  return detectedCycles;
}

/**
 * Computes impact analysis for a specific target file
 * @param {string} targetFile - Path of the file being inspected
 * @param {Array} edges - Array of { source, target }
 * @returns {Object} Impact summary
 */
export function calculateFileImpact(targetFile, edges) {
  // Direct dependencies: files that targetFile imports (targetFile -> B)
  const directDependencies = edges
    .filter((e) => e.source === targetFile)
    .map((e) => e.target);

  // Direct dependents: files that import targetFile (A -> targetFile)
  const directDependents = edges
    .filter((e) => e.target === targetFile)
    .map((e) => e.source);

  // Transitive dependents: reverse BFS from targetFile
  // (files that directly or indirectly import targetFile)
  const incomingMap = new Map();
  for (const edge of edges) {
    if (!incomingMap.has(edge.target)) {
      incomingMap.set(edge.target, []);
    }
    incomingMap.get(edge.target).push(edge.source);
  }

  const visited = new Set();
  const queue = [...directDependents];
  for (const d of directDependents) {
    visited.add(d);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const parents = incomingMap.get(current) || [];
    for (const p of parents) {
      if (p !== targetFile && !visited.has(p)) {
        visited.add(p);
        queue.push(p);
      }
    }
  }

  // Transitive only (excluding direct dependents)
  const transitiveDependents = [...visited].filter((f) => !directDependents.includes(f));

  return {
    file: targetFile,
    directDependencies,
    directDependents,
    transitiveDependents,
    totalAffectedCount: visited.size,
    affectedFiles: Array.from(visited)
  };
}

/**
 * Summarizes files and dependencies by top-level or parent directory
 */
function calculateDirectoryInsights(nodes, edges) {
  const dirMap = new Map();

  for (const node of nodes) {
    const segments = node.path.split('/');
    const dir = segments.length > 1 ? segments.slice(0, segments.length - 1).join('/') : 'root';
    if (!dirMap.has(dir)) {
      dirMap.set(dir, {
        directory: dir,
        fileCount: 0,
        languages: new Set(),
        internalDependencies: 0
      });
    }
    const entry = dirMap.get(dir);
    entry.fileCount++;
    entry.languages.add(node.language);
  }

  // Count internal dependencies originating from or targeting this directory
  for (const edge of edges) {
    const srcSegments = edge.source.split('/');
    const srcDir = srcSegments.length > 1 ? srcSegments.slice(0, srcSegments.length - 1).join('/') : 'root';
    if (dirMap.has(srcDir)) {
      dirMap.get(srcDir).internalDependencies++;
    }
  }

  return Array.from(dirMap.values())
    .map((d) => ({
      ...d,
      languages: Array.from(d.languages)
    }))
    .sort((a, b) => b.fileCount - a.fileCount);
}
