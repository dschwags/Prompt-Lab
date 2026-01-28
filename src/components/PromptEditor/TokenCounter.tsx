interface TokenCounterProps {
  characterCount: number;
  label: string;
}

export function TokenCounter({ characterCount, label }: TokenCounterProps) {
  // Simple token estimation: characters ÷ 4
  const tokenEstimate = Math.ceil(characterCount / 4);

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
      <span>
        <span className="text-zinc-400 font-medium">{label}:</span> {characterCount.toLocaleString()} chars
      </span>
      <span className="text-zinc-700">|</span>
      <span>
        <span className="text-zinc-400 font-medium">~</span>{tokenEstimate.toLocaleString()} tokens
      </span>
    </div>
  );
}
