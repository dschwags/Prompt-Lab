import { WorkshopSession, AIResponseFeedback } from '../../types';
import { IterationCard } from './IterationCard';
import { PivotControls } from './PivotControls';

interface TimelineProps {
  session: WorkshopSession | null;
  winnerId?: string;
  onSelectWinner: (responseId: string) => void;
  onLockIn: (modelId: string) => void;
  onExecuteRound: (pivot?: string) => void;
  onMarkCheckpoint: (pivot: string) => void;
  isLoading?: boolean;
  onSpeak?: (text: string) => void;
  onFeedback?: (responseId: string, feedback: AIResponseFeedback) => void;
  onReplaceModel?: (responseId: string) => void;
}

export function Timeline({
  session,
  winnerId,
  onSelectWinner,
  onLockIn,
  onExecuteRound,
  onMarkCheckpoint,
  isLoading = false,
  onSpeak,
  onFeedback,
  onReplaceModel
}: TimelineProps) {
  if (!session) {
    return (
      <div className="max-w-6xl mx-auto text-center py-32 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
            No Active Workshop
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Select at least 2 models and enter a prompt above to start your workshop session.
          </p>
        </div>
      </div>
    );
  }

  const currentIteration = session.iterations[session.currentIterationIndex];
  const currentRound = currentIteration?.rounds.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-32 pb-40">
      {/* Iterations Timeline */}
      {session.iterations.map((iteration, index) => (
        <IterationCard
          key={index}
          iteration={iteration}
          promptData={session.promptData}
          winnerId={winnerId}
          onSelectWinner={onSelectWinner}
          onLockIn={onLockIn}
          onSpeak={onSpeak}
          onFeedback={onFeedback}
          onReplaceModel={onReplaceModel}
        />
      ))}

      {/* Pivot Controls (only show if session is active) */}
      {session.iterations.length > 0 && (
        <PivotControls
          onExecuteRound={onExecuteRound}
          onMarkCheckpoint={onMarkCheckpoint}
          isLoading={isLoading}
          currentRound={currentRound}
        />
      )}
    </div>
  );
}
