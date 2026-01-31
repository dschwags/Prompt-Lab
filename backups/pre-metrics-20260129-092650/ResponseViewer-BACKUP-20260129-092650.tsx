/**
 * STEP 5 MVP: Simple response display
 * No streaming, no fancy animations - just show the text
 */

interface ResponseViewerProps {
  content: string | null;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function ResponseViewer({
  content,
  tokensIn,
  tokensOut,
  model,
  isLoading,
  error,
}: ResponseViewerProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Waiting for Claude...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-sm font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // No response yet
  if (!content) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500 text-center">
          No response yet. Click "Send" to get started.
        </p>
      </div>
    );
  }

  // Show response
  return (
    <div className="flex flex-col gap-4">
      {/* Response header with stats */}
      {(tokensIn || tokensOut || model) && (
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {model && <span className="font-medium">{model}</span>}
          {tokensIn && <span>In: {tokensIn.toLocaleString()} tokens</span>}
          {tokensOut && <span>Out: {tokensOut.toLocaleString()} tokens</span>}
          {tokensIn && tokensOut && (
            <span className="text-green-600 font-medium">
              Cost: ${((tokensIn / 1_000_000) * 3 + (tokensOut / 1_000_000) * 15).toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Response content */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
