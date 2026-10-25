/**
 * securityScanner.js
 * Supply Chain Security & CVE Blast Radius Heatmap Analyzer.
 * Identifies vulnerable npm packages and calculates their blast radius
 * (the exact files in the codebase that import or depend on them).
 */

const VULNERABILITY_DATABASE = {
  lodash: {
    cve: 'CVE-2021-23337',
    severity: 'HIGH',
    cvss: 7.5,
    title: 'Prototype Pollution & Command Injection',
    description: 'Vulnerable to prototype pollution in template and zipObjectDeep methods, potentially allowing attackers to modify JavaScript prototypes or execute arbitrary code.',
    affectedVersions: '< 4.17.21',
    safeVersion: '>= 4.17.21',
    attackVector: 'User-controlled JSON objects passed to deep merge or template formatting functions.'
  },
  axios: {
    cve: 'CVE-2023-45857',
    severity: 'MEDIUM',
    cvss: 6.5,
    title: 'Server-Side Request Forgery (SSRF) & Header Leakage',
    description: 'Cross-site request redirect header leakage allows confidential authorization tokens to be transmitted to third-party endpoints.',
    affectedVersions: '< 1.6.0',
    safeVersion: '>= 1.6.0',
    attackVector: 'Following 302 redirects containing sensitive Authorization or Cookie headers.'
  },
  jsonwebtoken: {
    cve: 'CVE-2022-23529',
    severity: 'CRITICAL',
    cvss: 9.8,
    title: 'Insecure Key Retrieval & Remote Code Execution',
    description: 'Insecure toString method on secret/key objects allows arbitrary file read or code execution if untrusted keys are passed to jwt.verify.',
    affectedVersions: '< 9.0.0',
    safeVersion: '>= 9.0.0',
    attackVector: 'Malicious objects passed to verification methods instead of standard strings or buffers.'
  },
  express: {
    cve: 'CVE-2024-43796',
    severity: 'MEDIUM',
    cvss: 5.3,
    title: 'URL Parsing Ambiguity & Open Redirect',
    description: 'Mishandled path encoding in redirect methods can cause open redirects or bypass authentication filters.',
    affectedVersions: '< 4.19.2',
    safeVersion: '>= 4.19.2',
    attackVector: 'Unsanitized input passed directly to res.redirect().'
  },
  minimatch: {
    cve: 'CVE-2022-3517',
    severity: 'HIGH',
    cvss: 7.5,
    title: 'Regular Expression Denial of Service (ReDoS)',
    description: 'Specially crafted regex glob patterns cause catastrophic backtracking, freezing the event loop.',
    affectedVersions: '< 3.0.5',
    safeVersion: '>= 3.0.5',
    attackVector: 'User input passed directly into file globbing patterns.'
  },
  moment: {
    cve: 'CVE-2022-24785',
    severity: 'HIGH',
    cvss: 7.5,
    title: 'Path Traversal in Locale Loading',
    description: 'User-supplied locale strings can traverse the file system and load arbitrary JavaScript files.',
    affectedVersions: '< 2.29.2',
    safeVersion: '>= 2.29.4',
    attackVector: 'Dynamic moment.locale(userInput) without strict whitelist.'
  },
  cookie: {
    cve: 'CVE-2024-47764',
    severity: 'LOW',
    cvss: 3.7,
    title: 'Out of Bounds Cookie Name Serialization',
    description: 'Cookie names containing control characters can lead to malformed HTTP headers.',
    affectedVersions: '< 0.7.0',
    safeVersion: '>= 0.7.0',
    attackVector: 'Unvalidated cookie keys accepted from clients.'
  }
};

export function analyzeSecuritySupplyChain(repository) {
  if (!repository) return { totalVulnerabilities: 0, packageAudits: [], overallRisk: 'LOW', exposedFilesCount: 0 };

  const nodes = repository.nodes || [];
  const externalMap = new Map(); // pkgName -> Set of filePaths

  // Collect which files import each external package
  nodes.forEach(node => {
    const filePath = node.path || node.label || node.id;
    const imports = node.externalImports || [];
    imports.forEach(pkg => {
      // Normalize package name (e.g., "lodash/get" -> "lodash")
      const cleanPkg = pkg.startsWith('@')
        ? pkg.split('/').slice(0, 2).join('/')
        : pkg.split('/')[0];

      if (!externalMap.has(cleanPkg)) {
        externalMap.set(cleanPkg, new Set());
      }
      externalMap.get(cleanPkg).add(filePath);
    });
  });

  const packageAudits = [];
  let totalExposedFiles = new Set();
  let hasCritical = false;
  let hasHigh = false;

  for (const [pkgName, consumerFiles] of externalMap.entries()) {
    const advisory = VULNERABILITY_DATABASE[pkgName.toLowerCase()];
    const consumers = Array.from(consumerFiles);

    if (advisory) {
      consumers.forEach(f => totalExposedFiles.add(f));
      if (advisory.severity === 'CRITICAL') hasCritical = true;
      if (advisory.severity === 'HIGH') hasHigh = true;

      // Calculate blast score: how many files + whether files touch controllers/auth
      const isAuthExposed = consumers.some(f => f.includes('auth') || f.includes('token') || f.includes('login'));
      const blastScore = Math.min(100, (consumers.length * 15) + (isAuthExposed ? 30 : 10));

      packageAudits.push({
        packageName: pkgName,
        isVulnerable: true,
        advisory,
        blastScore,
        consumerCount: consumers.length,
        consumerFiles: consumers,
        severity: advisory.severity,
        cvss: advisory.cvss,
        recommendation: `Upgrade ${pkgName} to ${advisory.safeVersion} to mitigate ${advisory.cve}.`
      });
    } else {
      // Clean / No known critical advisory
      packageAudits.push({
        packageName: pkgName,
        isVulnerable: false,
        advisory: null,
        blastScore: Math.min(100, consumers.length * 5),
        consumerCount: consumers.length,
        consumerFiles: consumers,
        severity: 'CLEAN',
        cvss: 0,
        recommendation: `No active high-severity CVEs recorded for ${pkgName}.`
      });
    }
  }

  // Sort vulnerable packages first, then by severity
  packageAudits.sort((a, b) => {
    if (a.isVulnerable && !b.isVulnerable) return -1;
    if (!a.isVulnerable && b.isVulnerable) return 1;
    return b.cvss - a.cvss;
  });

  const totalVulnerabilities = packageAudits.filter(p => p.isVulnerable).length;
  const overallRisk = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : totalVulnerabilities > 0 ? 'MEDIUM' : 'LOW';

  return {
    totalVulnerabilities,
    totalPackagesAnalyzed: packageAudits.length,
    exposedFilesCount: totalExposedFiles.size,
    overallRisk,
    packageAudits
  };
}
