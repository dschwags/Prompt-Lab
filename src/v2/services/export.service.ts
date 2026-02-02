import { WorkshopSession } from '../types';
import { formatDate } from '../utils/format';
import { MODEL_COLORS } from '../config/model-colors';

/**
 * Export workshop session as markdown
 */
export function exportSessionAsMarkdown(session: WorkshopSession): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Prompt Lab Workshop Report`);
  lines.push(`Generated: ${formatDate(session.createdAt)}`);
  lines.push(``);

  // Session Info
  lines.push(`## Session Information`);
  lines.push(`- **Session ID:** ${session.id}`);
  lines.push(`- **Models Tested:** ${session.selectedModels.length}`);
  lines.push(`- **Iterations:** ${session.iterations.length}`);
  lines.push(``);

  // Model Colors
  lines.push(`### Model Colors (Lineage Tracking)`);
  Object.entries(session.modelColors).forEach(([modelId, color]) => {
    const colorHex = (MODEL_COLORS as any)[color]?.hex || '#000000';
    lines.push(`- ${modelId.split('/').pop()}: ${color} (${colorHex})`);
  });
  lines.push(``);

  // Original Prompts
  lines.push(`## Original Prompts`);
  lines.push(``);
  lines.push(`### System Prompt`);
  lines.push('```');
  lines.push(session.promptData.system || '(none)');
  lines.push('```');
  lines.push(``);
  lines.push(`### User Prompt`);
  lines.push('```');
  lines.push(session.promptData.user);
  lines.push('```');
  lines.push(``);

  // Clacky Context
  if (session.clackyContext) {
    lines.push(`### Project Context`);
    lines.push(`- **Project:** ${session.clackyContext.projectName}`);
    lines.push(`- **Framework:** ${session.clackyContext.context.framework}`);
    lines.push(`- **Language:** ${session.clackyContext.context.language}`);
    lines.push(``);
  }

  // Iterations
  session.iterations.forEach((iteration) => {
    lines.push(`## Iteration ${iteration.number}`);
    lines.push(`Status: ${iteration.status}`);
    if (iteration.lockedModelId) {
      lines.push(`Locked to: ${iteration.lockedModelId.split('/').pop()}`);
    }
    lines.push(``);

    // Rounds
    iteration.rounds.forEach((round) => {
      lines.push(`### Round ${round.number} (${round.type})`);
      if (round.pivot) {
        lines.push(`**Human Pivot:** "${round.pivot}"`);
      }
      lines.push(``);

      // Responses
      round.responses.forEach(response => {
        const color = response.color || 'unknown';
        const colorHex = (MODEL_COLORS as any)[color]?.hex || '#000000';

        lines.push(`#### ${response.model}${response.isWinner ? ' ⭐ WINNER' : ''}`);
        lines.push(`- Color: ${color} (${colorHex})`);
        lines.push(`- Time: ${response.metrics.time}s`);
        lines.push(`- Cost: $${response.metrics.cost.toFixed(4)}`);
        lines.push(`- Tokens: ${response.metrics.tokens}`);
        lines.push(``);

        if (response.status === 'success') {
          lines.push('**Response:**');
          lines.push('```');
          lines.push(response.text);
          lines.push('```');
        } else if (response.status === 'error') {
          lines.push(`**Error:** ${response.error}`);
        }
        lines.push(``);
      });
    });
  });

  // Summary
  lines.push(`## Summary`);

  // Calculate total cost
  let totalCost = 0;
  session.iterations.forEach(iteration => {
    iteration.rounds.forEach(round => {
      round.responses.forEach(response => {
        if (response.status === 'success') {
          totalCost += response.metrics.cost;
        }
      });
    });
  });

  lines.push(`- **Total Cost:** $${totalCost.toFixed(4)}`);
  lines.push(`- **Total Rounds:** ${session.iterations.reduce((sum, it) => sum + it.rounds.length, 0)}`);
  lines.push(``);

  // Winner history
  const winners: string[] = [];
  session.iterations.forEach(iteration => {
    iteration.rounds.forEach(round => {
      const winner = round.responses.find(r => r.isWinner);
      if (winner) {
        winners.push(`Round ${round.number}: ${winner.model}`);
      }
    });
  });

  if (winners.length > 0) {
    lines.push(`### Winners by Round`);
    winners.forEach(w => lines.push(`- ${w}`));
    lines.push(``);
  }

  return lines.join('\n');
}

/**
 * Download text content as file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
