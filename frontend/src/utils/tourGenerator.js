/**
 * tourGenerator.js
 * Algorithmic Codebase Storyteller & Guided Onboarding Tour Generator.
 * Analyzes repository nodes and edges to break the codebase down into
 * 5 logical architectural tiers for instant developer onboarding.
 */

export function generateOnboardingTour(repository) {
  if (!repository || !Array.isArray(repository.nodes)) {
    return [];
  }

  const nodes = repository.nodes;
  const edges = repository.edges || [];

  // Helper: Get node inDegree and outDegree
  const degreeMap = new Map();
  nodes.forEach(n => degreeMap.set(n.id, { in: 0, out: 0 }));
  edges.forEach(e => {
    const src = degreeMap.get(e.source);
    const tgt = degreeMap.get(e.target);
    if (src) src.out++;
    if (tgt) tgt.in++;
  });

  const getTierFiles = (predicate) => {
    return nodes
      .filter(predicate)
      .map(n => {
        const deg = degreeMap.get(n.id) || { in: 0, out: 0 };
        return {
          id: n.id,
          path: n.path || n.label || n.id,
          name: (n.path || n.label || n.id).split('/').pop(),
          directory: (n.path || n.label || n.id).includes('/')
            ? (n.path || n.label || n.id).split('/').slice(0, -1).join('/')
            : 'root',
          inDegree: deg.in,
          outDegree: deg.out,
          isHub: deg.in >= 3
        };
      })
      .sort((a, b) => (b.inDegree + b.outDegree) - (a.inDegree + a.outDegree));
  };

  // 1. Entrypoints & Bootstrap
  const entryFiles = getTierFiles(n => {
    const p = (n.path || n.label || '').toLowerCase();
    return /^(src\/)?(index|main|server|app)\.(js|jsx|ts|tsx)$/i.test(p) ||
           p.endsWith('/index.js') ||
           p.endsWith('/main.jsx') ||
           p.endsWith('/server.js');
  });

  // 2. Routing & Navigation
  const routingFiles = getTierFiles(n => {
    const p = (n.path || n.label || '').toLowerCase();
    return (p.includes('route') || p.includes('page') || p.includes('router') || p.includes('app.jsx') || p.includes('app.tsx')) &&
           !entryFiles.some(ef => ef.id === n.id);
  });

  // 3. Business Logic, State & Controllers
  const logicFiles = getTierFiles(n => {
    const p = (n.path || n.label || '').toLowerCase();
    return (p.includes('controller') || p.includes('service') || p.includes('context') ||
            p.includes('store') || p.includes('redux') || p.includes('hook') || p.includes('action')) &&
           !entryFiles.some(ef => ef.id === n.id) &&
           !routingFiles.some(rf => rf.id === n.id);
  });

  // 4. Data Layer & Models
  const dataFiles = getTierFiles(n => {
    const p = (n.path || n.label || '').toLowerCase();
    return (p.includes('model') || p.includes('schema') || p.includes('db') ||
            p.includes('entity') || p.includes('database') || p.includes('repo')) &&
           !entryFiles.some(ef => ef.id === n.id) &&
           !routingFiles.some(rf => rf.id === n.id) &&
           !logicFiles.some(lf => lf.id === n.id);
  });

  // 5. UI Components & Reusable Utilities
  const uiUtilFiles = getTierFiles(n => {
    return !entryFiles.some(ef => ef.id === n.id) &&
           !routingFiles.some(rf => rf.id === n.id) &&
           !logicFiles.some(lf => lf.id === n.id) &&
           !dataFiles.some(df => df.id === n.id);
  });

  const steps = [];

  // Step 1: Entrypoint
  steps.push({
    stepNumber: 1,
    title: 'Application Bootstrap & Entrypoints',
    shortName: 'Bootstrap',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    iconName: 'PlayCircle',
    headline: 'Where execution begins and runtime environments initialize.',
    description: `This application bootstraps execution through ${entryFiles.length || 1} identified entrypoint(s). Here, configuration environments, root handlers, and middleware bindings are wired together.`,
    files: entryFiles.length ? entryFiles.slice(0, 6) : nodes.slice(0, 3),
    architectureTip: 'Start your onboarding by reading these entrypoints to trace how global configurations and context providers are initialized.'
  });

  // Step 2: Routing
  steps.push({
    stepNumber: 2,
    title: 'Routing & Navigation Dispatchers',
    shortName: 'Routing',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    iconName: 'Navigation',
    headline: 'The traffic control layer directing incoming requests to views and handlers.',
    description: `Discovered ${routingFiles.length} routing and presentation modules. These files parse path parameters, guard protected routes, and dispatch control flow.`,
    files: routingFiles.length ? routingFiles.slice(0, 6) : nodes.slice(0, 4),
    architectureTip: 'Look here to map out the user journeys, API endpoints, and view hierarchies supported by this codebase.'
  });

  // Step 3: Business Logic
  steps.push({
    stepNumber: 3,
    title: 'Core Business Logic & State Handlers',
    shortName: 'Logic & State',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    iconName: 'Cpu',
    headline: 'The domain brain processing workflows, state transformations, and rules.',
    description: `Found ${logicFiles.length} business logic and controller files. These modules execute business rules, orchestrate third-party services, and update reactive state.`,
    files: logicFiles.length ? logicFiles.slice(0, 6) : nodes.slice(0, 4),
    architectureTip: 'These files represent the core intellectual property of the project—mastering them gives you full understanding of application behavior.'
  });

  // Step 4: Data Layer
  steps.push({
    stepNumber: 4,
    title: 'Data Tier & Domain Schemas',
    shortName: 'Data & Schemas',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    iconName: 'Database',
    headline: 'Data models defining entities, relations, and persistence interfaces.',
    description: `Contains ${dataFiles.length} data modeling and persistence interfaces governing how data is validated, structured, and saved.`,
    files: dataFiles.length ? dataFiles.slice(0, 6) : nodes.slice(0, 4),
    architectureTip: 'Reviewing domain schemas early clarifies entity relationships and prevents schema design misconceptions.'
  });

  // Step 5: UI & Utilities
  steps.push({
    stepNumber: 5,
    title: 'Component Library & Reusable Utilities',
    shortName: 'UI & Helpers',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    iconName: 'Layers',
    headline: 'Shared atomic components, helper math, and pure utility functions.',
    description: `Comprises ${uiUtilFiles.length} modular components and utility files that provide foundational services to all top-level layers.`,
    files: uiUtilFiles.length ? uiUtilFiles.slice(0, 6) : nodes.slice(0, 4),
    architectureTip: 'Check the utility layer before writing new code to avoid reinventing helpers or UI components that already exist.'
  });

  return steps;
}
