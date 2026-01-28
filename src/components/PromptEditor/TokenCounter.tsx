interface TokenCounterProps {
  characterCount: number;
  label: string;
}

export function TokenCounter({ characterCount, label }: TokenCounterProps) {
  // Simple token estimation: characters ÷ 4
  const tokenEstimate = Math.ceil(characterCount / 4);

  return (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <span>
        {label}: {characterCount.toLocaleString()} chars
      </span>
      <span className="text-gray-400">|</span>
      <span>~{tokenEstimate.toLocaleString()} tokens</span>
    </div>
  );
}
