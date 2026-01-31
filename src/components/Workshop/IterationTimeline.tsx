/**
 * Iteration Timeline Component
 * Visual timeline showing prompt evolution across iterations
 */

import type { WorkshopIteration } from '../../types/Workshop';

interface IterationTimelineProps {
  iterations: WorkshopIteration[];
  currentIterationId: string | null;
  onSelectIteration: (iteration: WorkshopIteration) => void;
}

export function IterationTimeline({
  iterations,
  currentIterationId,
  onSelectIteration,
}: IterationTimelineProps) {
  if (iterations.length === 0) return null;

  return (
    <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">
        📅 Prompt Evolution Timeline
      </h3>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-700" />
        
        <div className="space-y-2">
          {iterations.map((iteration, index) => {
            const isSelected = iteration.id === currentIterationId;
            const isLatest = index === iterations.length - 1;
            
            return (
              <div
                key={iteration.id}
                onClick={() => onSelectIteration(iteration)}
                className={`relative pl-10 cursor-pointer transition-all ${
                  isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                }`}
              >
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                  isSelected
                    ? 'bg-blue-500 border-blue-400'
                    : isLatest
                      ? 'bg-green-500 border-green-400'
                      : 'bg-zinc-600 border-zinc-500'
                }`} />
                
                <div className={`bg-zinc-800 border rounded-lg p-3 ${
                  isSelected ? 'border-blue-500' : 'border-zinc-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-zinc-300'}`}>
                      Iteration {iteration.iterationNumber}
                      {isLatest && <span className="ml-2 text-xs text-green-400">(Latest)</span>}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(iteration.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{iteration.modelIds.length} models</span>
                    <span>•</span>
                    <span>{iteration.responses.filter(r => r.status === 'complete').length} complete</span>
                  </div>
                  
                  {iteration.promptChanged && (
                    <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                      <span>✏️</span>
                      <span>Prompt modified</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
