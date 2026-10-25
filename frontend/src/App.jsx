import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { RepositoryLayout } from './components/layout/RepositoryLayout';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { RepositoryOverviewPage } from './pages/RepositoryOverviewPage';
import { CodeExplorerPage } from './pages/CodeExplorerPage';
import { DependencyGraphPage } from './pages/DependencyGraphPage';
import { DependencyAnalysisPage } from './pages/DependencyAnalysisPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="min-h-screen bg-radar-bg text-radar-text flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Repository Multi-Page Nested Routes */}
          <Route path="/repositories/:id" element={<RepositoryLayout />}>
            <Route index element={<RepositoryOverviewPage />} />
            <Route path="explorer" element={<CodeExplorerPage />} />
            <Route path="graph" element={<DependencyGraphPage />} />
            <Route path="analysis" element={<DependencyAnalysisPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
