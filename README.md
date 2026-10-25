# RepoRadar 📡
> **Turn any GitHub repository into an interactive map of its codebase.**

RepoRadar is a full-stack developer tool built on the MERN stack that enables developers, architects, and engineering teams to understand unfamiliar codebases in minutes. By retrieving a public GitHub repository's tree and parsing source files through Babel's Abstract Syntax Tree (AST) engine, RepoRadar extracts genuine import/export relationships, detects directed cycles, calculates dependency metrics, and presents an interactive codebase map.

---

## 🌟 Key Features

- **Genuine AST Import Analysis**: Uses `@babel/parser` and `@babel/traverse` to parse ECMAScript (ESM), CommonJS (`require`), dynamic `import()`, TypeScript, and JSX syntax into verified dependency relationships. No mock graphs or fabricated data.
- **Interactive Directed Graph**: Built with React Flow (`@xyflow/react`), offering pan, zoom, minimap, node search, directory filtering, and interactive node selection with dependency highlight states.
- **Directed Edge Convention**: Clearly documented convention: `File A ➔ File B` means **File A imports File B** (File A depends on File B).
- **Blast Radius & Impact Analysis**: Select any file to compute its immediate callers, direct dependencies, and transitive dependents across the entire repository.
- **Cycle & Anomaly Detection**: Depth-first search (DFS) with recursion stack identifies circular dependencies (`A ➔ B ➔ A`), isolated entry points, and unresolved path aliases.
- **Three-Panel Code Explorer**: Browse hierarchical file trees, view syntax-highlighted source code with line numbers, and inspect incoming/outgoing dependencies with one-click navigation.
- **Persistent Platform Dashboard & History**: Saved repository analyses and platform statistics persisted in MongoDB Atlas (with seamless in-memory fallback for offline testing).
- **Production-Ready Architecture**: Centralized error handling, input validation with SSRF protection, rate limiting, and responsive dark developer theme.

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    User([Developer / User]) -->|1. Submit GitHub URL| Client[React + Vite Frontend]
    Client -->|2. POST /api/repositories/analyze| Server[Express REST API]
    
    subgraph AnalysisEngine [Repository Analysis Engine]
        Server -->|3. Validate & Normalize URL| UrlParser[githubUrl.js]
        Server -->|4. Fetch Metadata & Tree| GitHubAPI[GitHub REST API]
        GitHubAPI -->|5. Filter Binaries & Vendor| Filter[fileFilters.js]
        Filter -->|6. Batch Source Download| Fetcher[githubService.js]
        Fetcher -->|7. Parse AST & Extracts Imports| BabelAST[importParser.js]
        BabelAST -->|8. Resolve Relative & Package Imports| Resolver[dependencyResolver.js]
        Resolver -->|9. DFS Cycles & Impact Computation| GraphEngine[graphService.js]
    end
    
    GraphEngine -->|10. Persist Analysis Record| Database[(MongoDB Atlas / Memory Store)]
    Database -->|11. Return Analysis ID & Summary| Server
    Server -->|12. Redirect to Overview & Graph| Client
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Lucide React, `@xyflow/react` (React Flow), Recharts |
| **Backend** | Node.js (v24), Express.js, `@babel/parser`, `@babel/traverse`, Axios, Helmet, Morgan, Express Rate Limit |
| **Database** | MongoDB Atlas, Mongoose schemas with indexing (and resilient in-memory fallback) |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`), 28 unit and API integration tests |
| **Deployment** | Vercel (Frontend with SPA rewrite rules), Render (Backend Express server) |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### 1. Health Check
- **`GET /api/health`**
- Returns server uptime, operational status, and database connection mode (`mongodb-connected` or `in-memory-fallback`).

### 2. Analyze Repository
- **`POST /api/repositories/analyze`**
- **Body**: `{ "url": "https://github.com/owner/repository" }`
- **Response**:
```json
{
  "success": true,
  "message": "Repository successfully analyzed and persisted.",
  "id": "repo_1792917447846_psg7se",
  "metadata": {
    "owner": "expressjs",
    "name": "express",
    "stars": 69577,
    "defaultBranch": "master",
    "primaryLanguage": "JavaScript"
  },
  "summary": {
    "totalRepoFiles": 284,
    "supportedSourceFiles": 140,
    "analyzedFilesCount": 140,
    "internalEdgesCount": 74,
    "externalPackagesCount": 54,
    "cycleCount": 0
  }
}
```

### 3. List Persisted Repositories
- **`GET /api/repositories?search=`**
- Returns all analyzed repositories with platform-wide summary statistics (total repos, total source files analyzed, total dependencies discovered).

### 4. Repository Overview Details
- **`GET /api/repositories/:id`**
- Returns repository metadata, language breakdown percentages, directory summaries, and analysis notices.

### 5. File Tree & Source Code
- **`GET /api/repositories/:id/files`**: Returns the list of analyzed files and full repository tree.
- **`GET /api/repositories/:id/files/content?path=lib/express.js`**: Returns cached source code of the requested file path.

### 6. Dependency Graph
- **`GET /api/repositories/:id/graph`**
- Returns graph nodes and directed edges with in-degrees, out-degrees, and labels.

### 7. Deep Dependency Analysis & Metrics
- **`GET /api/repositories/:id/analysis`**
- Returns most-imported files, most-dependent files, circular dependency chains, and disconnected files.

### 8. Blast Radius Impact Analysis
- **`GET /api/repositories/:id/impact?file=lib/express.js`**
- Calculates direct dependencies, direct callers, and transitive dependents for the selected file.

### 9. Reanalyze & Delete
- **`POST /api/repositories/:id/reanalyze`**: Re-executes repository analysis and updates stored record.
- **`DELETE /api/repositories/:id`**: Deletes RepoRadar's stored analysis record without modifying the GitHub repository.

---

## 🗄️ Database Schema Overview

```javascript
RepositoryAnalysisSchema:
├── owner: String (indexed)
├── name: String (indexed)
├── fullPath: String (unique, indexed: owner/name)
├── url: String
├── defaultBranch: String
├── description: String
├── primaryLanguage: String
├── stars: Number
├── forks: Number
├── size: Number
├── status: 'completed' | 'failed'
├── analyzedAt: Date (indexed)
├── summary: { totalRepoFiles, supportedSourceFiles, analyzedFilesCount, internalEdgesCount, externalPackagesCount, cycleCount }
├── languages: [{ name, count, percentage }]
├── files: [{ path, language, size, lines, inDegree, outDegree, imports, externalImports, importedBy }]
├── fileContents: Map<String, String> (source code for Code Explorer)
├── nodes: [{ id, label, path, language, size, lines, inDegree, outDegree }]
├── edges: [{ id, source, target, type, importType, line }]
├── cycles: [[String]] (detected cycle paths)
└── directorySummary: [{ directory, fileCount, languages, internalDependencies }]
```

---

## 🚀 Local Installation & Quickstart

### Prerequisites
- Node.js v18+ (tested on Node.js v24.13.0)
- npm v9+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/RepoRadar.git
cd RepoRadar
```

