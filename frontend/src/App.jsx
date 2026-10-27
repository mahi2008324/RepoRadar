import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { RepositoryLayout } from './components/layout/RepositoryLayout';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { RepositoryOverview } from './pages/RepositoryOverview';
import { CodeExplorer } from './pages/CodeExplorer';
import { DependencyGraph } from './pages/DependencyGraph';
import { DependencyAnalysis } from './pages/DependencyAnalysis';
import { Compare } from './pages/Compare';
import { NotFound } from './pages/NotFound';
import GitHubCallbackPage from './pages/GitHubCallbackPage';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-radar-bg text-radar-text flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Home />} />

            {/* Public-Only Auth Pages (Redirects logged-in users to /dashboard) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />

            {/* Protected Routes (Redirects unauthenticated visitors to /login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <Compare />
                </ProtectedRoute>
              }
            />

            {/* Repository Multi-Page Nested Routes (Protected) */}
            <Route
              path="/repositories/:id"
              element={
                <ProtectedRoute>
                  <RepositoryLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RepositoryOverview />} />
              <Route path="explorer" element={<CodeExplorer />} />
              <Route path="graph" element={<DependencyGraph />} />
              <Route path="analysis" element={<DependencyAnalysis />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
