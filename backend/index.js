import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoutes from './src/routes/health.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import repositoryRoutes from './src/routes/repository.routes.js';
import leadRoutes from './src/routes/lead.routes.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { apiLimiter } from './src/middlewares/rateLimiter.middleware.js';
import { connectDB } from './src/utils/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const isRunningInTest = Boolean(process.env.NODE_TEST_CONTEXT || process.env.NODE_ENV === 'test');

if (!isRunningInTest) {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', apiLimiter);

// Route Mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/leads', leadRoutes);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Server Listen (only when directly executed from CLI, not when imported in test suites)
async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 RepoRadar API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Error] Port ${PORT} is already in use by another process.`);
      console.error(`💡 [Tip] Stop any other running instance on port ${PORT} or configure a different PORT in backend/.env\n`);
      process.exit(1);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });

  const handleShutdown = () => {
    console.log('Shutting down RepoRadar server gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

const isDirectExecution = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('backend'));
if (isDirectExecution && !isRunningInTest) {
  startServer();
}

export default app;