### 2. Install all dependencies
```bash
npm run install:all
```
*(Or install in root, backend, and frontend directories: `npm install && cd backend && npm install && cd ../frontend && npm install`)*

### 3. Configure environment variables
Copy `.env.example` to `backend/.env` and `frontend/.env`:
```bash
# Backend configuration (backend/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reporadar
GITHUB_TOKEN=   # Optional: higher rate limits for public GitHub API
CLIENT_URL=http://localhost:5173

# Frontend configuration (frontend/.env)
VITE_API_BASE_URL=http://localhost:5000/api
```
*(Note: If no local or remote MongoDB instance is running, RepoRadar automatically activates its resilient in-memory storage fallback with zero configuration required!)*

### 4. Run tests
```bash
npm test
```
Runs 28 automated unit and integration tests verifying URL parsing, AST imports, module resolution, cycle detection, and REST APIs.

### 5. Start the development servers
```bash
npm run dev
```
Launches both the Express API server on `http://localhost:5000` and the Vite React frontend on `http://localhost:5173`.

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import the `frontend/` folder into Vercel.
3. Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.
4. Build Command: `npm run build` (Output Directory: `dist`).
5. Notice: `frontend/vercel.json` and `frontend/public/_redirects` are already configured for client-side React Router rewrites.

### Backend (Render)
1. Create a new Web Service on Render pointing to the `backend/` root.
2. Build Command: `npm install`.
3. Start Command: `node src/server.js`.
4. Environment Variables:
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reporadar?retryWrites=true&w=majority`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `NODE_ENV=production`

---

## ⚠️ Current Scope & Limitations

- **Language Scope**: Currently analyzes **JavaScript** (ESM, CommonJS, JSX) and **TypeScript** (TS, TSX). Non-JS/TS files (Markdown, JSON, HTML, Python, Go) are classified in the directory tree but not parsed for internal imports.
- **Dynamic Imports**: Statically detectable `import('...')` string literals and CommonJS `require('...')` calls are mapped. Computed runtime expressions (e.g. `require('./plugins/' + name)`) cannot be statically resolved.
- **Repository Bounds**: To ensure responsive browser performance and respect GitHub API quotas, single repository analysis is bounded to 150 source files and files under 250 KB.
- **Path Aliases**: Standard `@/...` and `~/...` aliases mapping to `src/` or root are resolved. Highly customized `tsconfig.json` paths or dynamic webpack plugins are reported in unresolved imports.

---

## 📄 License
MIT License. Built as an open-source developer productivity tool.
