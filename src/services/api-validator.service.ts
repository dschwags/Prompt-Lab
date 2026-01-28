// API Key Validation Service
// Makes minimal API calls to validate keys and retrieve quota/credit information

export interface ValidationResult {
  valid: boolean;
  status: 'valid' | 'invalid' | 'error' | 'rate_limited' | 'no_credits';
  message: string;
  credits?: string; // Human-readable credit info
  details?: string; // Additional details if needed
}

/**
 * Validate Anthropic API key
 * Uses minimal /v1/messages call with max_tokens=1
 */
export async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    if (response.ok) {
      // Anthropic doesn't provide credit info in response, but key works
      return {
        valid: true,
        status: 'valid',
        message: 'Key is valid and working',
        credits: 'Usage-based billing',
      };
    }

    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: { message: errorText } };
    }

    if (response.status === 401) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invalid API key',
        details: errorData?.error?.message || 'Authentication failed',
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        status: 'rate_limited',
        message: 'Rate limit exceeded',
        details: 'Try again in a few moments',
      };
    }

    if (response.status === 402) {
      return {
        valid: false,
        status: 'no_credits',
        message: 'Insufficient credits',
        details: 'Please add credits to your account',
      };
    }

    return {
      valid: false,
      status: 'error',
      message: `API error (${response.status})`,
      details: errorData?.error?.message || 'Unknown error',
    };
  } catch (error) {
    return {
      valid: false,
      status: 'error',
      message: 'Network error',
      details: error instanceof Error ? error.message : 'Failed to connect to API',
    };
  }
}

/**
 * Validate OpenAI API key
 * Uses /v1/models endpoint (free, no credits consumed)
 */
export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return {
        valid: true,
        status: 'valid',
        message: 'Key is valid and working',
        credits: `Access to ${modelCount} models`,
      };
    }

    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: { message: errorText } };
    }

    if (response.status === 401) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invalid API key',
        details: errorData?.error?.message || 'Authentication failed',
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        status: 'rate_limited',
        message: 'Rate limit exceeded',
        details: 'Try again in a few moments',
      };
    }

    return {
      valid: false,
      status: 'error',
      message: `API error (${response.status})`,
      details: errorData?.error?.message || 'Unknown error',
    };
  } catch (error) {
    return {
      valid: false,
      status: 'error',
      message: 'Network error',
      details: error instanceof Error ? error.message : 'Failed to connect to API',
    };
  }
}

/**
 * Validate Google AI API key
 * Uses models list endpoint (free, no quota consumed)
 */
export async function validateGoogleKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
      }
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
      return {
        valid: true,
        status: 'valid',
        message: 'Key is valid and working',
        credits: `Access to ${modelCount} models`,
      };
    }

    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: { message: errorText } };
    }

    if (response.status === 400 && errorText.includes('API_KEY_INVALID')) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invalid API key',
        details: 'Check your API key format',
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        status: 'rate_limited',
        message: 'Rate limit exceeded',
        details: 'Try again in a few moments',
      };
    }

    return {
      valid: false,
      status: 'error',
      message: `API error (${response.status})`,
      details: errorData?.error?.message || 'Unknown error',
    };
  } catch (error) {
    return {
      valid: false,
      status: 'error',
      message: 'Network error',
      details: error instanceof Error ? error.message : 'Failed to connect to API',
    };
  }
}

/**
 * Validate Cohere API key
 * Uses check-api-key endpoint
 */
export async function validateCohereKey(apiKey: string): Promise<ValidationResult> {
  try {
    // Cohere has a dedicated check-api-key endpoint
    const response = await fetch('https://api.cohere.ai/v1/check-api-key', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        status: 'valid',
        message: 'Key is valid and working',
        credits: data.organizations?.[0]?.name || 'Active account',
      };
    }

    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    if (response.status === 401) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invalid API key',
        details: 'Authentication failed',
      };
    }

    if (response.status === 429) {
      return {
        valid: false,
        status: 'rate_limited',
        message: 'Rate limit exceeded',
        details: 'Try again in a few moments',
      };
    }

    return {
      valid: false,
      status: 'error',
      message: `API error (${response.status})`,
      details: errorData?.message || 'Unknown error',
    };
  } catch (error) {
    return {
      valid: false,
      status: 'error',
      message: 'Network error',
      details: error instanceof Error ? error.message : 'Failed to connect to API',
    };
  }
}

/**
 * Main validation function - routes to appropriate provider validator
 */
export async function validateApiKey(
  providerId: string,
  apiKey: string
): Promise<ValidationResult> {
  switch (providerId) {
    case 'anthropic':
      return validateAnthropicKey(apiKey);
    case 'openai':
      return validateOpenAIKey(apiKey);
    case 'google':
      return validateGoogleKey(apiKey);
    case 'cohere':
      return validateCohereKey(apiKey);
    default:
      return {
        valid: false,
        status: 'error',
        message: 'Unknown provider',
        details: `Provider "${providerId}" is not supported`,
      };
  }
}
