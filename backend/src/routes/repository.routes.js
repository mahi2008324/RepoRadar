import express from 'express';
import { repositoryController } from '../controllers/repository.controller.js';
import { analysisLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/analyze', analysisLimiter, repositoryController.analyze);
router.get('/', repositoryController.list);
router.get('/:id', repositoryController.getDetails);
router.get('/:id/files', repositoryController.getFiles);
router.get('/:id/files/content', repositoryController.getFileContent);
router.get('/:id/graph', repositoryController.getGraph);
router.get('/:id/analysis', repositoryController.getAnalysis);
router.get('/:id/impact', repositoryController.getImpact);
router.post('/:id/reanalyze', analysisLimiter, repositoryController.reanalyze);
router.delete('/:id', repositoryController.delete);

export default router;
