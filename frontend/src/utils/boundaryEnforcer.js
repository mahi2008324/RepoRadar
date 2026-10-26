/**
 * boundaryEnforcer.js
 * Architectural Layer & Clean Architecture Boundary Enforcer.
 * Checks import connections against architectural hierarchy rules
 * to detect illegal cross-layer coupling and boundary leaks.
 */

export function classifyFileLayer(filePath) {
  if (!filePath) return 'UNKNOWN';
  const p = filePath.toLowerCase();

  if (p.includes('/model') || p.includes('/schema') || p.includes('/db') || p.includes('/entity') || p.includes('/entities')) {
    return 'PERSISTENCE';
  }
  if (p.includes('/service') || p.includes('/usecase') || p.includes('/logic') || p.includes('/business')) {
    return 'SERVICES';
  }
  if (p.includes('/controller') || p.includes('/handler') || p.includes('/endpoint')) {
    return 'CONTROLLERS';
  }
  if (p.includes('/page') || p.includes('/view') || p.includes('/route') || p.includes('app.jsx') || p.includes('app.tsx')) {
    return 'PRESENTATION';
  }
  if (p.includes('/component') || p.includes('/ui/') || p.includes('/widgets')) {
    return 'COMPONENTS';
  }
  if (p.includes('/util') || p.includes('/helper') || p.includes('/lib') || p.includes('/common')) {
    return 'UTILITIES';
  }

  return 'CORE';
}

const RULES = [
  {
    id: 'RULE_MODEL_PURITY',
    name: 'Domain Model Isolation',
    severity: 'CRITICAL',
    description: 'Persistence models and schemas must remain pure and cannot import upper-level Controllers, Services, or Views.',
    isViolated: (fromLayer, toLayer) => {
      return fromLayer === 'PERSISTENCE' && ['CONTROLLERS', 'SERVICES', 'PRESENTATION'].includes(toLayer);
    },
    remediation: 'Pass service dependencies into model methods or decouple by dispatching events.'
  },
  {
    id: 'RULE_PURE_UTILS',
    name: 'Pure Utility Independence',
    severity: 'HIGH',
    description: 'Foundational utilities must remain stateless and cannot import UI components, Controllers, or Pages.',
    isViolated: (fromLayer, toLayer) => {
      return fromLayer === 'UTILITIES' && ['COMPONENTS', 'PRESENTATION', 'CONTROLLERS'].includes(toLayer);
    },
    remediation: 'Move business-specific logic out of general utilities, or pass required state as function parameters.'
  },
  {
    id: 'RULE_COMPONENT_REUSABILITY',
    name: 'Component Portability',
    severity: 'HIGH',
    description: 'Reusable atomic UI components should never import full Application Pages or Top-Level Routing dispatchers.',
    isViolated: (fromLayer, toLayer) => {
      return fromLayer === 'COMPONENTS' && toLayer === 'PRESENTATION';
    },
    remediation: 'Lift routing logic up into parent page views and pass handlers via component props.'
  },
  {
    id: 'RULE_PRESENTATION_TO_MODELS',
    name: 'Presentation Direct Schema Bypass',
    severity: 'MODERATE',
    description: 'UI Views and Pages should communicate through Services or Controllers rather than importing raw database models directly.',
    isViolated: (fromLayer, toLayer) => {
      return fromLayer === 'PRESENTATION' && toLayer === 'PERSISTENCE';
    },
    remediation: 'Wrap database access in dedicated service APIs or controllers to encapsulate persistence details.'
  }
];

export function auditLayerBoundaries(repository) {
  if (!repository) {
    return { score: 100, totalViolations: 0, violations: [], layerDistribution: {} };
  }

  const nodes = repository.nodes || [];
  const edges = repository.edges || [];

  // Map node ID to path and layer
  const nodeLayerMap = new Map();
  const layerDistribution = {
    PERSISTENCE: 0,
    SERVICES: 0,
    CONTROLLERS: 0,
    PRESENTATION: 0,
    COMPONENTS: 0,
    UTILITIES: 0,
    CORE: 0
  };

  nodes.forEach(node => {
    const path = node.path || node.label || node.id;
    const layer = classifyFileLayer(path);
    nodeLayerMap.set(node.id, { path, layer });
    if (layerDistribution[layer] !== undefined) {
      layerDistribution[layer]++;
    }
  });

  const violations = [];

  // Check each dependency edge against architectural rules
  edges.forEach(edge => {
    const from = nodeLayerMap.get(edge.source);
    const to = nodeLayerMap.get(edge.target);

    if (from && to && from.layer !== 'UNKNOWN' && to.layer !== 'UNKNOWN') {
      RULES.forEach(rule => {
        if (rule.isViolated(from.layer, to.layer)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            sourceFile: from.path,
            sourceLayer: from.layer,
            targetFile: to.path,
            targetLayer: to.layer,
            description: rule.description,
            remediation: rule.remediation
          });
        }
      });
    }
  });

  // Calculate layer compliance score (0-100)
  const edgeCount = Math.max(1, edges.length);
  const penalty = violations.reduce((acc, v) => {
    if (v.severity === 'CRITICAL') return acc + 15;
    if (v.severity === 'HIGH') return acc + 8;
    return acc + 4;
  }, 0);

  const complianceScore = Math.max(0, Math.min(100, Math.round(100 - (penalty / edgeCount) * 100)));

  return {
    score: complianceScore,
    totalViolations: violations.length,
    violations,
    layerDistribution
  };
}
