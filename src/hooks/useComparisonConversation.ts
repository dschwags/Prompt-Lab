/**
 * useComparisonConversation Hook - Phase A (Minimal)
 * 
 * PURPOSE: Track Round 1 + Round 2 (discussion) in Comparison Mode
 * 
 * Phase A Scope:
 * - Store Round 1 responses
 * - Add Round 2 (discussion) responses
 * - Track conversation rounds array
 * 
 * NOT in Phase A:
 * - Follow-up rounds (Phase B/C)
 * - Synthesis integration (later)
 */

import { useState, useCallback } from 'react';
import type { ConversationRound, ComparisonConversation } from '../types/ResponseMetrics';
import type { ResponseDisplay } from '../types/ResponseMetrics';
import type { LLMProvider } from '../services/unified-api.service';

interface UseComparisonConversationReturn {
  conversation: ComparisonConversation | null;
  rounds: ConversationRound[];
  
  // Initialize conversation with Round 1
  startConversation: (
    systemPrompt: string,
    userPrompt: string,
    leftProvider: LLMProvider,
    leftModel: string,
    leftResponse: ResponseDisplay,
    rightProvider: LLMProvider,
    rightModel: string,
    rightResponse: ResponseDisplay
  ) => void;
  
  // Add Round 2 (discussion)
  addDiscussionRound: (
    leftResponse: ResponseDisplay,
    rightResponse: ResponseDisplay
  ) => void;
  
  // Reset conversation
  resetConversation: () => void;
  
  // Check if we have Round 1 completed
  hasRound1: boolean;
  
  // Check if we have Round 2 completed
  hasRound2: boolean;
}

export function useComparisonConversation(): UseComparisonConversationReturn {
  const [conversation, setConversation] = useState<ComparisonConversation | null>(null);

  const startConversation = useCallback((
    systemPrompt: string,
    userPrompt: string,
    leftProvider: LLMProvider,
    leftModel: string,
    leftResponse: ResponseDisplay,
    rightProvider: LLMProvider,
    rightModel: string,
    rightResponse: ResponseDisplay
  ) => {
    const round1: ConversationRound = {
      roundNumber: 1,
      type: 'initial',
      responses: {
        left: {
          model: leftResponse.model,
          provider: leftProvider,
          content: leftResponse.text,
          metrics: {
            timeSeconds: leftResponse.timeSeconds,
            cost: leftResponse.cost,
            inputTokens: leftResponse.inputTokens,
            outputTokens: leftResponse.outputTokens,
          },
        },
        right: {
          model: rightResponse.model,
          provider: rightProvider,
          content: rightResponse.text,
          metrics: {
            timeSeconds: rightResponse.timeSeconds,
            cost: rightResponse.cost,
            inputTokens: rightResponse.inputTokens,
            outputTokens: rightResponse.outputTokens,
          },
        },
      },
      timestamp: Date.now(),
    };

    const newConversation: ComparisonConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      systemPrompt,
      initialUserPrompt: userPrompt,
      rounds: [round1],
      leftProvider,
      leftModel,
      rightProvider,
      rightModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversation(newConversation);
  }, []);

  const addDiscussionRound = useCallback((
    leftResponse: ResponseDisplay,
    rightResponse: ResponseDisplay
  ) => {
    if (!conversation) {
      console.error('Cannot add discussion round: no conversation initialized');
      return;
    }

    const round2: ConversationRound = {
      roundNumber: 2,
      type: 'discussion',
      responses: {
        left: {
          model: leftResponse.model,
          provider: conversation.leftProvider,
          content: leftResponse.text,
          metrics: {
            timeSeconds: leftResponse.timeSeconds,
            cost: leftResponse.cost,
            inputTokens: leftResponse.inputTokens,
            outputTokens: leftResponse.outputTokens,
          },
        },
        right: {
          model: rightResponse.model,
          provider: conversation.rightProvider,
          content: rightResponse.text,
          metrics: {
            timeSeconds: rightResponse.timeSeconds,
            cost: rightResponse.cost,
            inputTokens: rightResponse.inputTokens,
            outputTokens: rightResponse.outputTokens,
          },
        },
      },
      timestamp: Date.now(),
    };

    setConversation({
      ...conversation,
      rounds: [...conversation.rounds, round2],
      updatedAt: Date.now(),
    });
  }, [conversation]);

  const resetConversation = useCallback(() => {
    setConversation(null);
  }, []);

  const hasRound1 = conversation !== null && conversation.rounds.length >= 1;
  const hasRound2 = conversation !== null && conversation.rounds.length >= 2;

  return {
    conversation,
    rounds: conversation?.rounds || [],
    startConversation,
    addDiscussionRound,
    resetConversation,
    hasRound1,
    hasRound2,
  };
}
