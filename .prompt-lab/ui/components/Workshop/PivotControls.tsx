import { useState } from 'react';
import { MessageSquare, Flag, ArrowRight, HelpCircle } from 'lucide-react';

interface PivotControlsProps {
  onExecuteRound: (pivot?: string) => void;
  onMarkCheckpoint: (pivot: string) => void;
  isLoading?: boolean;
  currentRound: number;
}

// Tooltip content for buttons
const EXECUTE_ROUND_TOOLTIP = {
  title: 'Execute Round',
  description: 'Continue the current iteration with your feedback.',
  details: [
    '• Uses the same model lineup as the current iteration',
    '• All models respond to your feedback/pivot',
    '• Great for iterative refinement of responses',
    '• Responses build on previous context'
  ]
};

const MARK_CHECKPOINT_TOOLTIP = {
  title: 'Mark Checkpoint',
  description: 'Start a fresh iteration with new context.',
  details: [
    '• Creates a new iteration ( Iteration #N+1 )',
    '• Provides fresh context from the winner response',
    '• Models start with clean context',
    '• Best for major direction changes or pivots'
  ]
};

export function PivotControls({
  onExecuteRound,
  onMarkCheckpoint,
  isLoading = false,
  currentRound
}: PivotControlsProps) {
  const [pivotText, setPivotText] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState<'execute' | 'checkpoint' | null>(null);

  const handleExecuteRound = () => {
    onExecuteRound(pivotText.trim() || undefined);
    setPivotText('');
  };

  const handleMarkCheckpoint = () => {
    if (pivotText.trim()) {
      onMarkCheckpoint(pivotText.trim());
      setPivotText('');
    }
  };

  // Tooltip component
  const TooltipContent = ({ title, description, details }: { title: string; description: string; details: string[] }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 p-5 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 pointer-events-none border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <h4 className="font-black text-xs uppercase tracking-tight text-indigo-400 mb-2">{title}</h4>
      <p className="text-xs leading-relaxed text-slate-300 mb-3">{description}</p>
      <ul className="space-y-1 border-t border-slate-800 pt-3">
        {details.map((detail, idx) => (
          <li key={idx} className="text-[10px] text-slate-400 leading-relaxed">{detail}</li>
        ))}
      </ul>
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10" />
    </div>
  );

  return (
    <div className="relative group w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Gradient Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity" />
      
      {/* Main Container */}
      <div className="relative bg-white border-2 border-slate-100 p-10 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight">
              Input Feedback or New Path
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Refine or pivot your inquiry
            </p>
          </div>
        </div>

        {/* Pivot Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            Your Direction
          </label>
          <textarea
            value={pivotText}
            onChange={(e) => setPivotText(e.target.value)}
            placeholder="Refine the previous winner's response... OR Pivot to a completely new direction...  Examples: - 'Make it more concise' - 'Focus on performance implications' - 'Now let's explore security considerations'"
            disabled={isLoading}
            className="w-full h-40 p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 text-sm leading-relaxed resize-none outline-none transition-all focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            <strong>Execute Round:</strong> Continue current iteration with feedback. 
            <strong className="ml-3">Mark Checkpoint:</strong> Start a new iteration (fresh context).
          </p>
        </div>

        {/* Action Buttons with Help Tooltips */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {/* Mark Checkpoint Button with Tooltip */}
          <div className="relative">
            <button
              onClick={handleMarkCheckpoint}
              disabled={isLoading || !pivotText.trim()}
              className="flex items-center justify-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-2xl text-xs font-black shadow-lg hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              onMouseEnter={() => setHoveredTooltip('checkpoint')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Flag size={16} />
              <span>🎯 Mark Checkpoint</span>
              <HelpCircle size={12} className="opacity-50" />
            </button>
            {hoveredTooltip === 'checkpoint' && <TooltipContent {...MARK_CHECKPOINT_TOOLTIP} />}
          </div>

          {/* Execute Round Button with Tooltip */}
          <div className="relative">
            <button
              onClick={handleExecuteRound}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              onMouseEnter={() => setHoveredTooltip('execute')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Execute Round {currentRound + 1}</span>
                  <ArrowRight size={16} />
                  <HelpCircle size={12} className="opacity-50" />
                </>
              )}
            </button>
            {hoveredTooltip === 'execute' && <TooltipContent {...EXECUTE_ROUND_TOOLTIP} />}
          </div>
        </div>
      </div>
    </div>
  );
}
