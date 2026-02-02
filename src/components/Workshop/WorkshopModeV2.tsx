/**
 * Workshop Mode V2 - Cleaned & Normalized
 * Fixes: Tooltip contrast, Model Card readability, Z-index conflicts
 */
import { useState, useEffect, useMemo } from 'react';
import { Cpu, Layers, ArrowRight, LayoutGrid, Table, Search, Volume2, Trophy } from 'lucide-react';
import { unifiedAPIService, type LLMProvider } from '../../services/unified-api.service';
import { createWorkshopSession, createWorkshopIteration, createConversationRound, createAIResponse, formatPrice, type AIResponse, type ModelDefinition, type WorkshopSession, type WorkshopIteration, type ConversationRound } from '../../types/WorkshopV2';
import { saveSessionWithCleanup, getMostRecentSession } from '../../services/workshop-v2.service';

const MODELS: ModelDefinition[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', flag: '🇺🇸', context_length: 200000, pricing: { prompt: '0.000003', completion: '0.000015' }, description: 'Balanced performance and speed' },
  { id: 'claude-opus-4-20251101', name: 'Claude Opus 4', provider: 'anthropic', flag: '🇺🇸', context_length: 200000, pricing: { prompt: '0.000015', completion: '0.000075' }, description: 'Best capability' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', flag: '🇺🇸', context_length: 128000, pricing: { prompt: '0.0000025', completion: '0.000010' }, description: 'Omni model' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', flag: '🇺🇸', context_length: 2000000, pricing: { prompt: '0.0000005', completion: '0.0000015' }, description: 'Google flagship' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'deepseek', flag: '🇨🇳', context_length: 128000, pricing: { prompt: '0.00000055', completion: '0.00000219' }, description: 'Reasoning model' },
];

function ModelTooltip({ model }: { model: ModelDefinition }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 rounded-2xl shadow-2xl z-[100] pointer-events-none border border-white/10 bg-slate-900 text-white">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-black text-xs uppercase tracking-tight text-indigo-300 truncate pr-2">{model.name}</h4>
        <span className="text-xs text-white">{model.flag}</span>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-200 mb-3 font-medium line-clamp-4">{model.description || "Specialized AI model for prompt workshopping."}</p>
      <div className="grid grid-cols-2 gap-3 border-t border-zinc-600 pt-3">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Speed</span>
          <span className="text-[10px] font-bold text-white">{model.id.includes('flash') || model.id.includes('mini') ? '⚡ Turbo' : '🧠 Reasoner'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Context</span>
          <span className="text-[10px] font-bold text-white">{(model.context_length / 1000).toFixed(0)}k</span>
        </div>
        <div className="flex flex-col col-span-2 bg-zinc-700/50 p-2 rounded-lg text-xs font-bold text-emerald-300 text-center">
          {formatPrice(model.pricing.prompt)} / 1M tokens
        </div>
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 -translate-y-1.5 bg-slate-900" />
    </div>
  );
}

function ResponseCard({ response, isWinner, isLocked, onSelectWinner, onLock, onSpeak }: { 
  response: AIResponse; 
  isWinner?: boolean; 
  isLocked?: boolean; 
  onSelectWinner: () => void; 
  onLock: () => void;
  onSpeak: (text: string) => void;
}) {
  return (
    <div className={`flex flex-col h-full rounded-3xl border transition-all duration-500 overflow-hidden ${isWinner ? 'border-indigo-500 bg-indigo-50/20 shadow-xl scale-[1.01]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <div className={`px-5 py-3 border-b flex justify-between items-center ${isWinner ? 'bg-indigo-100/50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isWinner ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider truncate max-w-[120px]">{response.model}</span>
        </div>
        <div className="flex gap-3 font-mono text-[10px] text-slate-400">
          <button onClick={() => onSpeak(response.text)} className="text-indigo-600 hover:scale-110 transition-transform">
            <Volume2 size={14} />
          </button>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-100">{response.metrics.time.toFixed(1)}s</span>
        </div>
      </div>
      <div className="p-6 flex-grow overflow-y-auto text-[14px] text-slate-700 leading-relaxed font-sans max-h-[400px]">
        {response.status === 'loading' ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
          </div>
        ) : response.status === 'error' ? (
          <div className="text-red-500 text-xs italic bg-red-50 p-4 rounded-xl border border-red-100">{response.error}</div>
        ) : (
          <div className="whitespace-pre-wrap">{response.text}</div>
        )}
      </div>
      <div className="p-4 bg-white border-t space-y-2">
        <button 
          onClick={onSelectWinner} 
          disabled={response.status !== 'success'} 
          className={`w-full py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${isWinner ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
        >
          {isWinner ? (
            <>
              <Trophy size={14} /> Selected
            </>
          ) : (
            "Pick Winner"
          )}
        </button>
        {isWinner && (
          <button 
            onClick={onLock} 
            className={`w-full py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isLocked ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'}`}
          >
            {isLocked ? "Deep-Dive Locked" : "Lock Deep-Dive?"}
          </button>
        )}
      </div>
    </div>
  );
}

