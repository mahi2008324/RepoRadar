import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Radar, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginAsGuest();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to start demo session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
      navigate(from, {
        replace: true,
        state: { pendingRepoUrl: location.state?.pendingRepoUrl }
      });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-radar-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-radar-card border border-radar-border rounded-2xl shadow-card-dark p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-950/70 text-indigo-400 rounded-2xl border border-indigo-700/50 mb-4 shadow-glow-primary">
            <Radar className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-radar-text tracking-tight">
            Welcome to RepoRadar
          </h1>
          <p className="text-xs text-radar-textMuted mt-1.5">
            Sign in to access your analyzed codebases and interactive graphs.
          </p>
        </div>

        {/* Info Message banner */}
        {location.state?.message && !error && (
          <div className="mb-5 p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{location.state.message}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
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

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full !py-2.5"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
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
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full !py-2.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500"
              leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}
            >
              ⚡ Instant Demo Access (No Sign-Up)
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-radar-border/60 text-center text-xs text-radar-textMuted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
