import { useState } from 'react';
import { Folder, Clock } from 'lucide-react';
import { ProjectBrowser } from './ProjectBrowser';
import { ThreadHistory } from './ThreadHistory';

interface WorkspacePanelProps {
  activeProject: string | null;
  onSelectFile: (project: string, filePath: string, content: string) => void;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
}

export function WorkspacePanel({ 
  activeProject, 
  onSelectFile, 
  onSelectThread,
  onNewThread 
}: WorkspacePanelProps) {
  const [view, setView] = useState<'files' | 'history'>('files');
  
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-80">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setView('files')}
          className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            view === 'files' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Folder size={16} />
          Files
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            view === 'history' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock size={16} />
          History
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'files' ? (
          <ProjectBrowser 
            onSelectFile={onSelectFile}
            selectedProject={activeProject}
          />
        ) : (
          <ThreadHistory
            projectName={activeProject}
            onSelectThread={onSelectThread}
            onNewThread={onNewThread}
          />
        )}
      </div>
    </div>
  );
}
