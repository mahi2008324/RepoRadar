/**
 * Standalone CLI script to seed MongoDB with initial popular repositories
 * Usage: node seed.js
 */
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './src/utils/db.js';
import { analyzeRepository } from './src/services/repositoryAnalyzer.js';
import { RepositoryAnalysis } from './src/models/repository.model.js';

const SEED_REPOSITORIES = [
  'https://github.com/expressjs/express',
  'https://github.com/reduxjs/redux'
];

async function seed() {
  console.log('🌱 Starting RepoRadar Database Seeder...');
  await connectDB();

  for (const repoUrl of SEED_REPOSITORIES) {
    try {
      console.log(`📡 Analyzing seed repository: ${repoUrl}...`);
      const result = await analyzeRepository(repoUrl);
      const saved = await RepositoryAnalysis.saveAnalysis(result);
      console.log(`✅ Seeded ${result.metadata.fullName} (ID: ${saved._id || saved.id}) with ${result.summary.analyzedFilesCount} files and ${result.summary.internalEdgesCount} dependencies.`);
    } catch (err) {
      console.error(`⚠️ Failed to seed ${repoUrl}:`, err.message);
    }
  }

  console.log('🎉 Seeding process completed successfully!');
  process.exit(0);
}

seed();
