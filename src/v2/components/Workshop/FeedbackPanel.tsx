import { useState } from 'react';
import { Brain, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AIResponse, AIResponseFeedback } from '../../types';

interface FeedbackPanelProps {
  response: AIResponse;
  onFeedback: (feedback: AIResponseFeedback) => void;
}

export function FeedbackPanel({ response, onFeedback }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<AIResponseFeedback | undefined>(response.feedback);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Calculate TPS from time and tokens
  const tps = response.metrics.time > 0 
    ? (response.metrics.tokens / response.metrics.time).toFixed(1)
    : '0.0';

  // Format cost as USD
  const costFormatted = response.metrics.cost > 0.001
    ? `$${(response.metrics.cost * 1000).toFixed(3)}`
    : '<$0.001';

  const handleVote = (type: 'relevance' | 'tone', value: 1 | 0 | -1) => {
    const newFeedback: AIResponseFeedback = {
      relevance: type === 'relevance' ? value : (feedback?.relevance ?? 0),
      tone: type === 'tone' ? value : (feedback?.tone ?? 0),
      timestamp: Date.now(),
    };
    setFeedback(newFeedback);
    onFeedback(newFeedback);
  };

  return (
    <div className="flex items-center gap-3 text-[10px] text-slate-400">
      {/* Performance Metrics */}
      <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg">
        <span className="font-mono">{response.metrics.time.toFixed(1)}s</span>
        <span className="text-slate-300">|</span>
        <span className="font-mono">{tps} t/s</span>
        <span className="text-slate-300">|</span>
        <span className="font-mono text-slate-500">{costFormatted}</span>
      </div>

      {/* Two-Track Feedback */}
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
        {/* Brain Icon - Technical Relevance */}
        <div className="relative">
          <div
            className="flex items-center gap-1.5"
            onMouseEnter={() => setShowTooltip('relevance')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <Brain 
              size={14} 
              className={feedback?.relevance === 1 ? 'text-indigo-600' : feedback?.relevance === -1 ? 'text-red-500' : 'text-slate-400'} 
            />
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleVote('relevance', feedback?.relevance === 1 ? 0 : 1)}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback?.relevance === 1 ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <ThumbsUp size={12} />
              </button>
              <button
                onClick={() => handleVote('relevance', feedback?.relevance === -1 ? 0 : -1)}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback?.relevance === -1 ? 'text-red-500' : 'text-slate-400'}`}
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip === 'relevance' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-50">
              <p className="font-bold mb-1">Technical Relevance</p>
              <p className="text-slate-300">Rate the logic and accuracy. Did the model follow instructions and get the facts right?</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900" />
            </div>
          )}
        </div>

        {/* Speech Bubble Icon - Tone & Tact */}
        <div className="relative">
          <div
            className="flex items-center gap-1.5"
            onMouseEnter={() => setShowTooltip('tone')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <MessageCircle 
              size={14} 
              className={feedback?.tone === 1 ? 'text-purple-600' : feedback?.tone === -1 ? 'text-red-500' : 'text-slate-400'} 
            />
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleVote('tone', feedback?.tone === 1 ? 0 : 1)}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback?.tone === 1 ? 'text-purple-600' : 'text-slate-400'}`}
              >
                <ThumbsUp size={12} />
              </button>
              <button
                onClick={() => handleVote('tone', feedback?.tone === -1 ? 0 : -1)}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${feedback?.tone === -1 ? 'text-red-500' : 'text-slate-400'}`}
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip === 'tone' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-50">
              <p className="font-bold mb-1">Tone & Delivery</p>
              <p className="text-slate-300">Rate the personality and style. Did the model use the right tone, voice, and brand personality?</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
