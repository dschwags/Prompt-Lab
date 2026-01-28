/**
 * STEP 5 MVP: Simplest possible Claude API call
 * No streaming, minimal error handling - just prove it works
 */

interface ClaudeResponse {
  content: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

/**
 * Send a prompt to Claude and get a response
 * Uses Claude Sonnet 4.5 by default
 */
export async function sendPromptToClaude(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<ClaudeResponse> {
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true', // Required for browser calls
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', // Hardcoded for MVP
      max_tokens: 4096,
      system: systemPrompt || undefined, // Only include if not empty
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();

  // Extract the text from the response
  const content = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n');

  return {
    content,
    tokensIn: data.usage.input_tokens,
    tokensOut: data.usage.output_tokens,
    model: data.model,
  };
}
