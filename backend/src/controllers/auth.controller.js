import { generateToken } from '../utils/generateToken.js';
import { User } from '../models/user.model.js';

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      const existing = await User.findOne({ email: email.trim() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      const token = generateToken(user._id || user.id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !email.trim() || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const user = await User.findOne({ email: email.trim() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id || user.id);

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  }
};

export default authController;
