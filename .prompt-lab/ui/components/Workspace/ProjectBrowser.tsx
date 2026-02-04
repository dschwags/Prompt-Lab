import { useState, useEffect } from 'react';
import { Folder, FileCode, FileText, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { listProjects, getProjectTree, readProjectFile, type FileNode } from '../../services/workspace-api';

interface ProjectBrowserProps {
  onSelectFile: (project: string, filePath: string, content: string) => void;
  selectedProject?: string | null;
}

export function ProjectBrowser({ onSelectFile, selectedProject: externalProject }: ProjectBrowserProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(externalProject || null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Load file tree when project changes
  useEffect(() => {
    if (selectedProject) {
      loadProjectTree(selectedProject);
    }
  }, [selectedProject]);
  
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listProjects();
      setProjects(list);
      // Auto-select first project if none selected
      if (!selectedProject && list.length > 0) {
        setSelectedProject(list[0]);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };
  
  const loadProjectTree = async (project: string) => {
    setLoadingProject(true);
    setError(null);
    try {
      const tree = await getProjectTree(project);
      setFileTree(tree);
    } catch (err) {
      setError('Failed to load project files');
    } finally {
      setLoadingProject(false);
    }
  };
  
  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };
  
  const handleFileClick = async (node: FileNode) => {
    if (node.type === 'file' && selectedProject) {
      const content = await readProjectFile(selectedProject, node.path);
      if (content !== null) {
        onSelectFile(selectedProject, node.path, content);
      }
    } else if (node.type === 'directory') {
      toggleDir(node.path);
    }
  };
  
  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return expandedDirs.has(node.path) ? (
        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
      ) : (
        <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
      );
    }
    
    const ext = node.language;
    if (ext === 'ts' || ext === 'tsx') return <FileCode size={14} className="text-blue-500 flex-shrink-0" />;
    if (ext === 'js' || ext === 'jsx') return <FileCode size={14} className="text-yellow-500 flex-shrink-0" />;
    if (ext === 'py') return <FileCode size={14} className="text-green-500 flex-shrink-0" />;
    if (ext === 'md') return <FileText size={14} className="text-emerald-500 flex-shrink-0" />;
    if (ext === 'json') return <FileCode size={14} className="text-amber-500 flex-shrink-0" />;
    return <FileCode size={14} className="text-slate-400 flex-shrink-0" />;
  };
  
  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const paddingLeft = `${depth * 16 + 8}px`;
    
    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-100 cursor-pointer text-sm rounded-lg mx-1 transition-colors ${
            node.type === 'file' ? 'text-slate-700' : 'text-slate-900 font-medium'
          }`}
          style={{ paddingLeft }}
          onClick={() => handleFileClick(node)}
        >
          {getFileIcon(node)}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Project Selector */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Project</label>
          <button
            onClick={loadProjects}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Refresh projects"
          >
            <RefreshCw size={14} className="text-slate-400" />
          </button>
        </div>
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value || null)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          disabled={loading}
        >
          <option value="">Select a project...</option>
          {projects.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mx-3 mt-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}
      
      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            Loading projects...
          </div>
        ) : selectedProject ? (
          loadingProject ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              Loading files...
            </div>
          ) : fileTree.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No files found
            </div>
          ) : (
            <div className="py-2">
              {fileTree.map(node => renderNode(node))}
            </div>
          )
        ) : (
          <div className="p-4 text-center text-slate-500 text-sm">
            <Folder size={24} className="mx-auto mb-2 opacity-50" />
            Select a project to browse files
          </div>
        )}
      </div>
    </div>
  );
}
