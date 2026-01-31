/**
 * Response Metrics - Type Definitions
 * 
 * FILE: ResponseMetrics-20250129-0345.ts
 * INSTALL AS: src/types/ResponseMetrics.ts
 * 
 * Philosophy: "Lean UI, Rich Storage"
 * - Store everything in background
 * - Display only: Time, Cost, Tokens, Copy
 */

// What we DISPLAY to user (The Big 3 + Text)
export interface ResponseDisplay {
  text: string;
  model: string;
  timeSeconds: number;      // ⏱️ "Is this too slow?"
  cost: number;             // 💰 "Is this too expensive?"
  inputTokens: number;      // 📊 "Why is it expensive?"
  outputTokens: number;     // 📊 "How much output?"
}

// What we STORE in IndexedDB (Everything for future analysis)
export interface StoredResponse {
  // Identity
  id: string;
  timestamp: number;
  
  // Request context
  systemPrompt: string;
  userPrompt: string;
  model: string;
  provider: string;
  isOpenRouter: boolean;
  
  // Response
  responseText: string;
  
  // Core metrics (displayed)
  timeMs: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  
  // Calculated metrics (stored, not displayed)
  tokensPerSecond: number;
  costPerKTokens: number;
  timePerKTokens: number;
  totalTokens: number;
  
  // Response characteristics (for future analytics)
  responseLength: number;    // characters
  wordCount: number;
  
  // Session tracking (for future features)
  sessionId?: string;
  previousModel?: string;
}

// Helper for creating stored responses
export function createStoredResponse(
  display: ResponseDisplay,
  systemPrompt: string,
  userPrompt: string,
  provider: string,
  isOpenRouter: boolean,
  startTime: number
): StoredResponse {
  const endTime = Date.now();
  const timeMs = endTime - startTime;
  const totalTokens = display.inputTokens + display.outputTokens;
  
  // Calculate derived metrics (stored but not displayed)
  const tokensPerSecond = totalTokens / (timeMs / 1000);
  const costPerKTokens = totalTokens > 0 ? (display.cost / totalTokens) * 1000 : 0;
  const timePerKTokens = totalTokens > 0 ? (timeMs / totalTokens) * 1000 : 0;
  
  // Simple text analysis
  const wordCount = display.text.trim().split(/\s+/).length;
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: endTime,
    
    systemPrompt,
    userPrompt,
    model: display.model,
    provider,
    isOpenRouter,
    
    responseText: display.text,
    
    timeMs,
    cost: display.cost,
    inputTokens: display.inputTokens,
    outputTokens: display.outputTokens,
    
    tokensPerSecond,
    costPerKTokens,
    timePerKTokens,
    totalTokens,
    
    responseLength: display.text.length,
    wordCount,
  };
}

// === CONVERSATION ROUNDS (for Comparison Mode Discussion) ===

export interface ConversationRound {
  roundNumber: number;
  type: 'initial' | 'discussion' | 'followup';
  userInput?: string;  // For followup rounds (Phase B/C)
  responses: {
    left: {
      model: string;
      provider: string;
      content: string;
      metrics: {
        timeSeconds: number;
        cost: number;
        inputTokens: number;
        outputTokens: number;
      };
    };
    right: {
      model: string;
      provider: string;
      content: string;
      metrics: {
        timeSeconds: number;
        cost: number;
        inputTokens: number;
        outputTokens: number;
      };
    };
  };
  timestamp: number;
}

export interface ComparisonConversation {
  id: string;
  systemPrompt: string;
  initialUserPrompt: string;
  rounds: ConversationRound[];
  leftProvider: string;
  leftModel: string;
  rightProvider: string;
  rightModel: string;
  createdAt: number;
  updatedAt: number;
}

// Storage key for IndexedDB/localStorage
export const STORAGE_KEY = 'promptlab_responses';

// Helper to save response
export function saveResponse(response: StoredResponse): void {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const responses: StoredResponse[] = existing ? JSON.parse(existing) : [];
    
    // Add new response
    responses.push(response);
    
    // Keep last 100 responses (prevent storage bloat)
    const trimmed = responses.slice(-100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save response:', error);
  }
}

// Helper to get all responses
export function getAllResponses(): StoredResponse[] {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to load responses:', error);
    return [];
  }
}
