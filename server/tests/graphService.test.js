import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildGraphAndMetrics,
  detectCycles,
  calculateFileImpact
} from '../src/services/graphService.js';

describe('Graph Analysis & Algorithms', () => {
  it('should build directed graph with correct degrees and deduplication', () => {
    const files = [
      { path: 'src/App.js', language: 'JavaScript' },
      { path: 'src/Header.js', language: 'JavaScript' },
      { path: 'src/Footer.js', language: 'JavaScript' },
      { path: 'src/Unused.js', language: 'JavaScript' }
    ];

    const edges = [
      { source: 'src/App.js', target: 'src/Header.js' },
      { source: 'src/App.js', target: 'src/Footer.js' },
      // Duplicate edge should be deduplicated
      { source: 'src/App.js', target: 'src/Header.js' }
    ];

    const { nodes, edges: graphEdges, metrics } = buildGraphAndMetrics(files, edges);

    assert.strictEqual(nodes.length, 4);
    assert.strictEqual(graphEdges.length, 2);

    const appNode = nodes.find((n) => n.path === 'src/App.js');
    const headerNode = nodes.find((n) => n.path === 'src/Header.js');

    assert.strictEqual(appNode.outDegree, 2);
    assert.strictEqual(appNode.inDegree, 0);

    assert.strictEqual(headerNode.inDegree, 1);
    assert.strictEqual(headerNode.outDegree, 0);

    // Disconnected file
    assert.strictEqual(metrics.disconnectedFiles.length, 1);
    assert.strictEqual(metrics.disconnectedFiles[0].path, 'src/Unused.js');
  });

  it('should accurately detect simple cycles (A -> B -> A)', () => {
    const adj = new Map([
      ['A', new Set(['B'])],
      ['B', new Set(['A'])],
      ['C', new Set()]
    ]);

    const cycles = detectCycles(adj);
    assert.strictEqual(cycles.length, 1);
    const cycle = cycles[0];
    assert.strictEqual(cycle[0], cycle[cycle.length - 1]);
    assert.ok(cycle.includes('A') && cycle.includes('B'));
  });

  it('should accurately detect 3-node cycles (A -> B -> C -> A)', () => {
    const adj = new Map([
      ['A', new Set(['B'])],
      ['B', new Set(['C'])],
      ['C', new Set(['A'])],
      ['D', new Set(['A'])]
    ]);

    const cycles = detectCycles(adj);
    assert.strictEqual(cycles.length, 1);
    assert.strictEqual(cycles[0].length, 4); // A -> B -> C -> A
  });

  it('should return empty cycles for DAG (directed acyclic graph)', () => {
    const adj = new Map([
      ['A', new Set(['B', 'C'])],
      ['B', new Set(['C'])],
      ['C', new Set([])]
    ]);

    const cycles = detectCycles(adj);
    assert.strictEqual(cycles.length, 0);
  });

  it('should calculate file impact (direct and transitive dependents)', () => {
    // Chain: D -> C -> B -> A (D imports C, C imports B, B imports A)
    // If A changes:
    // Direct dependent: B
    // Direct dependency of A: none
    // Transitive dependents: C, D
    // Total affected: 3 (B, C, D)
    const edges = [
      { source: 'D', target: 'C' },
      { source: 'C', target: 'B' },
      { source: 'B', target: 'A' },
      { source: 'A', target: 'Utils' }
    ];

    const impact = calculateFileImpact('A', edges);

    assert.strictEqual(impact.file, 'A');
    assert.deepStrictEqual(impact.directDependencies, ['Utils']);
    assert.deepStrictEqual(impact.directDependents, ['B']);
    assert.ok(impact.transitiveDependents.includes('C'));
    assert.ok(impact.transitiveDependents.includes('D'));
    assert.strictEqual(impact.totalAffectedCount, 3);
  });
});
