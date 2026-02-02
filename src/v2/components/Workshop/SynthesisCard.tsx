import React from 'react';
import { Target } from 'lucide-react';
import { getTwoModelGradient } from '../../config/model-colors';

interface SynthesisCardProps {
  modelColors: string[];
  content: string;
  modelCount: number;
}

export function SynthesisCard({ modelColors, content, modelCount }: SynthesisCardProps) {
  const borderStyle: React.CSSProperties = {};

  if (modelColors.length === 2) {
    // Two-model gradient
    const gradient = getTwoModelGradient(modelColors[0], modelColors[1]);
    borderStyle.borderLeft = '8px solid transparent';
    borderStyle.borderImage = gradient;
    borderStyle.borderImageSlice = '1';
  } else {
    // Single color or multi-model - use solid border
    if (modelColors.length === 1) {
      borderStyle.borderLeft = `8px solid ${getTwoModelGradient(modelColors[0], 'blue').includes(modelColors[0]) ? '#3B82F6' : '#3B82F6'}`;
    } else {
      // Multi-model: use purple
      borderStyle.borderLeft = '8px solid #8B5CF6';
    }
  }

  return (
    <div
      style={borderStyle}
      className="bg-white rounded-3xl border-2 border-r-slate-200 border-t-slate-200 border-b-slate-200 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Target className="text-purple-600" size={20} />
        </div>
        <div>
          <h4 className="font-black text-sm text-slate-900 uppercase">Synthesis</h4>
          <p className="text-xs text-slate-500">
            {modelCount === 2 && 'Merged 2 models'}
            {modelCount === 3 && 'Synthesized from 3 sources'}
            {modelCount > 3 && `Combined ${modelCount} perspectives`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
