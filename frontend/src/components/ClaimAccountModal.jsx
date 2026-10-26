import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ClaimAccountModal({ isOpen, onClose }) {
  const { claimAccount, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await claimAccount(name.trim(), email.trim(), password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to claim account.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while claiming your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-radar-card border border-radar-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-radar-textSubtle hover:text-white p-1.5 rounded-lg hover:bg-radar-surface/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Account Claimed Successfully!</h3>
              <p className="text-sm text-radar-textMuted mt-1">
                Your guest repositories and settings have been linked to your new profile.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Claim Your Free Account
                </h2>
                <p className="text-xs text-radar-textMuted">
                  Preserve your analyzed repositories & access full features
                </p>
              </div>
            </div>

            {/* Perks list */}
            <div className="mb-5 p-3 rounded-xl bg-radar-surface/60 border border-radar-border/60 space-y-1.5 text-xs text-radar-text">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Keep your currently pinned repositories ({user?.pinnedRepositories?.length || 0} saved)</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Unlimited repository AST deep scans & 3D Code City</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Export architectural audits & dead code reports</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-radar-textSubtle mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-radar-textSubtle" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-radar-surface border border-radar-border rounded-xl text-sm text-white placeholder-radar-textSubtle focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-radar-textSubtle mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-radar-textSubtle" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-radar-surface border border-radar-border rounded-xl text-sm text-white placeholder-radar-textSubtle focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-radar-textSubtle mb-1">
                  Create Password (min. 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-radar-textSubtle" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-radar-surface border border-radar-border rounded-xl text-sm text-white placeholder-radar-textSubtle focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 shadow-glow-primary flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Claiming Account...</span>
                ) : (
                  <>
                    <span>Claim Free Account & Save Progress</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
