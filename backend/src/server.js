import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

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

startServer();