export function WorkshopModeV2({ 
  systemPrompt, 
  userPrompt, 
  onSystemPromptChange,
  onUserPromptChange
}: { 
  systemPrompt: string; 
  userPrompt: string; 
  onSystemPromptChange: (v: string) => void; 
  onUserPromptChange: (v: string) => void; 
  onExit?: () => void;
}) {
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [winnerId, setWinnerId] = useState<string>();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const filteredModels = useMemo(() => {
    const search = modelSearch.toLowerCase();
    return MODELS.filter(m => 
      m.name.toLowerCase().includes(search) || 
      m.id.toLowerCase().includes(search)
    );
  }, [modelSearch]);

  const toggleModel = (id: string) => {
    setSelectedModels(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id].slice(0, 3) // Max 3 models
    );
  };

  const getModel = (id: string) => MODELS.find(m => m.id === id);

  useEffect(() => {
    getMostRecentSession().then(s => {
      if (s) {
        setSession(s);
        setSelectedModels(s.selectedModelIds);
      }
    });
  }, []);

  const handleExecute = async () => {
    if (selectedModels.length < 1 || !userPrompt.trim()) {
      setError('Select models and enter prompt');
      return;
    }

    setError('');
    setLoading(true);

    let sess = session;
    if (!sess) {
      sess = createWorkshopSession(systemPrompt, userPrompt, selectedModels);
      setSession(sess);
    }

    const responses: AIResponse[] = [];
    
    for (const id of selectedModels) {
      const m = getModel(id);
      if (!m) continue;

      let provider: LLMProvider = 'anthropic';
      if (id.includes('google/') || id.includes('gemini')) provider = 'google';
      else if (id.startsWith('gpt') || id === 'o1') provider = 'openai';
      else if (id.includes('openrouter') || id.includes('deepseek') || id.includes('qwen')) provider = 'openrouter';

      const key = unifiedAPIService.getApiKey(provider);
      const resp = { ...createAIResponse(m.name, id, 'loading') };
      responses.push(resp);

      if (!key) {
        resp.error = `Missing ${provider} key`;
        resp.status = 'error';
        continue;
      }

      try {
        const r = await unifiedAPIService.sendPrompt(systemPrompt, userPrompt, id, key, provider);
        resp.text = r.text;
        resp.metrics = { 
          time: r.responseTimeMs / 1000, 
          cost: r.cost, 
          tokens: r.inputTokens + r.outputTokens 
        };
        resp.status = 'success';
      } catch (e) {
        resp.error = e instanceof Error ? e.message : 'Error';
        resp.status = 'error';
      }
    }

    const round = createConversationRound((sess?.iterations.length || 0) + 1, 'initial', responses);
    const iter = createWorkshopIteration((sess?.iterations.length || 0) + 1, round);
    sess!.iterations.push(iter);
    
    await saveSessionWithCleanup(sess!);
    setSession({ ...sess! });
    setLoading(false);
  };

  const handleLock = (id: string) => {
    const resp = session?.iterations
      .flatMap((i: WorkshopIteration) => i.rounds.flatMap((r: ConversationRound) => r.responses))
      .find(r => r.id === id);
    
    if (!session || !resp) return;
    
    const upd = {
      ...session,
      lockedModelId: resp.modelId,
      iterations: session.iterations.map((i: WorkshopIteration) => ({
        ...i,
        lockedModelId: i.lockedModelId || resp.modelId
      }))
    };
    
    setSession(upd);
    saveSessionWithCleanup(upd);
  };

  const handleSpeak = (text: string) => {
    if (text && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-[80%] max-w-[1400px] mx-auto px-8 py-12 space-y-32 pb-40">
        
        {/* Drafting Section */}
        <section className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">System Persona</label>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">Role Definition</span>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                placeholder="e.g. You are a specialized legal analyst..."
                className="w-full h-64 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm focus:border-indigo-300 outline-none text-sm font-mono leading-relaxed transition-all"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">User Task</label>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">The Problem</span>
              </div>
              <textarea
                value={userPrompt}
                onChange={(e) => onUserPromptChange(e.target.value)}
                placeholder="What are we workshopping today?..."
                className="w-full h-64 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm focus:border-emerald-300 outline-none text-sm font-mono leading-relaxed transition-all"
              />
            </div>
          </div>
        </section>

        {/* Engine Catalog */}
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase text-md tracking-tight">Engine Catalog</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select engines to parallel-test</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-3 text-xs w-72 focus:bg-white focus:border-indigo-100 outline-none transition-all"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-2xl border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
                >
                  <Table size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 bg-slate-800 p-6 rounded-[2rem] border border-slate-700">
            <div className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {filteredModels.length} Models Found
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredModels.map(model => (
                <div key={model.id} className="relative group/btn">
                  <button
                    onMouseEnter={() => setHoveredModel(model.id)}
                    onMouseLeave={() => setHoveredModel(null)}
                    onClick={() => toggleModel(model.id)}
                    className={`w-full p-6 rounded-[2rem] border-2 text-center transition-all flex flex-col items-center gap-2 ${
                      selectedModels.includes(model.id)
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl scale-[1.03]'
                        : 'border-slate-700 bg-slate-800 text-white hover:border-indigo-500 hover:bg-slate-700 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase truncate w-full flex justify-center items-center gap-1">
                      <span>{model.name}</span>
                      <span>{model.flag}</span>
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${selectedModels.includes(model.id) ? 'text-indigo-100' : ''}`}>
                      {model.provider}
                    </span>
                  </button>
                  {hoveredModel === model.id && <ModelTooltip model={model} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[10px] font-black uppercase text-slate-400">
                    <th className="px-8 py-5">Model Intelligence</th>
                    <th className="px-8 py-5">Region</th>
                    <th className="px-8 py-5 text-right">Cost/1M</th>
                    <th className="px-8 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredModels.map(model => (
                    <tr key={model.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td
                        onMouseEnter={() => setHoveredModel(model.id)}
                        onMouseLeave={() => setHoveredModel(null)}
                        className="px-8 py-5 relative cursor-help"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {model.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                            {model.id}
                          </span>
                        </div>
                        {hoveredModel === model.id && <ModelTooltip model={model} />}
                      </td>
                      <td className="px-8 py-5 text-lg">{model.flag}</td>
                      <td className="px-8 py-5 text-right text-[11px] font-black text-emerald-600">
                        {formatPrice(model.pricing.prompt)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => toggleModel(model.id)}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                            selectedModels.includes(model.id)
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'
                          }`}
                        >
                          {selectedModels.includes(model.id) ? 'Active' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Iterations */}
        {session?.iterations.map((iter: WorkshopIteration, iIdx: number) => (
          <div key={iIdx} className="space-y-16 relative p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-6 sticky top-0 bg-white/90 backdrop-blur-md py-6 z-20">
              <div className="bg-purple-600 text-white px-6 py-2.5 rounded-full text-xs font-black shadow-xl shadow-purple-200 flex items-center gap-3">
                <Layers size={14} /> ITERATION {iter.number}
              </div>
              <div className="h-px flex-grow bg-purple-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Checkpoint Entry</span>
            </div>

            {iter.rounds.map((round: ConversationRound, rIdx: number) => (
              <div key={rIdx} className="space-y-10 relative">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xl border-4 border-white">
                    {round.number}
                  </div>
                  <h2 className="text-md font-black text-slate-700 tracking-tight uppercase">{round.type} Round</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {round.responses.map((r: AIResponse) => (
                    <ResponseCard
                      key={r.id}
                      response={r}
                      isWinner={winnerId === r.id}
                      isLocked={iter.lockedModelId === r.modelId}
                      onSelectWinner={() => setWinnerId(r.id)}
                      onLock={() => handleLock(r.id)}
                      onSpeak={handleSpeak}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Execute Button */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-10" />
          <div className="relative bg-white border-2 p-10 rounded-[2.5rem] shadow-2xl space-y-6">
            {error && <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl">{error}</div>}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span> Running...
                  </>
                ) : (
                  <>
                    <span>EXECUTE</span>
                    {session && <span> ROUND {session.iterations.length + 1}</span>}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}