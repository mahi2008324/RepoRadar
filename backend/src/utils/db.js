/**
 * MongoDB connection with automated in-memory MongoDB fallback
 */
import mongoose from 'mongoose';

let isConnected = false;
let isMemoryFallback = false;

// In-memory collection fallback when no MongoDB instance is running locally
class MemoryStore {
  constructor() {
    this.records = new Map();
  }

  async find(filter = {}) {
    let list = Array.from(this.records.values());
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.owner?.toLowerCase().includes(q) ||
        r.fullPath?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt));
  }

  async findById(id) {
    return this.records.get(id) || null;
  }

  async findOne(filter = {}) {
    for (const record of this.records.values()) {
      let match = true;
      for (const [key, val] of Object.entries(filter)) {
        if (record[key] !== val) {
          match = false;
          break;
        }
      }
      if (match) return record;
    }
    return null;
  }

  async create(data) {
    const id = data._id || data.id || 'repo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const newDoc = {
      ...data,
      _id: id,
      id: id,
      createdAt: data.createdAt || new Date(),
      analyzedAt: data.analyzedAt || new Date()
    };
    this.records.set(id, newDoc);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const existing = this.records.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date()
    };
    this.records.set(id, updated);
    return updated;
  }

  async findByIdAndDelete(id) {
    const existing = this.records.get(id);
    if (existing) {
      this.records.delete(id);
      return existing;
    }
    return null;
  }

  async countDocuments() {
    return this.records.size;
  }
}

export const memoryStoreInstance = new MemoryStore();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reporadar';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    isMemoryFallback = false;
    console.log(`[Database] Successfully connected to MongoDB at ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}).`);
    console.warn('[Database] Running with in-memory resilient repository store.');
    console.warn('[Database] To use persistent MongoDB, set MONGODB_URI in backend/.env with your Atlas or local connection string.');
    isConnected = false;
    isMemoryFallback = true;
  }
}

export function isUsingMemoryFallback() {
  return isMemoryFallback;
}

// Backwards compatibility alias
export const connectDatabase = connectDB;
