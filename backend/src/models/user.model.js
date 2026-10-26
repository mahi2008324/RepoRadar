import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isUsingMemoryFallback } from '../utils/db.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  pinnedRepositories: [{
    type: String
  }]
}, {
  timestamps: true
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUserModel = mongoose.model('User', UserSchema);

class MemoryUserStore {
  constructor() {
    this.users = new Map();
  }

  async findOne({ email }) {
    if (!email) return null;
    const lower = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === lower) return user;
    }
    return null;
  }

  async findById(id) {
    return this.users.get(id) || null;
  }

  async create({ name, email, password, pinnedRepositories = [] }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    const newUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      pinnedRepositories: Array.isArray(pinnedRepositories) ? [...pinnedRepositories] : [],
      createdAt: new Date(),
      async comparePassword(candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    };

    this.users.set(id, newUser);
    return newUser;
  }
}

const memoryUserStoreInstance = new MemoryUserStore();

function isMongooseActive() {
  return !isUsingMemoryFallback() && mongoose.connection.readyState === 1;
}

export const User = {
  async findOne({ email }) {
    if (!isMongooseActive()) {
      return memoryUserStoreInstance.findOne({ email });
    }
    return MongooseUserModel.findOne({ email: email.toLowerCase() });
  },

  async findById(id) {
    if (!isMongooseActive()) {
      return memoryUserStoreInstance.findById(id);
    }
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    return MongooseUserModel.findById(id).select('-password');
  },

  async create({ name, email, password, pinnedRepositories = [] }) {
    if (!isMongooseActive()) {
      return memoryUserStoreInstance.create({ name, email, password, pinnedRepositories });
    }
    return MongooseUserModel.create({ name, email, password, pinnedRepositories });
  },

  async togglePin(userId, repoId) {
    if (!repoId) return [];

    if (!isMongooseActive()) {
      const user = await memoryUserStoreInstance.findById(userId);
      if (!user) return [];
      if (!user.pinnedRepositories) user.pinnedRepositories = [];
      const idx = user.pinnedRepositories.indexOf(repoId);
      if (idx > -1) {
        user.pinnedRepositories.splice(idx, 1);
      } else {
        user.pinnedRepositories.push(repoId);
      }
      return user.pinnedRepositories;
    }

    if (!mongoose.isValidObjectId(userId)) return [];

    const user = await MongooseUserModel.findById(userId);
    if (!user) return [];

    if (!user.pinnedRepositories) user.pinnedRepositories = [];
    const idx = user.pinnedRepositories.indexOf(repoId);
    if (idx > -1) {
      user.pinnedRepositories.splice(idx, 1);
    } else {
      user.pinnedRepositories.push(repoId);
    }

    await user.save();
    return user.pinnedRepositories;
  }
};

export default User;
