import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Radar,
  Compass,
  History,
  Settings,
  LayoutDashboard,
  LogOut,
  LogIn,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './common/Button';

/**
 * Responsive frosted glassmorphism navigation bar with badges and profile dropdown menu
 */
export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-radar-border bg-radar-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30 group-hover:border-indigo-500/60 group-hover:shadow-glow-primary transition-all duration-300">
            <Radar className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              RepoRadar
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
              v1.0
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-radar-surface text-white border border-radar-border'
                    : 'text-radar-textMuted hover:text-radar-text hover:bg-radar-surface/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-radar-textSubtle'}`} />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}

          <div className="h-4 w-px bg-radar-border mx-1" />

          {/* Authentication Actions & Profile Dropdown */}
          {isAuthenticated ? (
            <div className="relative ml-1" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                  isProfileOpen
                    ? 'bg-radar-surface border-indigo-500/60 shadow-glow-primary text-white'
                    : 'bg-radar-surface/80 hover:bg-radar-surface border-radar-border text-radar-text'
                }`}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center text-[11px] shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-medium max-w-[110px] truncate hidden sm:inline">
                  {user?.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-radar-textSubtle transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-radar-card/95 border border-radar-border rounded-2xl shadow-card-dark p-2 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 bg-radar-surface/60 rounded-xl mb-1.5 border border-radar-border/40">
                    <p className="font-semibold text-radar-text text-sm truncate">
                      {user?.name || 'Developer'}
                    </p>
                    <p className="text-[11px] text-radar-textSubtle truncate font-mono mt-0.5">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Authenticated Session</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                        location.pathname === '/settings'
                          ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                          : 'text-radar-text hover:text-white hover:bg-radar-surface/80'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <span>Settings & Environment</span>
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-radar-text hover:text-white hover:bg-radar-surface/80 transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Scan History</span>
                    </Link>
                  </div>

                  <div className="h-px bg-radar-border my-1.5" />

                  {/* Sign Out */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* GitHub source link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium text-radar-textMuted hover:text-white hover:bg-radar-surface/60 transition-colors ml-1"
            title="GitHub"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
