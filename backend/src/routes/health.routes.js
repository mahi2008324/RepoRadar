import express from 'express';
import mongoose from 'mongoose';
import { isUsingMemoryFallback } from '../utils/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const storageMode = isUsingMemoryFallback() ? 'in-memory-fallback' : 'mongodb-connected';

  res.json({
    status: 'ok',
    service: 'RepoRadar API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: mongoStatus,
      mode: storageMode
    },
    version: '1.0.0'
  });
});

export default router;
