import axios from 'axios';
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
          email: user.email,
          pinnedRepositories: user.pinnedRepositories || []
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
    const isGuest = req.user?.email === 'guest.demo@reporadar.io';
    return res.status(200).json({
      success: true,
      user: {
        ...req.user,
        isGuest
      }
    });
  },

  /**
   * POST /api/auth/demo
   * One-click instant guest login
   */
  async demo(req, res, next) {
    try {
      const demoEmail = 'guest.demo@reporadar.io';
      let user = await User.findOne({ email: demoEmail });

      if (!user) {
        user = await User.create({
          name: 'Demo Guest',
          email: demoEmail,
          password: 'GuestPassword123!'
        });
      }

      const token = generateToken(user._id || user.id);

      return res.status(200).json({
        success: true,
        message: 'Logged in as Demo Guest.',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          isGuest: true,
          pinnedRepositories: user.pinnedRepositories || []
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/claim
   * Claim account and upgrade from guest session, transferring saved/pinned repos
   */
  async claim(req, res, next) {
    try {
      const { name, email, password, pinnedRepositories } = req.body;

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
        password,
        pinnedRepositories: Array.isArray(pinnedRepositories) ? pinnedRepositories : []
      });

      const token = generateToken(user._id || user.id);

      return res.status(201).json({
        success: true,
        message: 'Account claimed successfully and repositories saved!',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          pinnedRepositories: user.pinnedRepositories || [],
          isGuest: false
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/pins/:repoId or POST /api/auth/pin
   * Toggle pinned repository for authenticated user
   */
  async togglePin(req, res, next) {
    try {
      const repoId = req.params.repoId || req.body.repositoryId || req.body.repoId;
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      if (!repoId) {
        return res.status(400).json({ success: false, message: 'Repository ID is required.' });
      }

      const updatedPins = await User.togglePin(userId, repoId);

      return res.status(200).json({
        success: true,
        message: 'Pinned repositories updated.',
        isPinned: updatedPins.includes(repoId),
        pinnedRepositories: updatedPins
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/pins
   * Fetch pinned repository IDs for authenticated user
   */
  async getPins(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const user = await User.findById(userId);
      return res.status(200).json({
        success: true,
        pinnedRepositories: user?.pinnedRepositories || []
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/github/url
   * Generates GitHub OAuth authorization URL
   */
  async getGitHubUrl(req, res) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(200).json({
        success: true,
        configured: false,
        message: 'GitHub OAuth Client ID is not configured in backend/.env yet.'
      });
    }

    const redirectUri = req.query.redirectUri || `${req.protocol}://${req.get('host')}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return res.status(200).json({
      success: true,
      configured: true,
      url
    });
  },

  /**
   * POST /api/auth/github/callback
   * Exchanges OAuth authorization code for GitHub token and logs in/registers user
   */
  async githubCallback(req, res, next) {
    try {
      const { code } = req.body;
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!code) {
        return res.status(400).json({ success: false, message: 'OAuth authorization code is required.' });
      }

      if (!clientId || !clientSecret) {
        return res.status(500).json({
          success: false,
          message: 'GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'
        });
      }

      // 1. Exchange code for GitHub access token
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        { client_id: clientId, client_secret: clientSecret, code },
        { headers: { Accept: 'application/json' } }
      );

      const accessToken = tokenRes.data?.access_token;
      if (!accessToken) {
        return res.status(400).json({
          success: false,
          message: tokenRes.data?.error_description || 'Failed to obtain access token from GitHub.'
        });
      }

      // 2. Fetch authenticated GitHub profile
      const profileRes = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'RepoRadar-Auth'
        }
      });
      const profile = profileRes.data;

      // 3. Fetch user emails to get the verified primary email
      let email = profile.email;
      if (!email) {
        try {
          const emailsRes = await axios.get('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': 'RepoRadar-Auth'
            }
          });
          const primaryEmailObj = emailsRes.data?.find(e => e.primary && e.verified) || emailsRes.data?.find(e => e.verified) || emailsRes.data?.[0];
          if (primaryEmailObj) {
            email = primaryEmailObj.email;
          }
        } catch {
          console.warn('[GitHub Auth]: Could not fetch private emails, falling back to handle.');
        }
      }

      if (!email) {
        email = `${profile.login}@users.noreply.github.com`;
      }

      // 4. Find or Create User
      let user = await User.findOne({ githubId: String(profile.id) });
      if (!user) {
        user = await User.findOne({ email });
      }

      if (!user) {
        user = await User.create({
          name: profile.name || profile.login,
          email: email.toLowerCase(),
          githubId: String(profile.id),
          githubUsername: profile.login,
          avatar: profile.avatar_url,
          githubAccessToken: accessToken
        });
      } else {
        if (!user.githubId) user.githubId = String(profile.id);
        if (!user.avatar) user.avatar = profile.avatar_url;
        user.githubAccessToken = accessToken;
        if (typeof user.save === 'function') await user.save();
      }

      const token = generateToken(user._id || user.id);

      return res.status(200).json({
        success: true,
        message: 'Authenticated with GitHub successfully.',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || profile.avatar_url,
          githubUsername: user.githubUsername || profile.login,
          pinnedRepositories: user.pinnedRepositories || []
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

export default authController;
