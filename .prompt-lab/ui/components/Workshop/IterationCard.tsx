import { Layers, Lock } from 'lucide-react';
import { WorkshopIteration, AIResponseFeedback } from '../../types';
import { ResponseCard } from './ResponseCard';

interface IterationCardProps {
  iteration: WorkshopIteration;
  promptData?: {
    system: string;
    user: string;
  };
  winnerId?: string;
  onSelectWinner: (responseId: string) => void;
  onLockIn: (modelId: string) => void;
  onSpeak?: (text: string) => void;
  onFeedback?: (responseId: string, feedback: AIResponseFeedback) => void;
  onReplaceModel?: (responseId: string) => void;
}

export function IterationCard({
  iteration,
  promptData,
  winnerId,
  onSelectWinner,
  onLockIn,
  onSpeak,
  onFeedback,
  onReplaceModel
}: IterationCardProps) {
  return (
    <div className="space-y-16 p-12 bg-white border border-slate-100 rounded-3xl shadow-xl animate-in fade-in duration-500">
      {/* Iteration Header */}
      <div className="flex items-center gap-6">
        <div className="bg-purple-600 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-xl flex items-center gap-3">
          <Layers size={14} />
          <span>ITERATION {iteration.number}</span>
        </div>
        
        <div className="h-px flex-grow bg-purple-100" />
        
        {iteration.lockedModelId && (
          <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl border border-amber-100 text-xs font-black flex items-center gap-2">
            <Lock size={12} />
            <span>{iteration.lockedModelId.split('/').pop()}</span>
          </div>
        )}

        <div className="px-4 py-1.5 rounded-xl bg-slate-100 text-xs font-black text-slate-500 uppercase tracking-wider">
          {iteration.status}
        </div>
      </div>

      {/* Rounds */}
      {iteration.rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="space-y-10">
          {/* Round Header */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs border-4 border-white shadow-xl">
              {round.number}
            </div>
            <h2 className="text-md font-black text-slate-700 uppercase tracking-tight">
              {round.type === 'initial' ? 'Initial' : 'Discussion'} Round
            </h2>
          </div>

          {/* Prompts Display - Only for Initial Round */}
          {round.type === 'initial' && promptData && (
            <div className="ml-14 space-y-4 mt-6">
              {promptData.system && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    System Prompt
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed">
                    {promptData.system}
                  </div>
                </div>
              )}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  User Prompt
                </div>
                <div className="text-sm text-indigo-900 leading-relaxed">
                  {promptData.user}
                </div>
              </div>
            </div>
          )}

          {/* Pivot Message */}
          {round.pivot && (
            <div className="ml-14 p-5 rounded-3xl bg-amber-50 border border-amber-100 text-sm italic text-amber-900">
              <span className="font-bold not-italic">Human Pivot:</span> "{round.pivot}"
            </div>
          )}

          {/* Response Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {round.responses.map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                isWinner={winnerId === response.id}
                isLocked={iteration.lockedModelId === response.modelId}
                onSelectWinner={() => onSelectWinner(response.id)}
                onLock={() => onLockIn(response.modelId)}
                onSpeak={onSpeak}
                onFeedback={onFeedback ? (feedback) => onFeedback(response.id, feedback) : undefined}
                onReplaceModel={response.status === 'error' ? () => onReplaceModel?.(response.id) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
