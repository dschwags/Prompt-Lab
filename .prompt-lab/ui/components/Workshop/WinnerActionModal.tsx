import { Users, Target, RefreshCw, X } from 'lucide-react';

interface WinnerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerModelName: string;
  loserModelName: string;
  onSelectAction: (action: 'keep-both' | 'lock-winner' | 'replace-loser') => void;
}

export function WinnerActionModal({
  isOpen,
  onClose,
  winnerModelName,
  loserModelName,
  onSelectAction
}: WinnerActionModalProps) {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'keep-both' as const,
      icon: Users,
      title: 'Keep Both Models',
      description: 'Both models continue to the discussion round',
      color: 'blue',
      emoji: '🤝'
    },
    {
      id: 'lock-winner' as const,
      icon: Target,
      title: 'Lock to Winner',
      description: `Only ${winnerModelName} continues (deep-dive mode)`,
      color: 'purple',
      emoji: '🎯'
    },
    {
      id: 'replace-loser' as const,
      icon: RefreshCw,
      title: 'Replace Losing Model',
      description: `Swap ${loserModelName} with a different model`,
      color: 'amber',
      emoji: '🔄'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Great Choice! What's Next?
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                You picked <span className="font-bold text-indigo-600">{winnerModelName}</span> as the winner
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="text-slate-400" size={24} />
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onSelectAction(action.id);
                onClose();
              }}
              className={`group relative p-6 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                action.color === 'blue'
                  ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100'
                  : action.color === 'purple'
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100'
                  : 'border-amber-200 bg-amber-50 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-100'
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
                action.color === 'blue'
                  ? 'bg-blue-100'
                  : action.color === 'purple'
                  ? 'bg-purple-100'
                  : 'bg-amber-100'
              }`}>
                {action.emoji}
              </div>

              {/* Title */}
              <h4 className={`font-black text-sm uppercase tracking-tight mb-2 ${
                action.color === 'blue'
                  ? 'text-blue-900'
                  : action.color === 'purple'
                  ? 'text-purple-900'
                  : 'text-amber-900'
              }`}>
                {action.title}
              </h4>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {action.description}
              </p>

              {/* Hover Arrow */}
              <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                action.color === 'blue'
                  ? 'text-blue-600'
                  : action.color === 'purple'
                  ? 'text-purple-600'
                  : 'text-amber-600'
              }`}>
                →
              </div>
            </button>
          ))}
        </div>

        {/* Helper Text */}
        <div className="px-8 pb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-700">💡 Tip:</strong> "Keep Both" is best for exploring different perspectives. 
              "Lock to Winner" focuses on refining the best approach. "Replace" brings fresh ideas into the discussion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
