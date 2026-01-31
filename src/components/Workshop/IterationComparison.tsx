/**
 * Iteration Comparison View Component
 * Side-by-side comparison of responses across iterations
 */

import { useState } from 'react';
import type { WorkshopIteration, IterationResponse } from '../../types/Workshop';

interface IterationComparisonProps {
  iterations: WorkshopIteration[];
  onRestoreIteration: (iteration: WorkshopIteration) => void;
}

export function IterationComparison({
  iterations,
  onRestoreIteration,
}: IterationComparisonProps) {
  const [selectedIteration1, setSelectedIteration1] = useState<string | null>(
    iterations.length > 1 ? iterations[iterations.length - 2]?.id ?? null : null
  );
  const [selectedIteration2, setSelectedIteration2] = useState<string | null>(
    iterations.length > 0 ? iterations[iterations.length - 1]?.id ?? null : null
  );
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const iter1 = iterations.find(i => i.id === selectedIteration1);
  const iter2 = iterations.find(i => i.id === selectedIteration2);

  if (iterations.length < 2) {
    return (
      <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-medium text-zinc-300 mb-2">
          Need at least 2 iterations
        </h3>
        <p className="text-sm text-zinc-500">
          Run more iterations with different prompts to enable comparison.
        </p>
      </div>
    );
  }

  const allModels = Array.from(new Set([
    ...(iter1?.modelIds ?? []),
    ...(iter2?.modelIds ?? []),
  ]));

  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400">🔍 Iteration Comparison</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'side-by-side' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'unified' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              Unified
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Iteration A</label>
            <select
              value={selectedIteration1 ?? ''}
              onChange={(e) => setSelectedIteration1(e.target.value || null)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-300 text-sm"
            >
              {iterations.map(iter => (
                <option key={iter.id} value={iter.id}>
                  #{iter.iterationNumber} - {new Date(iter.createdAt).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </div>

          <div className="text-zinc-500 pt-5">↔️</div>

          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Iteration B</label>
            <select
              value={selectedIteration2 ?? ''}
              onChange={(e) => setSelectedIteration2(e.target.value || null)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-300 text-sm"
            >
              {iterations.map(iter => (
                <option key={iter.id} value={iter.id}>
                  #{iter.iterationNumber} - {new Date(iter.createdAt).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {iter1 && iter2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <ComparisonMetric
              label="Total Responses"
              valueA={iter1.responses.filter(r => r.status === 'complete').length}
              valueB={iter2.responses.filter(r => r.status === 'complete').length}
            />
            <ComparisonMetric
              label="Avg Time"
              valueA={calculateAvgTime(iter1.responses)}
              valueB={calculateAvgTime(iter2.responses)}
              suffix="s"
            />
            <ComparisonMetric
              label="Total Cost"
              valueA={calculateTotalCost(iter1.responses)}
              valueB={calculateTotalCost(iter2.responses)}
              prefix="$"
            />
            <ComparisonMetric
              label="Models Tested"
              valueA={iter1.modelIds.length}
              valueB={iter2.modelIds.length}
            />
          </div>

          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-zinc-400 mb-3">Model Comparison</h4>
            
            <div className="space-y-4">
              {allModels.map(modelId => {
                const response1 = iter1.responses.find(r => r.modelId === modelId);
                const response2 = iter2.responses.find(r => r.modelId === modelId);
                
                return (
                  <ModelComparisonRow
                    key={modelId}
                    modelName={response1?.modelName ?? response2?.modelName ?? modelId}
                    response1={response1 ?? null}
                    response2={response2 ?? null}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          </div>

          {iter2 && (
            <button
              onClick={() => onRestoreIteration(iter2)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Restore Iteration {iter2.iterationNumber} Prompts</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonMetric({
  label,
  valueA,
  valueB,
  prefix = '',
  suffix = '',
}: {
  label: string;
  valueA: number;
  valueB: number;
  prefix?: string;
  suffix?: string;
}) {
  const diff = valueB - valueA;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-lg font-medium text-zinc-300">
        {prefix}{typeof valueA === 'number' ? valueA.toFixed(1) : valueA}{suffix}
        {' → '}
        {prefix}{typeof valueB === 'number' ? valueB.toFixed(1) : valueB}{suffix}
      </div>
      {diff !== 0 && (
        <div className={`text-xs ${isPositive ? 'text-red-400' : isNegative ? 'text-green-400' : 'text-zinc-500'}`}>
          {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(diff).toFixed(2)}{suffix}
        </div>
      )}
    </div>
  );
}

function ModelComparisonRow({
  modelName,
  response1,
  response2,
  viewMode,
}: {
  modelName: string;
  response1: IterationResponse | null;
  response2: IterationResponse | null;
  viewMode: 'side-by-side' | 'unified';
}) {
  const hasResponse1 = response1?.status === 'complete';
  const hasResponse2 = response2?.status === 'complete';
  
  if (viewMode === 'side-by-side') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">{modelName}</span>
            {response1 && <span className="text-xs text-zinc-500">{response1.timeSeconds.toFixed(1)}s</span>}
          </div>
          {hasResponse1 ? (
            <div className="text-xs text-zinc-400 line-clamp-4">{response1?.text}</div>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              {response1?.status === 'error' ? `Error: ${response1.errorMessage}` : 'No response'}
            </div>
          )}
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">{modelName}</span>
            {response2 && <span className="text-xs text-zinc-500">{response2.timeSeconds.toFixed(1)}s</span>}
          </div>
          {hasResponse2 ? (
            <div className="text-xs text-zinc-400 line-clamp-4">{response2?.text}</div>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              {response2?.status === 'error' ? `Error: ${response2.errorMessage}` : 'No response'}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-300">{modelName}</span>
        <div className="flex items-center gap-2 text-xs">
          {response1 && <span className="text-zinc-500">{response1.timeSeconds.toFixed(1)}s</span>}
          <span>→</span>
          {response2 && <span className="text-zinc-500">{response2.timeSeconds.toFixed(1)}s</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-xs">
          <div className="text-zinc-600 mb-1">Iteration A:</div>
          {hasResponse1 ? (
            <div className="text-zinc-400 line-clamp-3">{response1?.text}</div>
          ) : (
            <div className="text-zinc-500 italic">No response</div>
          )}
        </div>
        <div className="text-xs">
          <div className="text-zinc-600 mb-1">Iteration B:</div>
          {hasResponse2 ? (
            <div className="text-zinc-400 line-clamp-3">{response2?.text}</div>
          ) : (
            <div className="text-zinc-500 italic">No response</div>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateAvgTime(responses: IterationResponse[]): number {
  const complete = responses.filter(r => r.status === 'complete');
  if (complete.length === 0) return 0;
  return complete.reduce((sum, r) => sum + r.timeSeconds, 0) / complete.length;
}

function calculateTotalCost(responses: IterationResponse[]): number {
  const complete = responses.filter(r => r.status === 'complete');
  return complete.reduce((sum, r) => sum + r.cost, 0);
}
