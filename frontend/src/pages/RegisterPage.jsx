import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radar, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, getGitHubAuthUrl } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const res = await getGitHubAuthUrl(redirectUri);
      if (res.success && res.configured && res.url) {
        window.location.href = res.url;
      } else {
        setError(
          'GitHub OAuth is not configured on the server yet. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend/.env, or register with email below.'
        );
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate GitHub sign-up.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-radar-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/10 blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-radar-card border border-radar-border rounded-2xl shadow-card-dark p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyan-950/70 text-cyan-400 rounded-2xl border border-cyan-700/50 mb-4 shadow-glow-cyan">
            <Radar className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-radar-text tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-radar-textMuted mt-1.5">
            Join RepoRadar to analyze repositories and manage codebase maps.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-radar-textMuted font-medium mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-radar-surface border border-radar-border rounded-lg pl-10 pr-3.5 py-2.5 text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-radar-textMuted font-medium mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-radar-surface border border-radar-border rounded-lg pl-10 pr-3.5 py-2.5 text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-radar-textMuted font-medium mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-radar-surface border border-radar-border rounded-lg pl-10 pr-10 py-2.5 text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle hover:text-radar-text"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-radar-textMuted font-medium mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-radar-surface border border-radar-border rounded-lg pl-10 pr-3.5 py-2.5 text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              variant="cyan"
              size="md"
              className="w-full !py-2.5"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account with Email
            </Button>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-radar-border/80 w-full" />
              <span className="bg-radar-card px-2.5 text-[10px] text-radar-textSubtle uppercase tracking-wider font-mono">
                or
              </span>
              <div className="border-t border-radar-border/80 w-full" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full !py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-500 shadow-sm flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Sign up with GitHub</span>
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-radar-border/60 text-center text-xs text-radar-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
