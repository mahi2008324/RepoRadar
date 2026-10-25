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
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-radar-bg text-radar-text flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<Home />} />

            {/* Public-Only Auth Routes */}
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

            {/* Core Application Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />

            {/* Repository Multi-Page Nested Routes */}
            <Route path="/repositories/:id" element={<RepositoryLayout />}>
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
