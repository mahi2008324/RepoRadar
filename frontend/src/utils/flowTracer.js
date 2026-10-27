/**
 * flowTracer.js
 * Neon Circuit: Live Request & Data-Flow Tracer Engine.
 * 
 * Traverses the AST dependency graph to discover realistic, multi-hop
 * execution pipelines (Client/Route -> Middleware -> Controller -> Model -> DB/Util).
 * Enriches every hop with simulated telemetry, latency, payload states, and layer tags.
 */

/**
 * Classify a node into an architectural layer based on file path and conventions.
 */
export function classifyLayer(path = '') {
  const p = path.toLowerCase();

  if (p.includes('page') || p.includes('view') || p.includes('screen') || p.includes('ui') || p.includes('frontend')) {
    return { name: 'Client View / UI', color: 'from-sky-500 to-blue-600', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
  }
  if (p.includes('route') || p.includes('router') || p.includes('endpoint') || p.includes('api')) {
    return { name: 'Gateway / Route', color: 'from-cyan-500 to-teal-600', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
  }
  if (p.includes('middleware') || p.includes('auth') || p.includes('guard') || p.includes('filter') || p.includes('limit')) {
    return { name: 'Security & Middleware', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  }
  if (p.includes('controller') || p.includes('handler') || p.includes('action') || p.includes('resolver')) {
    return { name: 'Controller / Domain', color: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
  }
  if (p.includes('service') || p.includes('manager') || p.includes('engine') || p.includes('processor')) {
    return { name: 'Service / Engine', color: 'from-purple-500 to-pink-600', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
  }
  if (p.includes('model') || p.includes('schema') || p.includes('entity') || p.includes('dao')) {
    return { name: 'Data Model / Schema', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  }
  if (p.includes('db') || p.includes('database') || p.includes('store') || p.includes('sql') || p.includes('mongo') || p.includes('redis')) {
    return { name: 'Persistence Store', color: 'from-rose-500 to-red-600', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  }
  return { name: 'Core Foundation', color: 'from-slate-500 to-slate-700', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
}

/**
 * Generate human-readable runtime action description based on node layer & path.
 */
function getActionDescription(path, index, totalSteps) {
  const p = path.toLowerCase();
  const fileName = path.split('/').pop();

  if (index === 0) {
    return `Inbound Request Gateway: Ingests external call into '${fileName}' and dispatches pipeline context.`;
  }
  if (index === totalSteps - 1) {
    return `Terminal Persistence / Exit: Commits atomic operation or outputs formatted data packet.`;
  }
  if (p.includes('middleware') || p.includes('auth')) {
    return `Security Inspection: Enforces JWT bearer credentials, decrypts headers, and verifies rate limiter quotas.`;
  }
  if (p.includes('controller') || p.includes('handler')) {
    return `Business Logic Execution: Dispatches domain workflow, validates request parameters, and orchestrates calls.`;
  }
  if (p.includes('model') || p.includes('schema')) {
    return `Schema Validation: Verifies entity data types, casts attributes, and indexes query filters.`;
  }
  if (p.includes('service') || p.includes('api')) {
    return `Service Integration: Coordinates async operations, handles caching, and aggregates responses.`;
  }
  if (p.includes('db') || p.includes('database')) {
    return `Persistence Gateway: Executes query with active connection pool, ensuring ACID transaction integrity.`;
  }
  return `Internal Module Resolution: Transits through '${fileName}' executing specialized functional transforms.`;
}

/**
 * Generate realistic simulated payload telemetry for a specific step.
 */
function generateStepTelemetry(path, index, totalSteps) {
  const isStart = index === 0;
  const isEnd = index === totalSteps - 1;
  const latency = Math.floor(Math.random() * 18) + 4; // 4 - 22 ms

  const telemetry = {
    stepId: index + 1,
    latencyMs: latency,
    securityCheck: index === 0 ? 'TLS_VERIFIED' : (index === 1 ? 'TOKEN_ACTIVE' : 'SCHEMA_PASSED'),
    packetSizeKb: (Math.random() * 1.5 + 0.8).toFixed(2),
    headers: {
      'x-correlation-id': `flow_${Math.random().toString(36).substring(2, 9)}`,
      'content-type': 'application/json',
      'x-hop-count': `${index + 1}/${totalSteps}`
    },
    payloadState: isStart ? {
      event: 'INBOUND_HTTP_REQUEST',
      origin: 'client_gateway',
      method: 'POST',
      status: 'PROCESSING'
    } : isEnd ? {
      event: 'PERSISTENCE_CONFIRMED',
      operation: 'TRANSACTION_COMMITTED',
      result: 'SUCCESS_200_OK',
      recordsAffected: 1
    } : {
      event: 'PIPELINE_TRANSIT',
      layerAction: 'EXECUTE_TRANSFORM',
      parametersValidated: true,
      subroutinesResolved: 2
    }
  };

  return telemetry;
}

/**
 * Discover distinct, interesting multi-hop execution flow scenarios in the graph.
 */
export function discoverCircuitScenarios(repository) {
  if (!repository) return [];

  const rawNodes = (Array.isArray(repository.nodes) && repository.nodes.length > 0)
    ? repository.nodes
    : (Array.isArray(repository.files) && repository.files.length > 0)
      ? repository.files.map(f => {
          const path = typeof f === 'string' ? f : (f.path || f.name || String(f));
          return { id: path, path, label: path.split('/').pop() };
        })
      : [];

  if (rawNodes.length === 0) return [];

  const rawEdges = repository.edges || [];

  // Build directed adjacency list
  const adj = new Map();
  rawNodes.forEach(n => adj.set(n.id, []));
  rawEdges.forEach(e => {
    if (adj.has(e.source)) {
      adj.get(e.source).push(e.target);
    }
  });

  const nodeMap = new Map();
  rawNodes.forEach(n => nodeMap.set(n.id, n));

  // Find paths using Depth-First Search with depth limit
  const allPaths = [];
  const maxDepth = 6;

  function dfs(currId, pathSoFar, visited) {
    if (pathSoFar.length >= maxDepth) {
      allPaths.push([...pathSoFar]);
      return;
    }

    const neighbors = adj.get(currId) || [];
    let hasUnvisited = false;

    for (const nextId of neighbors) {
      if (!visited.has(nextId) && nodeMap.has(nextId)) {
        hasUnvisited = true;
        visited.add(nextId);
        pathSoFar.push(nextId);
        dfs(nextId, pathSoFar, visited);
        pathSoFar.pop();
        visited.delete(nextId);
      }
    }

    if (!hasUnvisited && pathSoFar.length >= 2) {
      allPaths.push([...pathSoFar]);
    }
  }

  // Identify prioritized starting nodes: entrypoints, routes, pages, app
  const startCandidates = rawNodes.filter(n => {
    const p = (n.path || n.id).toLowerCase();
    return p.includes('route') || p.includes('app') || p.includes('index') || p.includes('server') ||
           p.includes('page') || p.includes('main') || p.includes('api') || p.includes('entry');
  });

  const rootsToTry = startCandidates.length > 0 ? startCandidates : rawNodes.slice(0, 10);

  rootsToTry.forEach(rootNode => {
    const visited = new Set([rootNode.id]);
    dfs(rootNode.id, [rootNode.id], visited);
  });

  // If graph is sparse or disconnected, fallback to longest or synthetic multi-hop chains
  if (allPaths.length === 0) {
    if (rawNodes.length >= 3) {
      allPaths.push([rawNodes[0].id, rawNodes[1].id, rawNodes[2].id]);
    } else if (rawNodes.length === 2) {
      allPaths.push([rawNodes[0].id, rawNodes[1].id]);
    } else {
      allPaths.push([rawNodes[0].id]);
    }
  }

  // Deduplicate and rank paths by depth and layer diversity
  allPaths.sort((a, b) => b.length - a.length);

  // Group paths into curated scenarios
  const scenarios = [];

  // Scenario 1: Longest Critical Path / Deepest Execution Pipe
  const longestPathIds = allPaths[0];
  if (longestPathIds) {
    scenarios.push(buildScenario(
      'critical-pipeline',
      '⚡ Critical End-to-End Pipeline',
      'Deepest multi-hop transactional execution path across the codebase topology.',
      longestPathIds,
      nodeMap
    ));
  }

  // Scenario 2: API & Routing Flow (if distinct)
  const apiPathIds = allPaths.find(path => {
    return path.some(id => {
      const p = (nodeMap.get(id)?.path || id).toLowerCase();
      return p.includes('route') || p.includes('api') || p.includes('controller');
    });
  });
  if (apiPathIds && apiPathIds !== longestPathIds) {
    scenarios.push(buildScenario(
      'api-route-flow',
      '🌐 Inbound API & Domain Route',
      'External request ingestion through routing gateways, controllers, and domain managers.',
      apiPathIds,
      nodeMap
    ));
  }

  // Scenario 3: Database & Persistence Flow (if distinct)
  const dbPathIds = allPaths.find(path => {
    return path.some(id => {
      const p = (nodeMap.get(id)?.path || id).toLowerCase();
      return p.includes('model') || p.includes('db') || p.includes('store') || p.includes('schema');
    });
  });
  if (dbPathIds && dbPathIds !== longestPathIds && dbPathIds !== apiPathIds) {
    scenarios.push(buildScenario(
      'persistence-flow',
      '💾 Schema & Data Persistence Pipeline',
      'State mutation, schema constraint validation, and persistent storage write cycle.',
      dbPathIds,
      nodeMap
    ));
  }

  // Scenario 4: UI Component to State Flow (if frontend files exist)
  const uiPathIds = allPaths.find(path => {
    return path.some(id => {
      const p = (nodeMap.get(id)?.path || id).toLowerCase();
      return p.includes('page') || p.includes('component') || p.includes('context') || p.includes('view');
    });
  });
  if (uiPathIds && !scenarios.some(s => s.pathIds.join(',') === uiPathIds.join(','))) {
    scenarios.push(buildScenario(
      'ui-state-flow',
      '🎨 User Interaction & State Lifecycle',
      'Client component action dispatch propagating into context stores and network layers.',
      uiPathIds,
      nodeMap
    ));
  }

  // Ensure at least 1 scenario
  if (scenarios.length === 0 && longestPathIds) {
    scenarios.push(buildScenario(
      'default-circuit',
      '⚡ Active Execution Circuit',
      'Demonstrates real-time dependency traversal and data packet propagation.',
      longestPathIds,
      nodeMap
    ));
  }

  return scenarios;
}

/**
 * Build rich scenario object with hops, timing, and cumulative stats
 */
function buildScenario(id, title, description, nodeIds, nodeMap) {
  let cumulativeLatency = 0;

  const hops = nodeIds.map((nodeId, idx) => {
    const rawNode = nodeMap.get(nodeId) || { id: nodeId, path: nodeId };
    const path = rawNode.path || rawNode.label || nodeId;
    const fileName = path.split('/').pop();
    const layer = classifyLayer(path);
    const telemetry = generateStepTelemetry(path, idx, nodeIds.length);
    const action = getActionDescription(path, idx, nodeIds.length);

    cumulativeLatency += telemetry.latencyMs;

    return {
      stepIndex: idx,
      nodeId,
      path,
      fileName,
      layer,
      action,
      telemetry,
      cumulativeLatencyMs: cumulativeLatency
    };
  });

  return {
    id,
    title,
    description,
    pathIds: nodeIds,
    totalHops: hops.length,
    totalEstimatedLatencyMs: cumulativeLatency,
    hops
  };
}

/**
 * Generate audio blip synthesizer for realistic circuit pulses using Web Audio API
 */
export function playCircuitPulseSound(freq = 520, duration = 0.08) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext blocked or not supported - silently ignore
  }
}
