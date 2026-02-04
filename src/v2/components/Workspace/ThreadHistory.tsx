import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Trash2, Plus } from 'lucide-react';
import { listThreads, deleteThread, type ThreadSummary } from '../../services/workspace-api';

interface ThreadHistoryProps {
  projectName: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
}

export function ThreadHistory({ projectName, onSelectThread, onNewThread }: ThreadHistoryProps) {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Load threads when project changes
  useEffect(() => {
    if (projectName) {
      loadThreads(projectName);
    } else {
      setThreads([]);
    }
  }, [projectName]);
  
  const loadThreads = async (project: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await listThreads(project);
      setThreads(list);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectName) return;
    
    const confirmDelete = window.confirm('Delete this session? This cannot be undone.');
    if (!confirmDelete) return;
    
    setDeletingId(threadId);
    try {
      await deleteThread(projectName, threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
    } catch (err) {
      setError('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };
  
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Session History</span>
          </div>
          <button
            onClick={onNewThread}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} />
            New
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {projectName ? `Sessions for ${projectName}` : 'Select a project first'}
        </p>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mx-3 mt-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}
      
      {/* Thread List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            Loading sessions...
          </div>
        ) : !projectName ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            Select a project to view sessions
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            No sessions yet
            <br />
            <span className="text-xs">Click "New" to start a session</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 text-sm truncate">
                      {thread.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(thread.updatedAt)}
                      </span>
                      <span>{thread.iterationCount} rounds</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {thread.winnerCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                        ✓{thread.winnerCount}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(thread.id, e)}
                      disabled={deletingId === thread.id}
                      className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Model count */}
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                    {thread.modelCount} models
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
