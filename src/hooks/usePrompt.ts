import { useEffect, useRef } from 'react';
import { usePromptContext } from '../context/PromptContext';

/**
 * Hook for managing prompt editing with auto-save
 * Auto-saves to IndexedDB with 1000ms debounce
 */
export function usePrompt() {
  const context = usePromptContext();
  const saveTimeoutRef = useRef<number>();

  // Debounced auto-save effect
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = window.setTimeout(() => {
      if (context.systemPrompt || context.userPrompt) {
        context.savePrompt();
      }
    }, 1000); // 1000ms debounce

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [context.systemPrompt, context.userPrompt]);

  return context;
}
