import { useState } from 'react';
import { Target, X, Copy, CheckCircle, Sparkles, Loader, Cpu, Star } from 'lucide-react';
import { WorkshopSession, SynthesisResult } from '../../types';
import { aarTemplates } from '../../config/aar-templates';
import { synthesisService } from '../../services/synthesis.service';
import { ModelCuration } from '../../config/model-curation';

interface SynthesisPanelProps {
  session: WorkshopSession;
  onClose: () => void;
}

export function SynthesisPanel({ session, onClose }: SynthesisPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(aarTemplates[0].id);
  const [selectedModel, setSelectedModel] = useState(ModelCuration.synthesisModels[0]);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleSynthesize = async () => {
    setLoading(true);
    setError(null);

    try {
      const synthesisResult = await synthesisService.synthesize(session, selectedTemplate, selectedModel.id);
      setResult(synthesisResult);
    } catch (err: any) {
      setError(err.message || 'Failed to generate synthesis');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (result?.finalPrompt) {
      await navigator.clipboard.writeText(result.finalPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const currentTemplate = aarTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-6xl bg-white border-4 border-slate-900 rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-12 py-10 bg-slate-900 flex justify-between items-center text-white">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg">
              <Target size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Mission Synthesis</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                After Action Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-12 lg:p-16 space-y-12">
          {/* Model Selection */}
          {!result && (
            <div className="space-y-6">
              {/* Model Selector */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={16} className="text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Select Synthesis Model
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ModelCuration.synthesisModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedModel.id === model.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-xs text-slate-900 uppercase">{model.name}</span>
                        {ModelCuration.recommended.includes(model.id) && (
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">{model.provider}</p>
                      <div className="flex flex-wrap gap-1">
                        {model.strengths.map((strength) => (
                          <span
                            key={strength}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Model Info */}
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Cpu size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                    {selectedModel.name}
                  </p>
                  <p className="text-xs text-indigo-700">
                    Using {selectedModel.provider} for synthesis • {selectedModel.strengths.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-purple-600" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Select Synthesis Template
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aarTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-6 rounded-3xl border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <h5 className="font-black text-sm text-slate-900 mb-2">{template.name}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Template Info */}
              {currentTemplate && (
                <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                  <h5 className="text-xs font-black text-purple-900 uppercase tracking-widest mb-3">
                    Selected: {currentTemplate.name}
                  </h5>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {currentTemplate.description}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                  <p className="text-sm font-bold text-red-900">Synthesis Failed</p>
                  <p className="text-xs text-red-700 mt-2">{error}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Make sure you have API keys configured in the API Keys menu.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSynthesize}
                  disabled={loading}
                  className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Generating Synthesis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Generate Synthesis with {selectedModel.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Insights */}
              <div className="space-y-8">
                <div className="border-b-2 border-slate-100 pb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Institutional Insights
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Generated by {selectedModel.name}
                  </p>
                </div>
                <div className="space-y-6">
                  {result.insights.map((insight, index) => (
                    <div key={index} className="space-y-2">
                      <h5 className="font-black text-sm text-slate-900">{insight.title}</h5>
                      <p className="text-sm text-slate-600 leading-relaxed">{insight.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Final Prompt */}
              <div className="space-y-8">
                <div className="border-b-2 border-indigo-100 pb-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                      Final Production Prompt
                    </h4>
                    <p className="text-[10px] text-indigo-400 mt-0.5">
                      Ready for production use
                    </p>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCircle size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono">
                    {result.finalPrompt}
                  </pre>
                </div>

                {/* Regenerate Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setResult(null);
                      setError(null);
                    }}
                    className="py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-colors uppercase tracking-wider"
                  >
                    Change Template
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setError(null);
                    }}
                    className="py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-colors uppercase tracking-wider"
                  >
                    Change Model
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
