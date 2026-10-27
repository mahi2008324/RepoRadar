import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reporadar_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('reporadar_auth_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Restore and verify session on initial load
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('reporadar_auth_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('reporadar_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('reporadar_auth_token', res.token);
      localStorage.setItem('reporadar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('reporadar_auth_token', res.token);
      localStorage.setItem('reporadar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const loginAsGuest = async () => {
    const res = await api.post('/auth/demo');
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('reporadar_auth_token', res.token);
      localStorage.setItem('reporadar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const claimAccount = async (name, email, password) => {
    const res = await api.post('/auth/claim', {
      name,
      email,
      password,
      pinnedRepositories: user?.pinnedRepositories || []
    });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('reporadar_auth_token', res.token);
      localStorage.setItem('reporadar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const getGitHubAuthUrl = async (redirectUri) => {
    const query = redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : '';
    return api.get(`/auth/github/url${query}`);
  };

  const loginWithGitHub = async (code) => {
    const res = await api.post('/auth/github/callback', { code });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('reporadar_auth_token', res.token);
      localStorage.setItem('reporadar_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('reporadar_auth_token');
    localStorage.removeItem('reporadar_user');
  };

  const togglePin = async (repoId) => {
    if (!token || !user) return false;
    try {
      const res = await api.post(`/auth/pins/${repoId}`);
      if (res.success && Array.isArray(res.pinnedRepositories)) {
        const updatedUser = {
          ...user,
          pinnedRepositories: res.pinnedRepositories
        };
        setUser(updatedUser);
        localStorage.setItem('reporadar_user', JSON.stringify(updatedUser));
        return true;
      }
    } catch {
      // Fallback local toggle
      const current = user.pinnedRepositories || [];
      const updated = current.includes(repoId)
        ? current.filter(id => id !== repoId)
        : [...current, repoId];
      const updatedUser = { ...user, pinnedRepositories: updated };
      setUser(updatedUser);
      localStorage.setItem('reporadar_user', JSON.stringify(updatedUser));
    }
    return false;
  };

  const isPinned = (repoId) => {
    if (!user || !user.pinnedRepositories) return false;
    return user.pinnedRepositories.includes(repoId);
  };

  const isGuest = Boolean(user && (user.isGuest || user.email === 'guest.demo@reporadar.io'));

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isGuest,
    loading,
    login,
    register,
    loginAsGuest,
    claimAccount,
    getGitHubAuthUrl,
    loginWithGitHub,
    logout,
    pinnedRepos: user?.pinnedRepositories || [],
    togglePin,
    isPinned
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
