/**
 * Repository Analysis Mongoose Model & Data Access Layer
 */
import mongoose from 'mongoose';
import { isUsingMemoryFallback, memoryStoreInstance } from '../config/database.js';

const FileEntrySchema = new mongoose.Schema({
  path: { type: String, required: true },
  language: { type: String, default: 'JavaScript' },
  size: { type: Number, default: 0 },
  lines: { type: Number, default: 0 },
  inDegree: { type: Number, default: 0 },
  outDegree: { type: Number, default: 0 },
  imports: [{
    target: String,
    rawSource: String,
    type: String,
    line: Number
  }],
  externalImports: [{
    packageName: String,
    rawSource: String
  }],
  importedBy: [String],
  hasParseError: { type: Boolean, default: false }
}, { _id: false });

const GraphNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  path: { type: String, required: true },
  language: { type: String, default: 'JavaScript' },
  size: { type: Number, default: 0 },
  lines: { type: Number, default: 0 },
  inDegree: { type: Number, default: 0 },
  outDegree: { type: Number, default: 0 }
}, { _id: false });

const GraphEdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  type: { type: String, default: 'imports' },
  importType: { type: String, default: 'es_named' },
  line: Number
}, { _id: false });

const RepositoryAnalysisSchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  fullPath: { type: String, required: true, unique: true, index: true },
  url: { type: String, required: true },
  defaultBranch: { type: String, default: 'main' },
  description: { type: String, default: '' },
  primaryLanguage: { type: String, default: 'JavaScript' },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  size: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  analyzedAt: { type: Date, default: Date.now, index: true },
  summary: {
    totalRepoFiles: Number,
    filteredFilesCount: Number,
    supportedSourceFiles: Number,
    analyzedFilesCount: Number,
    internalEdgesCount: Number,
    externalPackagesCount: Number,
    cycleCount: Number,
    parseErrorsCount: Number,
    unresolvedImportsCount: Number,
    isTreeTruncated: Boolean
  },
  languages: [{
    name: String,
    count: Number,
    percentage: Number
  }],
  files: [FileEntrySchema],
  allFiles: [{
    path: String,
    language: String,
    size: Number,
    isSupported: Boolean
  }],
  fileContents: {
    type: Map,
    of: String,
    default: {}
  },
  nodes: [GraphNodeSchema],
  edges: [GraphEdgeSchema],
  cycles: [[String]],
  directorySummary: [{
    directory: String,
    fileCount: Number,
    languages: [String],
    internalDependencies: Number
  }],
  externalPackages: [String],
  parseErrors: [{
    path: String,
    error: String,
    line: Number
  }],
  unresolvedImports: [{
    sourceFile: String,
    rawSource: String,
    attemptedPath: String
  }]
}, {
  timestamps: true
});

const MongooseModel = mongoose.model('RepositoryAnalysis', RepositoryAnalysisSchema);

function isMongooseActive() {
  return !isUsingMemoryFallback() && mongoose.connection.readyState === 1;
}

/**
 * Unified Repository Data Access Object
 */
export const RepositoryAnalysis = {
  async find(filter = {}) {
    if (!isMongooseActive()) {
      return memoryStoreInstance.find(filter);
    }
    const query = {};
    if (filter.search) {
      const regex = new RegExp(filter.search, 'i');
      query.$or = [{ name: regex }, { owner: regex }, { fullPath: regex }];
    }
    return MongooseModel.find(query)
      .select('-fileContents')
      .sort({ analyzedAt: -1 })
      .lean();
  },

  async findById(id) {
    if (!isMongooseActive()) {
      return memoryStoreInstance.findById(id);
    }
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    try {
      return await MongooseModel.findById(id).lean();
    } catch {
      return null;
    }
  },

  async findByFullPath(fullPath) {
    if (!isMongooseActive()) {
      return memoryStoreInstance.findOne({ fullPath });
    }
    return MongooseModel.findOne({ fullPath }).lean();
  },

  async saveAnalysis(analysisData) {
    const fullPath = `${analysisData.metadata.owner}/${analysisData.metadata.name}`;

    const docPayload = {
      owner: analysisData.metadata.owner,
      name: analysisData.metadata.name,
      fullPath,
      url: analysisData.metadata.canonicalUrl,
      defaultBranch: analysisData.metadata.branch,
      description: analysisData.metadata.description,
      primaryLanguage: analysisData.metadata.primaryLanguage,
      stars: analysisData.metadata.stars,
      forks: analysisData.metadata.forks,
      size: analysisData.metadata.size,
      status: 'completed',
      analyzedAt: new Date(),
      summary: analysisData.summary,
      languages: analysisData.languages,
      files: analysisData.files,
      allFiles: analysisData.allFiles,
      fileContents: analysisData.fileContents,
      nodes: analysisData.nodes,
      edges: analysisData.edges,
      cycles: analysisData.cycles,
      directorySummary: analysisData.directorySummary,
      externalPackages: analysisData.externalPackages,
      parseErrors: analysisData.parseErrors,
      unresolvedImports: analysisData.unresolvedImports
    };

    if (!isMongooseActive()) {
      const existing = await memoryStoreInstance.findOne({ fullPath });
      if (existing) {
        return memoryStoreInstance.findByIdAndUpdate(existing.id || existing._id, docPayload);
      }
      return memoryStoreInstance.create(docPayload);
    }

    return MongooseModel.findOneAndUpdate(
      { fullPath },
      { $set: docPayload },
      { upsert: true, new: true }
    ).lean();
  },

  async deleteById(id) {
    if (!isMongooseActive()) {
      return memoryStoreInstance.findByIdAndDelete(id);
    }
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    return MongooseModel.findByIdAndDelete(id).lean();
  },

  async count() {
    if (!isMongooseActive()) {
      return memoryStoreInstance.countDocuments();
    }
    return MongooseModel.countDocuments();
  }
};
