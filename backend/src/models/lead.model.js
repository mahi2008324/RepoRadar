import mongoose from 'mongoose';
import { isUsingMemoryFallback } from '../utils/db.js';

const LeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  repositoryName: {
    type: String,
    trim: true,
    default: 'General'
  },
  reportType: {
    type: String,
    trim: true,
    default: 'dead-code-audit'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const MongooseLeadModel = mongoose.model('Lead', LeadSchema);

class MemoryLeadStore {
  constructor() {
    this.leads = [];
  }

  async create({ email, repositoryName, reportType, metadata }) {
    const record = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      email: email.toLowerCase().trim(),
      repositoryName: repositoryName || 'General',
      reportType: reportType || 'dead-code-audit',
      metadata: metadata || {},
      createdAt: new Date()
    };
    this.leads.push(record);
    return record;
  }

  async find() {
    return [...this.leads].reverse();
  }
}

const memoryLeadStore = new MemoryLeadStore();

function isMongooseActive() {
  return !isUsingMemoryFallback() && mongoose.connection.readyState === 1;
}

export const Lead = {
  async create({ email, repositoryName, reportType, metadata }) {
    if (!isMongooseActive()) {
      return memoryLeadStore.create({ email, repositoryName, reportType, metadata });
    }
    return MongooseLeadModel.create({ email, repositoryName, reportType, metadata });
  },

  async find() {
    if (!isMongooseActive()) {
      return memoryLeadStore.find();
    }
    return MongooseLeadModel.find().sort({ createdAt: -1 });
  }
};

export default Lead;
