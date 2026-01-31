/**
 * Parallel Response Grid Component
 * 
 * FILE: ParallelResponseGrid.tsx
 * PURPOSE: Display multiple model responses in a grid layout
 * 
 * Features:
 * - Responsive grid (1-3 columns based on model count)
 * - Reuses existing ResponseViewer component
 * - Progress bar for loading states
 * - Star button for each response
 * - Visual comparison of metrics
 */

import { useState, useCallback } from 'react';
import type { IterationResponse } from '../../types/Workshop';
import { ResponseViewer } from '../PromptEditor/ResponseViewer';
import type { ResponseDisplay } from '../../types/ResponseMetrics';

interface ParallelResponseGridProps {
  responses: IterationResponse[];
  onStarToggle: (modelId: string, response: IterationResponse) => void;
  starredIds: Set<string>;
}

export function ParallelResponseGrid({
  responses,
  onStarToggle,
  starredIds,
}: ParallelResponseGridProps) {
  const loadingCount = responses.filter(r => r.status === 'loading').length;
  const completeCount = responses.filter(r => r.status === 'complete').length;
  const errorCount = responses.filter(r => r.status === 'error').length;
  const totalCount = responses.length;

  // Calculate grid columns based on model count
  const gridCols = totalCount <= 2 ? 'grid-cols-2' : totalCount <= 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-3';

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>No responses yet. Select models and click "Send to All"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {(loadingCount > 0 || completeCount < totalCount) && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {completeCount}/{totalCount} responses received
            </span>
            <span className="text-zinc-500">
              {loadingCount > 0 ? 'Loading...' : `${totalCount - completeCount - errorCount} pending`}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(completeCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Response Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {responses.map((response) => (
          <ResponseCard
            key={response.modelId}
            response={response}
            isStarred={starredIds.has(response.modelId)}
            onStarToggle={() => onStarToggle(response.modelId, response)}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <SummaryStats responses={responses} />
    </div>
  );
}

// === RESPONSE CARD ===

interface ResponseCardProps {
  response: IterationResponse;
  isStarred: boolean;
  onStarToggle: () => void;
}

function ResponseCard({
  response,
  isStarred,
  onStarToggle,
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(response.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [response.text]);

  if (response.status === 'pending') {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 h-48 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <span className="text-2xl">⏳</span>
          <p className="text-sm mt-1">Waiting...</p>
        </div>
      </div>
    );
  }

  if (response.status === 'loading') {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-zinc-300 flex items-center gap-2">
            <span className="animate-pulse">⏳</span>
            {response.modelName}
          </span>
          <span className="text-xs text-zinc-500">{response.region}</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-700 rounded animate-pulse" />
          <div className="h-4 bg-zinc-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-zinc-700 rounded animate-pulse w-1/2" />
        </div>
        <div className="mt-4 text-xs text-zinc-500">Loading response...</div>
      </div>
    );
  }

  if (response.status === 'error') {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-red-400 flex items-center gap-2">
            <span>❌</span>
            {response.modelName}
          </span>
          <span className="text-xs text-zinc-500">{response.region}</span>
        </div>
        <div className="text-sm text-red-300 bg-red-900/30 p-2 rounded">
          {response.errorMessage || 'Unknown error occurred'}
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Cost: $0 (no response)
        </div>
      </div>
    );
  }

  // Complete response - use existing ResponseViewer
  const displayData: ResponseDisplay = {
    text: response.text,
    model: response.modelName,
    timeSeconds: response.timeSeconds,
    cost: response.cost,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
  };

  return (
    <div className={`relative bg-zinc-800/50 border rounded-lg overflow-hidden transition-colors ${
      isStarred ? 'border-yellow-600/50 bg-yellow-900/10' : 'border-zinc-700 hover:border-zinc-600'
    }`}>
      {/* Header with Star */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-sm">{response.region}</span>
          <span className="font-medium text-zinc-200 text-sm">
            {response.modelName}
          </span>
        </div>
        <button
          onClick={onStarToggle}
          className={`text-lg transition-transform hover:scale-110 ${
            isStarred ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'
          }`}
          title={isStarred ? 'Unstar this response' : 'Star this response'}
        >
          {isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* Response Content */}
      <div className="p-3">
        <ResponseViewer response={displayData} />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 px-3 py-2 bg-zinc-800/50 border-t border-zinc-700">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors text-zinc-300"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      {/* Starred Indicator */}
      {isStarred && (
        <div className="absolute top-2 right-10 text-yellow-400">
          <span className="text-sm">⭐</span>
        </div>
      )}
    </div>
  );
}

// === SUMMARY STATS ===

interface SummaryStatsProps {
  responses: IterationResponse[];
}

function SummaryStats({ responses }: SummaryStatsProps) {
  const complete = responses.filter(r => r.status === 'complete');
  const totalCost = complete.reduce((sum, r) => sum + r.cost, 0);
  const totalTime = complete.reduce((sum, r) => sum + r.timeSeconds, 0);
  const avgTime = complete.length > 0 ? totalTime / complete.length : 0;

  const fastest = complete.length > 0 ? Math.min(...complete.map(r => r.timeSeconds)) : 0;
  const slowest = complete.length > 0 ? Math.max(...complete.map(r => r.timeSeconds)) : 0;
  const cheapest = complete.length > 0 ? Math.min(...complete.map(r => r.cost)) : 0;
  const expensive = complete.length > 0 ? Math.max(...complete.map(r => r.cost)) : 0;

  if (complete.length === 0) return null;

  return (
    <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
      <h4 className="text-sm font-medium text-zinc-400 mb-3">Session Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <StatItem label="Total Cost" value={`$${totalCost.toFixed(4)}`} icon="💰" />
        <StatItem label="Avg Time" value={`${avgTime.toFixed(1)}s`} icon="⏱️" />
        <StatItem label="Range (Time)" value={`${fastest.toFixed(1)}-${slowest.toFixed(1)}s`} icon="📊" />
        <StatItem label="Range (Cost)" value={`$${cheapest.toFixed(4)}-$${expensive.toFixed(4)}`} icon="💵" />
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="font-mono text-zinc-200">{value}</div>
      </div>
    </div>
  );
}
