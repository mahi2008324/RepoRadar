import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export function FileTree({
  files = [],
  selectedPath,
  onSelectFile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFolders, setOpenFolders] = useState(() => new Set(['src', 'components', 'utils', 'lib']));

  // Build tree hierarchy from flat file list
  const treeData = useMemo(() => {
    const root = { name: '', isDir: true, children: {} };

    const filtered = files.filter((f) =>
      !searchQuery || f.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    for (const file of filtered) {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (isLast) {
          current.children[part] = {
            name: part,
            path: file.path,
            isDir: false,
            fileData: file
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: parts.slice(0, i + 1).join('/'),
              isDir: true,
              children: {}
            };
          }
          current = current.children[part];
        }
      }
    }

    return root;
  }, [files, searchQuery]);

  const toggleFolder = (folderPath) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const renderNode = (node, depth = 0) => {
    if (!node) return null;

    if (node.isDir) {
      const isOpen = openFolders.has(node.path) || searchQuery.length > 0;
      const sortedChildKeys = Object.keys(node.children).sort((a, b) => {
        const aIsDir = node.children[a].isDir;
        const bIsDir = node.children[b].isDir;
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

      return (
        <div key={node.path || 'root'} className="select-none">
          {node.path && (
            <button
              onClick={() => toggleFolder(node.path)}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              className="w-full flex items-center gap-1.5 py-1.5 pr-2 text-xs font-medium text-radar-textMuted hover:text-radar-text hover:bg-radar-surface/80 rounded transition-colors text-left"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-radar-textSubtle shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-radar-textSubtle shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-indigo-400/80 shrink-0" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
          )}

          {(isOpen || !node.path) && (
            <div>
              {sortedChildKeys.map((key) => renderNode(node.children[key], depth + (node.path ? 1 : 0)))}
            </div>
          )}
        </div>
      );
    }

    // Leaf file node
    const isSelected = selectedPath === node.path;
    const isSupported = node.fileData?.isSupported !== false;

    return (
      <button
        key={node.path}
        onClick={() => onSelectFile(node.fileData || { path: node.path })}
        style={{ paddingLeft: `${depth * 14 + 14}px` }}
        className={`w-full flex items-center justify-between py-1.5 pr-2 text-xs rounded transition-all text-left ${
          isSelected
            ? 'bg-indigo-600/30 text-white font-medium border-l-2 border-indigo-500 pl-3'
            : 'text-radar-textMuted hover:text-radar-text hover:bg-radar-surface/60'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-radar-textSubtle'}`} />
          <span className="truncate">{node.name}</span>
        </div>

        {isSupported && (
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/30 shrink-0 font-mono">
            AST
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-radar-card border border-radar-border rounded-xl overflow-hidden">
      {/* Header and Search */}
      <div className="p-3 border-b border-radar-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-radar-textMuted">
            Source Files ({files.length})
          </span>
          <span className="text-[11px] text-indigo-400 font-mono">
            {files.filter(f => f.isSupported !== false).length} analyzed
          </span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-radar-textSubtle" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-radar-surface border border-radar-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-radar-text placeholder-radar-textSubtle outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tree scrollable area */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderNode(treeData)}
      </div>
    </div>
  );
}
