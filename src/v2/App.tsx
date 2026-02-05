import { useState, useEffect } from 'react';
import { Key, RotateCcw, Download, Folder } from 'lucide-react';
import { WorkshopSession, Settings, ClackyProjectContext, AIResponse, ConversationRound, WorkshopIteration, AIResponseFeedback, ModelDefinition } from './types';
import { Editor } from './components/PromptEditor/Editor';
import { Timeline } from './components/Workshop/Timeline';
import { SynthesisPanel } from './components/Workshop/SynthesisPanel';
import { SettingsModal } from './components/Settings/SettingsModal';
import { WinnerActionModal } from './components/Workshop/WinnerActionModal';
import { ModelReplacementModal } from './components/Workshop/ModelReplacementModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { WelcomeScreen, AboutModal } from './components/Auth/WelcomeScreen';
import { checkAuth, getThread, createThread, type AuthStatus } from './services/workspace-api';
import { storageService } from './services/storage.service';
import { apiService } from './services/api.service';
import { feedbackService } from './services/feedback.service';
import { exportSessionAsMarkdown, downloadAsFile } from './services/export.service';
import { generateId, getFlagByProvider } from './utils/format';
import { assignModelColor } from './config/model-colors';

export default function App() {
  // === Authentication State ===
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const isAuthDisabled = authStatus?.disabled === true;
  const isAuthenticated = authStatus?.authenticated === true;

  // === About Modal ===
  const [showAbout, setShowAbout] = useState(false);

  // === Settings & Configuration ===
  const [settings, setSettings] = useState<Settings>({
    keys: { anthropic: '', openrouter: '', openai: '', google: '' },
    theme: 'light'
  });
  const [showSettings, setShowSettings] = useState(false);

  // === Workspace State (Coming Soon) ===
  // const [workspacePanelOpen, setWorkspacePanelOpen] = useState(false);
  // const [activeProject, setActiveProject] = useState<string | null>(null);

  // === Session State ===
  const [session, setSession] = useState<WorkshopSession | null>(null);
  const [promptData, setPromptData] = useState({ system: '', user: '' });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [clackyContext, setClackyContext] = useState<ClackyProjectContext | undefined>();
  
  // UI State
  const [winnerId, setWinnerId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerContext, setWinnerContext] = useState<{
    winnerId: string;
    winnerModelId: string;
    loserModelId: string;
  } | null>(null);
  
  // Per-model loading progress
  const [loadingProgress, setLoadingProgress] = useState<Record<string, 'pending' | 'loading' | 'complete' | 'error'>>({});

  // Model replacement modal state
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementContext, setReplacementContext] = useState<{
    responseId: string;
    modelId: string;
    roundIndex: number;
  } | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelDefinition[]>([]);

  // === Authentication Check ===
  useEffect(() => {
    checkAuth().then((status) => {
      // If API call fails (no server), treat as auth disabled
      if (!status || (!status.authenticated && !status.disabled)) {
        // Server not available - disable auth and load directly
        setAuthStatus({ authenticated: true, disabled: true });
      } else {
        setAuthStatus(status);
      }
    });
  }, []);

  // === Load settings and session on mount ===
  useEffect(() => {
    if (!isAuthenticated) return;

    const savedSettings = storageService.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }

    const savedSession = storageService.loadSession();
    if (savedSession) {
      setSession(savedSession);
      setPromptData(savedSession.promptData);
      setSelectedModels(savedSession.selectedModels);
      setClackyContext(savedSession.clackyContext);
    }
  }, [isAuthenticated]);

  // Save session whenever it changes
  useEffect(() => {
    if (session) {
      storageService.saveSession(session);
    }
  }, [session]);

  // === Handlers ===

  const handleLogin = () => {
    setAuthStatus({ authenticated: true });
  };

  const handleEnter = () => {
    // Enter Prompt Lab - load settings and check for existing session
    const savedSettings = storageService.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }

    const savedSession = storageService.loadSession();
    if (savedSession) {
      setSession(savedSession);
      setPromptData(savedSession.promptData);
      setSelectedModels(savedSession.selectedModels);
      setClackyContext(savedSession.clackyContext);
    }

    setAuthStatus({ authenticated: true });
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // === Workspace Handlers (Coming Soon) ===
  // const handleSelectFile = (project: string, filePath: string, content: string) => {
  //   setActiveProject(project);
  //   setPromptData(prev => ({
  //     ...prev,
  //     system: prev.system + `\n\n// From ${project}/${filePath}\n${content}`
  //   }));
  // };

  // const handleSelectThread = async (threadId: string) => {
  //   if (!activeProject) return;
  //   const thread = await getThread(activeProject, threadId);
  //   if (thread) {
  //     setPromptData({ system: thread.systemPersona, user: thread.userTask });
  //     setSelectedModels(thread.modelIds || []);
  //   }
  // };

  // const handleNewThread = async () => {
  //   if (!activeProject) return;
  //   await createThread(activeProject, {
  //     title: 'New Session',
  //     systemPersona: promptData.system,
  //     userTask: promptData.user,
  //     modelIds: selectedModels
  //   });
  // };

  // Start a new workshop session
  const handleStartWorkshop = async () => {
    if (selectedModels.length < 2 || !promptData.user.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Initialize progress for all models
    const initialProgress: Record<string, 'pending' | 'loading' | 'complete' | 'error'> = {};
    selectedModels.forEach(m => initialProgress[m] = 'pending');
    setLoadingProgress(initialProgress);

    try {
      // Create initial responses
      const responses: AIResponse[] = [];

      // Call all selected models in parallel
      const promises = selectedModels.map(async (modelId) => {
        const startTime = Date.now();

        // Mark as loading
        setLoadingProgress(prev => ({ ...prev, [modelId]: 'loading' }));

        try {
          // Determine provider from model ID (format: provider/model-name)
          let provider: 'anthropic' | 'openai' | 'google' | 'openrouter' = 'openrouter';
          const providerPrefix = modelId.split('/')[0];
          if (providerPrefix === 'anthropic') provider = 'anthropic';
          else if (providerPrefix === 'openai') provider = 'openai';
          else if (providerPrefix === 'google') provider = 'google';
          // All other providers (deepseek, meta-llama, mistralai, etc.) use OpenRouter

          // Build system message with optional Clacky context
          let systemMessage = promptData.system;
          if (clackyContext) {
            systemMessage += `\n\nProject Context:\nYou are working on: ${clackyContext.projectName}\nFramework: ${clackyContext.context.framework}\nLanguage: ${clackyContext.context.language}\n\nFile Structure:\n${clackyContext.fileTree}`;
          }

          const result = await apiService.sendPrompt({
            provider,
            model: modelId,
            messages: {
              system: systemMessage,
              user: promptData.user
            }
          });

          const response: AIResponse = {
            id: generateId(),
            model: modelId.split('/').pop() || modelId,
            modelId: modelId,
            text: result.text,
            metrics: result.metrics,
            status: 'success'
          };

          // Mark as complete
          setLoadingProgress(prev => ({ ...prev, [modelId]: 'complete' }));

          return response;
        } catch (error: any) {
          // Mark as error
          setLoadingProgress(prev => ({ ...prev, [modelId]: 'error' }));
          
          const response: AIResponse = {
            id: generateId(),
            model: modelId.split('/').pop() || modelId,
            modelId: modelId,
            text: '',
            metrics: { time: (Date.now() - startTime) / 1000, cost: 0, tokens: 0 },
            status: 'error',
            error: error.message || 'API call failed'
          };
          return response;
        }
      });

      const results = await Promise.all(promises);
      responses.push(...results);

      // Assign colors to models
      const modelColors: Record<string, string> = {};
      selectedModels.forEach((modelId) => {
        modelColors[modelId] = assignModelColor(modelId, modelColors);
      });

      // Add color to each response
      responses.forEach(response => {
        response.color = modelColors[response.modelId];
      });

      // Create initial round
      const initialRound: ConversationRound = {
        number: 1,
        timestamp: Date.now(),
        type: 'initial',
        responses
      };

      // Create initial iteration
      const initialIteration: WorkshopIteration = {
        number: 1,
        status: 'active',
        rounds: [initialRound],
        lockedModelId: null,
        lockInRound: null
      };

      // Create new session
      const newSession: WorkshopSession = {
        id: generateId(),
        createdAt: Date.now(),
        promptData,
        clackyContext,
        iterations: [initialIteration],
        currentIterationIndex: 0,
        selectedModels,
        modelColors
      };

      setSession(newSession);
      setWinnerId(undefined);
      setLoadingProgress({});
    } catch (error) {
      console.error('Failed to start workshop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute a new round (continue current iteration)
  const handleExecuteRound = async (pivot?: string) => {
    if (!session) return;

    setIsLoading(true);
    
    // Determine which models to call and initialize progress
    const currentIter = session.iterations[session.currentIterationIndex];
    const lockedId = currentIter?.lockedModelId;
    const modelsToCall: string[] = lockedId ? [lockedId] : selectedModels;
    
    const initialProgress: Record<string, 'pending' | 'loading' | 'complete' | 'error'> = {};
    modelsToCall.forEach(m => initialProgress[m] = 'pending');
    setLoadingProgress(initialProgress);

    try {
      const currentIteration = session.iterations[session.currentIterationIndex];
      const lastRound = currentIteration.rounds[currentIteration.rounds.length - 1];

      // Build enhanced discussion prompt with full context
      let discussionPrompt = promptData.user;

      // Add winner context if available
      if (winnerId && lastRound.responses.length > 0) {
        const winnerResponse = lastRound.responses.find(r => r.id === winnerId);
        const otherResponse = lastRound.responses.find(r => r.id !== winnerId);

        if (winnerResponse && otherResponse) {
          discussionPrompt += `\n\n--- Round ${lastRound.number} Results ---\n`;
          discussionPrompt += `Winner: [${winnerResponse.model}]\n${winnerResponse.text}\n\n`;
          discussionPrompt += `Other Model: [${otherResponse.model}]\n${otherResponse.text}\n\n`;
          discussionPrompt += `[${winnerResponse.model}] was selected as the winner for Round ${lastRound.number}.\n`;

          // Add feedback scores if available
          if (winnerResponse.feedback) {
            discussionPrompt += `\nWinner Feedback:\n`;
            discussionPrompt += `- Technical Relevance: ${winnerResponse.feedback.relevance === 1 ? '👍 Positive' : winnerResponse.feedback.relevance === -1 ? '👎 Negative' : 'Neutral'}\n`;
            discussionPrompt += `- Tone & Delivery: ${winnerResponse.feedback.tone === 1 ? '👍 Positive' : winnerResponse.feedback.tone === -1 ? '👎 Negative' : 'Neutral'}\n`;
          }
          if (otherResponse.feedback) {
            discussionPrompt += `\nOther Model Feedback:\n`;
            discussionPrompt += `- Technical Relevance: ${otherResponse.feedback.relevance === 1 ? '👍 Positive' : otherResponse.feedback.relevance === -1 ? '👎 Negative' : 'Neutral'}\n`;
            discussionPrompt += `- Tone & Delivery: ${otherResponse.feedback.tone === 1 ? '👍 Positive' : otherResponse.feedback.tone === -1 ? '👎 Negative' : 'Neutral'}\n`;
          }
        }
      }

      // Add human pivot feedback
      if (pivot) {
        discussionPrompt += `\n\nHuman Direction: "${pivot}"\n`;
      }

      discussionPrompt += `\n\nPlease respond to the above discussion, building on the winning approach while offering your own perspective.`;

      // Call models
      const responses: AIResponse[] = [];
      const promises = modelsToCall.map(async (modelId) => {
        const startTime = Date.now();

        // Mark as loading
        setLoadingProgress(prev => ({ ...prev, [modelId]: 'loading' }));

        try {
          // Determine provider from model ID (format: provider/model-name)
          let provider: 'anthropic' | 'openai' | 'google' | 'openrouter' = 'openrouter';
          const providerPrefix = modelId.split('/')[0];
          if (providerPrefix === 'anthropic') provider = 'anthropic';
          else if (providerPrefix === 'openai') provider = 'openai';
          else if (providerPrefix === 'google') provider = 'google';
          // All other providers (deepseek, meta-llama, mistralai, etc.) use OpenRouter

          let systemMessage = promptData.system;
          if (clackyContext) {
            systemMessage += `\n\nProject Context:\nYou are working on: ${clackyContext.projectName}\nFramework: ${clackyContext.context.framework}\nLanguage: ${clackyContext.context.language}`;
          }

          const result = await apiService.sendPrompt({
            provider,
            model: modelId,
            messages: {
              system: systemMessage,
              user: discussionPrompt
            }
          });

          const response: AIResponse = {
            id: generateId(),
            model: modelId.split('/').pop() || modelId,
            modelId: modelId,
            text: result.text,
            metrics: result.metrics,
            status: 'success'
          };

          // Mark as complete
          setLoadingProgress(prev => ({ ...prev, [modelId]: 'complete' }));

          return response;
        } catch (error: any) {
          // Mark as error
          setLoadingProgress(prev => ({ ...prev, [modelId]: 'error' }));
          
          const response: AIResponse = {
            id: generateId(),
            model: modelId.split('/').pop() || modelId,
            modelId: modelId,
            text: '',
            metrics: { time: (Date.now() - startTime) / 1000, cost: 0, tokens: 0 },
            status: 'error',
            error: error.message || 'API call failed'
          };
          return response;
        }
      });

      const results = await Promise.all(promises);
      responses.push(...results);

      // Preserve colors from session.modelColors for new responses
      if (session.modelColors) {
        responses.forEach(response => {
          response.color = session.modelColors![response.modelId];
        });
      }

      // Create new round
      const newRound: ConversationRound = {
        number: lastRound.number + 1,
        timestamp: Date.now(),
        type: 'discussion',
        pivot,
        responses
      };

      // Update iteration with new round
      const updatedIteration = {
        ...currentIteration,
        rounds: [...currentIteration.rounds, newRound]
      };

      const updatedIterations = [...session.iterations];
      updatedIterations[session.currentIterationIndex] = updatedIteration;

      setSession({
        ...session,
        iterations: updatedIterations
      });

      setWinnerId(undefined);
      setLoadingProgress({});
    } catch (error) {
      console.error('Failed to execute round:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark checkpoint (create new iteration)
  const handleMarkCheckpoint = async (pivot: string) => {
    if (!session) return;

    // Mark current iteration as completed
    const completedIteration = {
      ...session.iterations[session.currentIterationIndex],
      status: 'completed' as const
    };

    // Create new iteration
    const newIteration: WorkshopIteration = {
      number: session.iterations.length + 1,
      status: 'active',
      rounds: [],
      lockedModelId: null,
      lockInRound: null
    };

    const updatedIterations = [...session.iterations];
    updatedIterations[session.currentIterationIndex] = completedIteration;
    updatedIterations.push(newIteration);

    setSession({
      ...session,
      iterations: updatedIterations,
      currentIterationIndex: updatedIterations.length - 1
    });

    // Execute first round of new iteration with pivot
    setTimeout(() => handleExecuteRound(pivot), 100);
  };

  // Lock to a specific model
  const handleLockIn = (modelId: string) => {
    if (!session) return;

    const currentIteration = session.iterations[session.currentIterationIndex];
    const currentRound = currentIteration.rounds.length;

    const updatedIteration = {
      ...currentIteration,
      lockedModelId: modelId,
      lockInRound: currentRound
    };

    const updatedIterations = [...session.iterations];
    updatedIterations[session.currentIterationIndex] = updatedIteration;

    setSession({
      ...session,
      iterations: updatedIterations
    });
  };

  // Handle selecting a winner - opens modal
  const handleSelectWinner = (responseId: string) => {
    setWinnerId(responseId);

    if (session) {
      const currentIteration = session.iterations[session.currentIterationIndex];
      const lastRound = currentIteration.rounds[currentIteration.rounds.length - 1];

      // Mark winner in responses
      const updatedResponses = lastRound.responses.map(r => ({
        ...r,
        isWinner: r.id === responseId
      }));

      const updatedRound = { ...lastRound, responses: updatedResponses };
      const updatedRounds = [...currentIteration.rounds];
      updatedRounds[updatedRounds.length - 1] = updatedRound;

      const updatedIteration = { ...currentIteration, rounds: updatedRounds };
      const updatedIterations = [...session.iterations];
      updatedIterations[session.currentIterationIndex] = updatedIteration;

      setSession({ ...session, iterations: updatedIterations });

      const winnerResponse = lastRound.responses.find(r => r.id === responseId);
      const loserResponse = lastRound.responses.find(r => r.id !== responseId);

      if (winnerResponse && loserResponse) {
        setWinnerContext({
          winnerId: responseId,
          winnerModelId: winnerResponse.modelId,
          loserModelId: loserResponse.modelId
        });
        setShowWinnerModal(true);
      }
    }
  };

  // Handle winner action selection
  const handleWinnerAction = async (action: 'keep-both' | 'lock-winner' | 'replace-loser') => {
    if (!session || !winnerContext) return;

    const currentIteration = session.iterations[session.currentIterationIndex];

    switch (action) {
      case 'keep-both':
        // Do nothing - both models continue in discussion round
        break;

      case 'lock-winner':
        // Lock to winner model
        const updatedIteration = {
          ...currentIteration,
          lockedModelId: winnerContext.winnerModelId,
          lockInRound: currentIteration.rounds.length
        };

        const updatedIterations = [...session.iterations];
        updatedIterations[session.currentIterationIndex] = updatedIteration;

        setSession({
          ...session,
          iterations: updatedIterations
        });
        break;

      case 'replace-loser':
        // TODO: Open model selector modal to choose replacement
        // For now, just log that this was triggered
        console.log('Replace loser model:', winnerContext.loserModelId);
        alert('Model replacement coming in next update. For now, you can manually select a different model in the catalog.');
        break;
    }
  };

  // Clear session and start over
  const handleNewSession = () => {
    if (window.confirm('Start a new session? This will clear your current workshop history.')) {
      storageService.clearSession();
      setSession(null);
      setWinnerId(undefined);
      setShowSynthesis(false);
      setShowWinnerModal(false);
      setWinnerContext(null);
      setLoadingProgress({});
      // Keep prompt data and selected models for convenience
    }
  };

  // Handle feedback on a response
  const handleFeedback = async (responseId: string, feedback: AIResponseFeedback) => {
    if (!session) return;

    // Find the response
    const currentIteration = session.iterations[session.currentIterationIndex];
    let foundResponse: AIResponse | null = null;
    let roundNumber = 0;

    for (const round of currentIteration.rounds) {
      const found = round.responses.find(r => r.id === responseId);
      if (found) {
        foundResponse = found;
        roundNumber = round.number;
        break;
      }
    }

    if (!foundResponse) return;

    // Update the response with feedback
    const updatedIterations = session.iterations.map((iteration) => ({
      ...iteration,
      rounds: iteration.rounds.map((round) => ({
        ...round,
        responses: round.responses.map(r => {
          if (r.id === responseId) {
            return { ...r, feedback };
          }
          return r;
        })
      }))
    }));

    setSession({
      ...session,
      iterations: updatedIterations
    });

    // Store feedback in the database
    try {
      await feedbackService.recordResponseFeedback(
        session.id,
        currentIteration.number,
        roundNumber,
        responseId,
        foundResponse.modelId,
        foundResponse.model,
        promptData.system,
        promptData.user,
        {
          time: foundResponse.metrics.time,
          cost: foundResponse.metrics.cost,
          tps: foundResponse.metrics.tokens / foundResponse.metrics.time,
          inputTokens: foundResponse.metrics.inputTokens || 0,
          outputTokens: foundResponse.metrics.outputTokens || 0
        },
        feedback
      );
    } catch (error) {
      console.error('Failed to store feedback:', error);
    }
  };

  // Handle replace model request
  const handleReplaceModel = async (responseId: string) => {
    if (!session) return;

    const currentIteration = session.iterations[session.currentIterationIndex];

    // Find the failed response
    let failedResponse: AIResponse | undefined;
    let roundIndex = -1;

    for (let i = 0; i < currentIteration.rounds.length; i++) {
      const found = currentIteration.rounds[i].responses.find(r => r.id === responseId);
      if (found) {
        failedResponse = found;
        roundIndex = i;
        break;
      }
    }

    if (!failedResponse) return;

    setReplacementContext({
      responseId,
      modelId: failedResponse.modelId,
      roundIndex
    });

    // Fetch available models
    try {
      const models = await apiService.fetchOpenRouterModels();
      const transformed: ModelDefinition[] = models.map((m: any) => ({
        id: m.id,
        name: m.name || m.id.split('/').pop() || m.id,
        provider: m.id.split('/')[0] || 'unknown',
        flag: getFlagByProvider(m.id),
        description: m.description,
        context_length: m.context_length || 0,
        pricing: {
          prompt: m.pricing?.prompt || '0',
          completion: m.pricing?.completion || '0'
        }
      }));
      setAvailableModels(transformed);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }

    setShowReplacementModal(true);
  };

  // Handle selecting a replacement model
  const handleSelectReplacementModel = async (newModelId: string) => {
    if (!session || !replacementContext) return;

    setIsLoading(true);

    try {
      const currentIteration = session.iterations[session.currentIterationIndex];
      const round = currentIteration.rounds[replacementContext.roundIndex];

      // Determine provider
      let provider: 'anthropic' | 'openai' | 'google' | 'openrouter' = 'openrouter';
      if (newModelId.startsWith('claude')) provider = 'anthropic';
      else if (newModelId.startsWith('gpt')) provider = 'openai';
      else if (newModelId.startsWith('gemini')) provider = 'google';

      // Build context
      let systemMessage = promptData.system;
      if (clackyContext) {
        systemMessage += `\n\nProject Context:\nYou are working on: ${clackyContext.projectName}\nFramework: ${clackyContext.context.framework}\nLanguage: ${clackyContext.context.language}`;
      }

      // Call new model
      const result = await apiService.sendPrompt({
        provider,
        model: newModelId,
        messages: {
          system: systemMessage,
          user: round.type === 'initial' ? promptData.user : (round.pivot || promptData.user)
        }
      });

      // Assign new color
      const newColor = assignModelColor(newModelId, session.modelColors);
      const updatedModelColors = { ...session.modelColors, [newModelId]: newColor };

      // Create new response
      const newResponse: AIResponse = {
        id: generateId(),
        model: newModelId.split('/').pop() || newModelId,
        modelId: newModelId,
        text: result.text,
        metrics: result.metrics,
        status: 'success',
        color: newColor
      };

      // Replace old response
      const updatedResponses = round.responses.map(r =>
        r.id === replacementContext.responseId ? newResponse : r
      );

      const updatedRound = { ...round, responses: updatedResponses };
      const updatedRounds = [...currentIteration.rounds];
      updatedRounds[replacementContext.roundIndex] = updatedRound;

      const updatedIteration = { ...currentIteration, rounds: updatedRounds };
      const updatedIterations = [...session.iterations];
      updatedIterations[session.currentIterationIndex] = updatedIteration;

      // Update selected models
      const updatedSelectedModels = session.selectedModels.map(id =>
        id === replacementContext.modelId ? newModelId : id
      );

      setSession({
        ...session,
        iterations: updatedIterations,
        selectedModels: updatedSelectedModels,
        modelColors: updatedModelColors
      });

      setReplacementContext(null);

    } catch (error: any) {
      console.error('Failed to replace model:', error);
      alert(`Failed to replace model: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Export session as markdown
  const handleExportSession = () => {
    if (!session) return;

    const markdown = exportSessionAsMarkdown(session);
    const timestamp = new Date(session.createdAt).toISOString().split('T')[0];
    const filename = `prompt-lab-workshop-${timestamp}.md`;

    downloadAsFile(markdown, filename, 'text/markdown');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Auth: Disabled - Show Welcome Screen */}
      {isAuthDisabled && (
        <>
          <WelcomeScreen 
            onEnter={handleEnter} 
            onLearnMore={() => setShowAbout(true)} 
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
          <AboutModal 
            isOpen={showAbout} 
            onClose={() => setShowAbout(false)} 
          />
        </>
      )}

      {/* Auth: Enabled but not logged in - Show Login */}
      {!isAuthDisabled && isAuthenticated === false && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {/* Auth: Checking... */}
      {!isAuthDisabled && authStatus === null && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-slate-400">Checking authentication...</div>
        </div>
      )}

      {/* Auth: Authenticated - Show App */}
      {!isAuthDisabled && isAuthenticated && (
        <>
          {/* Top Navigation */}
          <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setAuthStatus({ authenticated: false })}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  P
                </div>
                <div className="text-left">
                  <h1 className="font-black text-slate-900 tracking-tight">Prompt Lab</h1>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">v2.0</p>
                </div>
              </button>

              <div className="flex items-center gap-4">
                {session && (
                  <>
                    <button
                      onClick={handleNewSession}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-100 transition-colors border border-slate-200"
                      title="Start a new workshop session"
                    >
                      <RotateCcw size={16} />
                      <span>New Session</span>
                    </button>
                    <button
                      onClick={() => setShowSynthesis(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-black hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                      <span>✨</span>
                      <span>Synthesize</span>
                    </button>
                    <button
                      onClick={handleExportSession}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-black hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                      <Download size={16} />
                      <span>Export</span>
                    </button>
                  </>
                )}

                <div className="relative group cursor-not-allowed">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border border-dashed border-slate-300 text-slate-400"
                    title="Coming soon"
                  >
                    <Folder size={16} />
                    <span>Workspace</span>
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded">
                      Coming Soon
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                  title="API Keys"
                >
                  <Key size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">API Keys</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="py-8">
            {!session ? (
              <Editor
                promptData={promptData}
                selectedModels={selectedModels}
                clackyContext={clackyContext}
                onChange={setPromptData}
                onModelSelectionChange={setSelectedModels}
                onContextImport={setClackyContext}
                onStartWorkshop={handleStartWorkshop}
                isLoading={isLoading}
                loadingProgress={loadingProgress}
              />
            ) : (
              <Timeline
                session={session}
                winnerId={winnerId}
                onSelectWinner={handleSelectWinner}
                onLockIn={handleLockIn}
                onExecuteRound={handleExecuteRound}
                onMarkCheckpoint={handleMarkCheckpoint}
                isLoading={isLoading}
                onFeedback={handleFeedback}
                onReplaceModel={handleReplaceModel}
              />
            )}
          </main>

          {/* Modals */}
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            onSave={handleSaveSettings}
          />

          {showSynthesis && session && (
            <SynthesisPanel
              session={session}
              onClose={() => setShowSynthesis(false)}
            />
          )}

          {/* Winner Action Modal */}
          {winnerContext && (
            <WinnerActionModal
              isOpen={showWinnerModal}
              onClose={() => setShowWinnerModal(false)}
              winnerModelName={winnerContext.winnerModelId.split('/').pop() || 'Winner'}
              loserModelName={winnerContext.loserModelId.split('/').pop() || 'Other'}
              onSelectAction={handleWinnerAction}
            />
          )}

          {/* Model Replacement Modal */}
          {replacementContext && (
            <ModelReplacementModal
              isOpen={showReplacementModal}
              onClose={() => {
                setShowReplacementModal(false);
                setReplacementContext(null);
              }}
              failedModelName={replacementContext.modelId.split('/').pop() || 'Model'}
              availableModels={availableModels}
              onSelectModel={handleSelectReplacementModel}
            />
          )}
        </>
      )}
    </div>
  );
}
