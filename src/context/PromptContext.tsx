import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Prompt, PromptVersion } from '../types';
import { generateUUID } from '../utils/uuid';
import { getDB } from '../services/db.service';

interface PromptContextType {
  currentPrompt: Prompt | null;
  currentVersion: PromptVersion | null;
  systemPrompt: string;
  userPrompt: string;
  setSystemPrompt: (value: string) => void;
  setUserPrompt: (value: string) => void;
  savePrompt: () => Promise<void>;
  loadPrompt: (promptId: string) => Promise<void>;
  createNewPrompt: () => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [currentVersion, setCurrentVersion] = useState<PromptVersion | null>(null);
  const [systemPrompt, setSystemPromptState] = useState('');
  const [userPrompt, setUserPromptState] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load most recent prompt on mount
  useEffect(() => {
    async function loadMostRecentPrompt() {
      try {
        const db = await getDB();
        
        // Get all prompts sorted by updatedAt (most recent first)
        const allPrompts = await db.getAllFromIndex('prompts', 'by-updatedAt');
        
        if (allPrompts.length > 0) {
          // Get the most recent prompt
          const recentPrompt = allPrompts[allPrompts.length - 1]; // Last item is most recent
          
          // Get its current version
          const version = await db.get('promptVersions', recentPrompt.currentVersionId);
          
          if (version) {
            setCurrentPrompt(recentPrompt);
            setCurrentVersion(version);
            setSystemPromptState(version.systemPrompt);
            setUserPromptState(version.userPrompt);
            setIsInitialized(true);
            return;
          }
        }
        
        // No prompts found, create a new one
        createNewPromptInternal();
      } catch (error) {
        console.error('Error loading prompt:', error);
        // If error, create new prompt
        createNewPromptInternal();
      }
    }

    loadMostRecentPrompt();
  }, []); // Run once on mount

  const createNewPromptInternal = useCallback(() => {
    const now = Date.now();
    const promptId = generateUUID();
    const versionId = generateUUID();

    const newPrompt: Prompt = {
      id: promptId,
      createdAt: now,
      updatedAt: now,
      currentVersionId: versionId,
      tags: [],
    };

    const newVersion: PromptVersion = {
      id: versionId,
      promptId: promptId,
      versionNumber: 1,
      systemPrompt: '',
      userPrompt: '',
      createdAt: now,
      characterCount: 0,
      tokenEstimate: 0,
      hash: '',
    };

    setCurrentPrompt(newPrompt);
    setCurrentVersion(newVersion);
    setSystemPromptState('');
    setUserPromptState('');
    setIsInitialized(true);
  }, []);

  const setSystemPrompt = useCallback((value: string) => {
    setSystemPromptState(value);
  }, []);

  const setUserPrompt = useCallback((value: string) => {
    setUserPromptState(value);
  }, []);

  const createNewPrompt = useCallback(() => {
    createNewPromptInternal();
  }, [createNewPromptInternal]);

  const savePrompt = useCallback(async () => {
    if (!currentPrompt || !currentVersion) return;

    const db = await getDB();
    const now = Date.now();

    // Calculate character count and token estimate
    const characterCount = systemPrompt.length + userPrompt.length;
    const tokenEstimate = Math.ceil(characterCount / 4);

    // Create simple hash (will be replaced with SHA-256 in Step 5)
    const hash = `${systemPrompt}_${userPrompt}`.substring(0, 50);

    // Update version with current content
    const updatedVersion: PromptVersion = {
      ...currentVersion,
      systemPrompt,
      userPrompt,
      characterCount,
      tokenEstimate,
      hash,
    };

    // Update prompt
    const updatedPrompt: Prompt = {
      ...currentPrompt,
      updatedAt: now,
    };

    // Save to IndexedDB
    await db.put('promptVersions', updatedVersion);
    await db.put('prompts', updatedPrompt);

    setCurrentVersion(updatedVersion);
    setCurrentPrompt(updatedPrompt);
  }, [currentPrompt, currentVersion, systemPrompt, userPrompt]);

  const loadPrompt = useCallback(async (promptId: string) => {
    const db = await getDB();
    
    // Get prompt
    const prompt = await db.get('prompts', promptId);
    if (!prompt) return;

    // Get current version
    const version = await db.get('promptVersions', prompt.currentVersionId);
    if (!version) return;

    setCurrentPrompt(prompt);
    setCurrentVersion(version);
    setSystemPromptState(version.systemPrompt);
    setUserPromptState(version.userPrompt);
  }, []);

  // Don't render children until initialized
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <PromptContext.Provider
      value={{
        currentPrompt,
        currentVersion,
        systemPrompt,
        userPrompt,
        setSystemPrompt,
        setUserPrompt,
        savePrompt,
        loadPrompt,
        createNewPrompt,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}
