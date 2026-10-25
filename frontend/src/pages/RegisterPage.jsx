import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radar, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

          <div className="pt-2">
            <Button
              type="submit"
              variant="cyan"
              size="md"
              className="w-full !py-2.5"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
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
