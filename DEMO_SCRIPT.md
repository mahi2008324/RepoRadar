# RepoRadar — 3 to 5 Minute Project Demonstration Script

**Tagline**: *Turn any GitHub repository into an interactive map of its codebase.*  
**Presenter**: Senior Full-Stack Engineer / Student Developer  
**Total Target Duration**: ~4 minutes 30 seconds

---

### Segment 1: Introduction & Problem Statement (0:00 – 0:40)
**Visual**: Browser opened to the RepoRadar Landing Page (`http://localhost:5173/`).

**Narration**:
> *"Hello everyone! As software developers, we frequently encounter large, unfamiliar open-source repositories or company codebases. The first few days are often spent reading countless files just trying to answer basic questions: Where does execution start? Which files are heavily imported? What might break if I refactor a utility? And are there circular dependencies lurking in the architecture?*
> 
> *Traditional tools only give us flat file trees or static text searches. That is why we built **RepoRadar** — a developer tool that automatically turns any public GitHub repository into a living, interactive dependency map powered by actual Abstract Syntax Tree analysis."*

---

### Segment 2: Repository Analysis Pipeline (0:40 – 1:20)
**Visual**: On Landing page hero section, enter `https://github.com/expressjs/express` (or click the quick example pill) and click **"Analyze Repository"**.

**Narration**:
> *"Let's test this with a real, famous production codebase: `expressjs/express`. I'll paste the repository URL and click 'Analyze Repository'.*
> 
> *Notice our real-time pipeline progress indicators: RepoRadar validates the URL, fetches the recursive Git tree from GitHub, filters out vendor files and build artifacts, batch-downloads supported JavaScript and TypeScript source files, and runs them through the Babel AST parser. It resolves relative paths to internal files, separates external npm packages like `debug` or `depd`, and runs depth-first search cycle detection before saving the record into MongoDB."*

---

### Segment 3: Repository Overview & Architecture (1:20 – 2:00)
**Visual**: Automatically redirected to `/repositories/:id`. Hover over summary cards and language progress bars.

**Narration**:
> *"Once analyzed, we arrive at the Repository Overview. Notice that every number here is derived from actual code:*
> 
> *We analyzed 140 supported JavaScript source files and uncovered 74 internal dependency edges. RepoRadar identified 54 external npm dependencies, verified that this repository is a clean Directed Acyclic Graph with 0 circular cycles, and summarized the directory structure across `lib/`, `examples/`, and `test/`."*

---

### Segment 4: Three-Panel Code Explorer (2:00 – 2:45)
**Visual**: Click **"Code Explorer"** in the sidebar (`/repositories/:id/explorer`). Expand `lib/` and select `lib/express.js`. Click on an imported file in the right panel.

**Narration**:
> *"Next, let's open the Code Explorer. Here we have an integrated three-panel workstation:*
> 
> *On the left is the folder hierarchy with search filtering. In the center is the syntax-highlighted source code viewer with exact line numbers and one-click copy.*
> 
> *On the right is our File Inspector. For `lib/express.js`, we can immediately see its size and lines, its outgoing dependencies like `lib/application.js` and `lib/request.js`, and files that import it. Clicking any import instantly navigates the center viewer to that file."*

---

### Segment 5: The Interactive Dependency Graph (2:45 – 3:30)
**Visual**: Click **"Dependency Graph"** in the sidebar (`/repositories/:id/graph`). Pan, zoom, click `lib/express.js` node, view directional arrows and legend.

**Narration**:
> *"Now let's view RepoRadar's signature feature: the Interactive Dependency Graph.*
> 
> *Every node here represents a real source file, and each directed arrow represents an internal import statement. As documented in our legend: **File A pointing to File B means File A imports File B**.*
> 
> *When I click on `lib/express.js`, the graph highlights its direct outgoing dependencies in cyan, and its direct callers in purple. The floating drawer lets us search nodes, filter by directory, toggle isolated files, or inspect relationships in depth."*

---

### Segment 6: Blast Radius & Dependency Impact Analysis (3:30 – 4:10)
**Visual**: Click **"Dependency Analysis"** in the sidebar (`/repositories/:id/analysis`). Select `lib/express.js` in the Blast Radius dropdown.

**Narration**:
> *"In Dependency Analysis, we answer the hardest question in software maintenance: 'What is the blast radius if I change this file?'*
> 
> *Selecting `lib/express.js` calculates its transitive graph closure using reverse breadth-first search. We see that while only 3 files directly import it, 23 additional files across routes, controllers, and tests transitively depend on it — giving an exact blast radius of 26 affected files.*
> 
> *Below, RepoRadar ranks the most-imported core utilities, most-dependent files, circular dependency chains, and isolated configuration files."*

---

### Segment 7: Persistence & Technical Architecture (4:10 – 4:45)
**Visual**: Click **"Dashboard"** in the top navbar (`/dashboard`), then **"History"** (`/history`), and finally **"Settings"** (`/settings`).

**Narration**:
> *"Finally, returning to the Dashboard and History, we see our analyzed repository persisted in our database with quick reanalyze and delete actions.*
> 
> *Under Settings, our live `/api/health` check monitors the backend and database status. In addition, our automated test suite includes 28 passing unit and integration tests covering AST parsing, cycle detection, and REST APIs.*
> 
> *RepoRadar transforms static repositories into understandable, interactive maps — helping developers write better code, faster. Thank you!"*
