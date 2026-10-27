import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Radar, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub } = useAuth();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    if (errorParam || errorDesc) {
      setStatus('error');
      setErrorMessage(errorDesc || 'GitHub authorization was cancelled or denied.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code was returned from GitHub.');
      return;
    }

    let isMounted = true;

    async function completeAuth() {
      try {
        const res = await loginWithGitHub(code);
        if (isMounted) {
          if (res.success) {
            setStatus('success');
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1200);
          } else {
            setStatus('error');
            setErrorMessage(res.message || 'GitHub authentication failed.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.response?.data?.message || err.message || 'Failed to exchange authorization token.');
        }
      }
    }

    completeAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, loginWithGitHub, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-radar-card border border-radar-border shadow-2xl text-center space-y-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radar className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Authenticating with GitHub</h2>
              <p className="text-xs text-radar-textSubtle mt-1.5 leading-relaxed">
                Exchanging secure OAuth credentials and verifying account identity...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">GitHub Account Verified!</h2>
              <p className="text-xs text-radar-textMuted mt-1">
                Redirecting to your RepoRadar workspace...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Authentication Failed</h2>
              <p className="text-xs text-rose-300 mt-2 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40 font-mono">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-radar-surface hover:bg-radar-cardHover text-white text-xs font-semibold border border-radar-border transition-colors"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
