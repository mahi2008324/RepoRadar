/**
 * Repository Controller adhering to repository.controller.js naming convention
 */
import { RepositoryAnalysis } from '../models/repository.model.js';
import { analyzeRepository } from '../services/repositoryAnalyzer.js';
import { calculateFileImpact } from '../services/graphService.js';
import { parseGitHubUrl } from '../utils/githubUrl.js';

export const repositoryController = {
  /**
   * POST /api/repositories/analyze
   */
  async analyze(req, res, next) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, message: 'Repository URL is required.' });
      }

      const validation = parseGitHubUrl(url);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.error });
      }

      console.log(`[Analyzer] Starting analysis for ${validation.fullPath}...`);
      const analysisResult = await analyzeRepository(url);

      const savedDoc = await RepositoryAnalysis.saveAnalysis(analysisResult);
      const recordId = savedDoc._id || savedDoc.id;

      return res.status(200).json({
        success: true,
        message: 'Repository successfully analyzed and persisted.',
        id: recordId,
        metadata: analysisResult.metadata,
        summary: analysisResult.summary
      });
    } catch (err) {
      console.error('[Analyzer Error]:', err.message);
      return res.status(err.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: err.message || 'An error occurred during repository analysis.'
      });
    }
  },

  /**
   * GET /api/repositories
   */
  async list(req, res, next) {
    try {
      const search = req.query.search || '';
      const repos = await RepositoryAnalysis.find({ search });

      let totalSourceFiles = 0;
      let totalDependencies = 0;

      const formattedRepos = repos.map((repo) => {
        totalSourceFiles += repo.summary?.analyzedFilesCount || 0;
        totalDependencies += repo.summary?.internalEdgesCount || 0;

        return {
          id: repo._id || repo.id,
          name: repo.name,
          owner: repo.owner,
          fullPath: repo.fullPath,
          url: repo.url,
          defaultBranch: repo.defaultBranch,
          description: repo.description,
          primaryLanguage: repo.primaryLanguage,
          stars: repo.stars,
          size: repo.size,
          analyzedAt: repo.analyzedAt,
          summary: repo.summary,
          status: repo.status || 'completed'
        };
      });

      return res.json({
        success: true,
        count: formattedRepos.length,
        stats: {
          repositoriesCount: formattedRepos.length,
          sourceFilesAnalyzed: totalSourceFiles,
          dependenciesDiscovered: totalDependencies,
          completedAnalyses: formattedRepos.filter(r => r.status === 'completed').length
        },
        repositories: formattedRepos
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id
   */
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await RepositoryAnalysis.findById(id);

      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis record not found.' });
      }

      return res.json({
        success: true,
        repository: {
          id: repo._id || repo.id,
          owner: repo.owner,
          name: repo.name,
          fullPath: repo.fullPath,
          url: repo.url,
          defaultBranch: repo.defaultBranch,
          description: repo.description,
          primaryLanguage: repo.primaryLanguage,
          stars: repo.stars,
          forks: repo.forks,
          size: repo.size,
          analyzedAt: repo.analyzedAt,
          summary: repo.summary,
          languages: repo.languages,
          directorySummary: repo.directorySummary,
          files: repo.files || [],
          cyclesCount: repo.cycles?.length || 0,
          parseErrors: repo.parseErrors || [],
          unresolvedImports: repo.unresolvedImports || [],
          externalPackages: repo.externalPackages || []
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id/files
   */
  async getFiles(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await RepositoryAnalysis.findById(id);

      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis not found.' });
      }

      return res.json({
        success: true,
        files: repo.files || [],
        allFiles: repo.allFiles || []
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id/files/content?path=...
   */
  async getFileContent(req, res, next) {
    try {
      const { id } = req.params;
      const filePath = req.query.path;

      if (!filePath) {
        return res.status(400).json({ success: false, message: 'File path query parameter is required.' });
      }

      const repo = await RepositoryAnalysis.findById(id);
      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis not found.' });
      }

      let content = null;
      if (repo.fileContents) {
        if (Array.isArray(repo.fileContents)) {
          const match = repo.fileContents.find(f => f.path === filePath);
          content = match ? match.content : null;
        } else if (typeof repo.fileContents.get === 'function') {
          content = repo.fileContents.get(filePath);
        } else {
          content = repo.fileContents[filePath];
        }
      }

      if (content === undefined || content === null) {
        return res.status(404).json({
          success: false,
          message: `Source content for '${filePath}' was not cached or is not a supported text file.`
        });
      }

      return res.json({
        success: true,
        path: filePath,
        content
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id/graph
   */
  async getGraph(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await RepositoryAnalysis.findById(id);

      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis not found.' });
      }

      return res.json({
        success: true,
        nodes: repo.nodes || [],
        edges: repo.edges || [],
        summary: repo.summary
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id/analysis
   */
  async getAnalysis(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await RepositoryAnalysis.findById(id);

      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis not found.' });
      }

      const nodes = repo.nodes || [];
      const edges = repo.edges || [];

      const mostImported = [...nodes]
        .filter((n) => n.inDegree > 0)
        .sort((a, b) => b.inDegree - a.inDegree)
        .slice(0, 15);

      const mostDependent = [...nodes]
        .filter((n) => n.outDegree > 0)
        .sort((a, b) => b.outDegree - a.outDegree)
        .slice(0, 15);

      const disconnectedFiles = nodes.filter((n) => n.inDegree === 0 && n.outDegree === 0);

      return res.json({
        success: true,
        analysis: {
          mostImported,
          mostDependent,
          cycles: repo.cycles || [],
          disconnectedFiles,
          directorySummary: repo.directorySummary || [],
          externalPackages: repo.externalPackages || [],
          parseErrors: repo.parseErrors || [],
          unresolvedImports: repo.unresolvedImports || [],
          summary: repo.summary
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/repositories/:id/impact?file=...
   */
  async getImpact(req, res, next) {
    try {
      const { id } = req.params;
      const targetFile = req.query.file;

      if (!targetFile) {
        return res.status(400).json({ success: false, message: 'File query parameter is required.' });
      }

      const repo = await RepositoryAnalysis.findById(id);
      if (!repo) {
        return res.status(404).json({ success: false, message: 'Repository analysis not found.' });
      }

      const impact = calculateFileImpact(targetFile, repo.edges || []);
      return res.json({
        success: true,
        impact
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/repositories/:id/reanalyze
   */
  async reanalyze(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await RepositoryAnalysis.findById(id);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Repository record not found to reanalyze.' });
      }

      console.log(`[Analyzer] Reanalyzing ${existing.url}...`);
      const analysisResult = await analyzeRepository(existing.url);
      const updated = await RepositoryAnalysis.saveAnalysis(analysisResult);

      return res.json({
        success: true,
        message: 'Repository successfully reanalyzed.',
        id: updated._id || updated.id
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: `Reanalysis failed: ${err.message}`
      });
    }
  },

  /**
   * DELETE /api/repositories/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await RepositoryAnalysis.deleteById(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Repository record not found.' });
      }

      return res.json({
        success: true,
        message: 'Repository analysis record successfully deleted.'
      });
    } catch (err) {
      next(err);
    }
  }
};

export default repositoryController;
