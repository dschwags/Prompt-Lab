/**
 * Response Viewer Component
 * 
 * FILE: ResponseViewer-20250129-0345.tsx
 * INSTALL AS: src/components/PromptEditor/ResponseViewer.tsx
 * 
 * Displays response with "The Big 3" metrics:
 * ⏱️ Time - "Is this too slow?"
 * 💰 Cost - "Is this too expensive?"
 * 📊 Tokens - "Why is it expensive?"
 * 📋 Copy - "Save this to my notes"
 */

import { useState } from 'react';
import type { ResponseDisplay } from '../../types/ResponseMetrics';

interface ResponseViewerProps {
  response: ResponseDisplay;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with model name */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-50">
          🤖 {response.model}
        </h3>
      </div>

      {/* The Big 3 Metrics + Copy */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-lg">
        {/* Time */}
        <div className="flex items-center gap-1.5">
          <span>⏱️</span>
          <span className="font-mono">{response.timeSeconds.toFixed(1)}s</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-1.5">
          <span>💰</span>
          <span className="font-mono">${response.cost.toFixed(4)}</span>
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-1.5">
          <span>📊</span>
          <span className="font-mono">
            {response.inputTokens}→{response.outputTokens} tok
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors text-zinc-200"
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copied</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Response Text */}
      <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-4">
        <div className="prose prose-invert max-w-none">
          <div className="text-zinc-50 whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {response.text}
          </div>
        </div>
      </div>
    </div>
  );
}
