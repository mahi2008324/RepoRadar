import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo', authController.demo);
router.post('/claim', authController.claim);
router.get('/github/url', authController.getGitHubUrl);
router.post('/github/callback', authController.githubCallback);
router.get('/me', requireAuth, authController.me);
router.get('/pins', requireAuth, authController.getPins);
router.post('/pin', requireAuth, authController.togglePin);
router.post('/pins', requireAuth, authController.togglePin);
router.post('/pins/:repoId', requireAuth, authController.togglePin);

export default router;
