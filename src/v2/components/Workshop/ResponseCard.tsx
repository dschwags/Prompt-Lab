import { useState } from 'react';
import { Trophy, Volume2, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { AIResponse, AIResponseFeedback } from '../../types';
import { MODEL_COLORS, getColorHex } from '../../config/model-colors';
import { FeedbackPanel } from './FeedbackPanel';

interface ResponseCardProps {
  response: AIResponse;
  isWinner?: boolean;
  isLocked?: boolean;
  onSelectWinner: () => void;
  onLock: () => void;
  onSpeak?: (text: string) => void;
  onFeedback?: (feedback: AIResponseFeedback) => void;
  onReplaceModel?: () => void;
}

export function ResponseCard({
  response,
  isWinner = false,
  isLocked = false,
  onSelectWinner,
  onLock,
  onSpeak,
  onFeedback,
  onReplaceModel
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  // Get color hex from response
  const colorHex = response.color ? getColorHex(response.color) : MODEL_COLORS.blue.hex;

  // Merge winner status from prop and response object
  const showWinner = isWinner || response.isWinner;

  const handleCopy = async () => {
    const costFormatted = response.metrics.cost > 0.001 
      ? `$${(response.metrics.cost * 1000).toFixed(3)}` 
      : '<$0.001';
    
    const copyText = `[${response.model}]
Time: ${response.metrics.time.toFixed(1)}s | Cost: ${costFormatted}

${response.text}`;
    
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackInternal = (feedback: AIResponseFeedback) => {
    if (onFeedback) {
      onFeedback(feedback);
    }
  };

  return (
    <div
      style={{ borderLeftColor: colorHex, borderLeftWidth: '8px' }}
      className={`flex flex-col h-full rounded-3xl border-2 border-r-slate-200 border-t-slate-200 border-b-slate-200 transition-all duration-500 ${
        showWinner
          ? 'border-indigo-500 bg-indigo-50/30 shadow-xl scale-[1.01]'
          : 'bg-white hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div
        className={`px-5 py-3 border-b flex justify-between items-center ${
          isWinner ? 'bg-indigo-100/50 border-indigo-200' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              showWinner ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'
            }`}
            style={{ backgroundColor: showWinner ? undefined : colorHex }}
          />
          <span className="text-xs font-black uppercase text-slate-600 truncate">
            {response.model}
          </span>
          {showWinner && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase flex-shrink-0">
              Winner
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Action Buttons */}
          {onSpeak && (
            <button
              onClick={() => onSpeak(response.text)}
              className="text-indigo-600 hover:scale-110 transition-transform"
              title="Read aloud"
            >
              <Volume2 size={14} />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          </button>

          {/* Metrics */}
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-mono text-slate-500">
            {response.metrics.time.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Response Content */}
      <div className="p-6 flex-grow overflow-y-auto text-sm text-slate-700 leading-relaxed max-h-[400px]">
        {response.status === 'loading' && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
        )}

        {response.status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500 text-xs italic bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="font-bold mb-1">Error</p>
              <p>{response.error || 'An unknown error occurred'}</p>
            </div>
            
            {onReplaceModel && (
              <button
                onClick={onReplaceModel}
                className="w-full py-3 bg-amber-600 text-white rounded-2xl text-xs font-black hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Replace This Model</span>
              </button>
            )}
          </div>
        )}

        {response.status === 'success' && (
          <div className="whitespace-pre-wrap">{response.text}</div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-3">
        {/* Performance Metrics & Feedback */}
        {response.status === 'success' && (
          <FeedbackPanel 
            response={response} 
            onFeedback={handleFeedbackInternal}
          />
        )}

        {/* Pick Winner Button */}
        <button
          onClick={onSelectWinner}
          disabled={response.status !== 'success'}
          className={`w-full py-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
            isWinner
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isWinner ? (
            <>
              <Trophy size={14} />
              <span>Selected Winner</span>
            </>
          ) : (
            'Pick Winner'
          )}
        </button>

        {/* Lock-in Button (only show for winner) */}
        {isWinner && (
          <button
            onClick={onLock}
            className={`w-full py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${
              isLocked
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50'
            }`}
          >
            {isLocked ? (
              <>
                <CheckCircle size={12} />
                <span>Deep-Dive Locked</span>
              </>
            ) : (
              'Lock for Deep-Dive?'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
