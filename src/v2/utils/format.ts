/**
 * Format utilities for display
 */

/**
 * Format price from API string to readable USD
 */
export function formatPrice(priceStr: string): string {
  const price = parseFloat(priceStr) * 1000000;
  return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
}

/**
 * Get flag emoji by provider ID
 */
export function getFlagByProvider(providerId: string): string {
  const us = ['anthropic', 'openai', 'google', 'meta-llama', 'cohere', 'perplexity', 'nvidia'];
  const eu = ['mistralai', 'nous-research', 'mistral'];
  const cn = ['deepseek', 'qwen', '01-ai', 'yi'];
  
  const pid = providerId.toLowerCase();
  
  if (us.some(p => pid.includes(p))) return '🇺🇸';
  if (eu.some(p => pid.includes(p))) return '🇪🇺';
  if (cn.some(p => pid.includes(p))) return '🇨🇳';
  return '🌐';
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
