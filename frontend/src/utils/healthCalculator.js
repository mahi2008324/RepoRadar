/**
 * Architectural Health Score & Technical Debt Calculator
 * Analyzes graph cyclicity, coupling density, directory separation, and cleanliness
 */
export function calculateHealthScore(repo) {
  if (!repo || !repo.summary) {
    return {
      score: 100,
      grade: 'A+',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      cyclicityScore: 100,
      couplingScore: 100,
      modularityScore: 100,
      cleanlinessScore: 100,
      density: '0.00',
      insights: [{ type: 'positive', text: 'Clean architectural profile' }]
    };
  }

  const {
    analyzedFilesCount = 0,
    internalEdgesCount = 0,
    cycleCount = 0,
    parseErrorsCount = 0,
    unresolvedImportsCount = 0
  } = repo.summary;

  // 1. Cyclicity (35% weight): Penalizes circular dependency loops
  let cyclicityScore = 100;
  if (cycleCount === 1) cyclicityScore = 65;
  else if (cycleCount === 2) cyclicityScore = 35;
  else if (cycleCount > 2) cyclicityScore = Math.max(0, 30 - (cycleCount - 2) * 10);

  // 2. Coupling Density (25% weight): Ratio of dependencies to files
  const fileCount = analyzedFilesCount || 1;
  const density = internalEdgesCount / fileCount;
  let couplingScore = 100;
  if (density > 3.0) couplingScore = 60;
  else if (density > 2.0) couplingScore = 75;
  else if (density > 1.5) couplingScore = 90;
  else couplingScore = 100;

  // 3. Modularity / Directory Separation (20% weight)
  const dirCount = repo.directorySummary?.length || 1;
  let modularityScore = 90;
  if (dirCount >= 3) modularityScore = 100;
  else if (dirCount === 2) modularityScore = 90;
  else modularityScore = 80;

  // 4. Code Cleanliness (20% weight): Parse errors and unresolved imports
  const totalIssues = (parseErrorsCount || 0) + (unresolvedImportsCount || 0);
  let cleanlinessScore = 100;
  if (totalIssues > 10) cleanlinessScore = 65;
  else if (totalIssues > 3) cleanlinessScore = 80;
  else if (totalIssues > 0) cleanlinessScore = 92;

  // Weighted total score (0 - 100)
  const rawScore = Math.round(
    cyclicityScore * 0.35 +
    couplingScore * 0.25 +
    modularityScore * 0.20 +
    cleanlinessScore * 0.20
  );
  const score = Math.min(100, Math.max(0, rawScore));

  // Determine Letter Grade
  let grade = 'A+';
  let color = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10';
  let borderColor = 'border-emerald-500/30';

  if (score >= 95) {
    grade = 'A+';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10';
    borderColor = 'border-emerald-500/30';
  } else if (score >= 88) {
    grade = 'A';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10';
    borderColor = 'border-emerald-500/30';
  } else if (score >= 80) {
    grade = 'A-';
    color = 'text-teal-400';
    bgColor = 'bg-teal-500/10';
    borderColor = 'border-teal-500/30';
  } else if (score >= 74) {
    grade = 'B+';
    color = 'text-indigo-400';
    bgColor = 'bg-indigo-500/10';
    borderColor = 'border-indigo-500/30';
  } else if (score >= 68) {
    grade = 'B';
    color = 'text-blue-400';
    bgColor = 'bg-blue-500/10';
    borderColor = 'border-blue-500/30';
  } else if (score >= 60) {
    grade = 'C';
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    borderColor = 'border-amber-500/30';
  } else if (score >= 50) {
    grade = 'D';
    color = 'text-orange-400';
    bgColor = 'bg-orange-500/10';
    borderColor = 'border-orange-500/30';
  } else {
    grade = 'F';
    color = 'text-red-400';
    bgColor = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
  }

  // Key architectural insights
  const insights = [];
  if (cycleCount === 0) {
    insights.push({
      type: 'positive',
      text: 'Acyclic Hierarchy: 0 circular dependencies detected. Clean layered architecture.'
    });
  } else {
    insights.push({
      type: 'warning',
      text: `${cycleCount} circular dependency loop(s) detected. Refactor shared interfaces to eliminate runtime cycles.`
    });
  }

  if (density <= 1.5) {
    insights.push({
      type: 'positive',
      text: `Low Coupling Density (${density.toFixed(2)} edges/file). Highly modular structure.`
    });
  } else {
    insights.push({
      type: 'neutral',
      text: `Moderate Coupling Density (${density.toFixed(2)} edges/file) indicating tightly integrated components.`
    });
  }

  if (dirCount >= 3) {
    insights.push({
      type: 'positive',
      text: `Strong Directory Separation across ${dirCount} distinct project subdirectories.`
    });
  }

  return {
    score,
    grade,
    color,
    bgColor,
    borderColor,
    density: density.toFixed(2),
    cyclicityScore,
    couplingScore,
    modularityScore,
    cleanlinessScore,
    insights
  };
}
