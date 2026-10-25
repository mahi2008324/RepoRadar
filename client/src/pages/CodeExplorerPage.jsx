import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { FileTree } from '../components/explorer/FileTree';
import { SourceViewer } from '../components/explorer/SourceViewer';
import { FileDetailsPanel } from '../components/explorer/FileDetailsPanel';
import { repositoryService } from '../services/repositoryService';

export function CodeExplorerPage() {
  const { repo } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);

  // Initialize and load files list
  useEffect(() => {
    if (!repo) return;

    const initFiles = async () => {
      let repoFiles = repo.files || [];
      if (repoFiles.length === 0) {
        try {
          const res = await repositoryService.getFiles(repo.id);
          if (res.success && res.files) {
            repoFiles = res.files;
          }
        } catch (err) {
          console.error('Failed to fetch files:', err);
        }
      }

      setFiles(repoFiles);

      // Check if query parameter specifies a file
      const targetPath = searchParams.get('file');
      if (targetPath) {
        const match = repoFiles.find((f) => f.path === targetPath);
        if (match) {
          handleSelectFile(match);
        } else {
          handleSelectFile({ path: targetPath });
        }
      } else if (repoFiles.length > 0 && !selectedFile) {
        handleSelectFile(repoFiles[0]);
      }
    };

    initFiles();
  }, [repo, searchParams]);

  const handleSelectFile = async (file) => {
    setSelectedFile(file);
    setContentError(null);
    setLoadingContent(true);

    try {
      const res = await repositoryService.getFileContent(repo.id, file.path);
      if (res.success && res.content !== undefined) {
        setSourceCode(res.content);
      } else {
        setContentError('Source content not available.');
      }
    } catch (err) {
      setContentError(err.message || 'Failed to load source code.');
      setSourceCode(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleNavigateToFile = (filePath) => {
    const found = files.find((f) => f.path === filePath);
    if (found) {
      handleSelectFile(found);
      setSearchParams({ file: filePath });
    } else {
      handleSelectFile({ path: filePath });
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[620px] grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Left Column: File Tree */}
      <div className="md:col-span-3 h-full">
        <FileTree
          files={files}
          selectedPath={selectedFile?.path}
          onSelectFile={(f) => {
            handleSelectFile(f);
            setSearchParams({ file: f.path });
          }}
        />
      </div>

      {/* Middle Column: Source Code Viewer */}
      <div className="md:col-span-6 h-full">
        <SourceViewer
          filePath={selectedFile?.path}
          content={sourceCode}
          language={selectedFile?.language || 'JavaScript'}
          isLoading={loadingContent}
          error={contentError}
        />
      </div>

      {/* Right Column: File Details & Dependency Inspector */}
      <div className="md:col-span-3 h-full">
        <FileDetailsPanel
          selectedFile={selectedFile}
          onNavigateToFile={handleNavigateToFile}
        />
      </div>
    </div>
  );
}
