import express from 'express';
import { repositoryController } from '../controllers/repositoryController.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Analysis execution
router.post('/analyze', analysisLimiter, repositoryController.analyze);

// Repository listing and search
router.get('/', repositoryController.list);

// Single repository details
router.get('/:id', repositoryController.getDetails);

// File tree and file source inspection
router.get('/:id/files', repositoryController.getFiles);
router.get('/:id/files/content', repositoryController.getFileContent);

// Graph nodes and edges
router.get('/:id/graph', repositoryController.getGraph);

// Graph analytics & cycle detection
router.get('/:id/analysis', repositoryController.getAnalysis);

// Dependency impact analysis on a target file
router.get('/:id/impact', repositoryController.getImpact);

// Reanalyze and delete
router.post('/:id/reanalyze', analysisLimiter, repositoryController.reanalyze);
router.delete('/:id', repositoryController.delete);

export default router;
