import { FeedbackRecord, AIResponseFeedback } from '../types';
import { storageService } from './storage.service';

/**
 * Feedback Storage Service
 * Handles storing and retrieving response feedback in IndexedDB
 */
class FeedbackService {
  private readonly STORE_NAME = 'response_feedback';

  /**
   * Store a feedback record for a response
   */
  async recordFeedback(record: Omit<FeedbackRecord, 'id' | 'timestamp'>): Promise<FeedbackRecord> {
    const fullRecord: FeedbackRecord = {
      ...record,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    await storageService.save(this.STORE_NAME, fullRecord);
    return fullRecord;
  }

  /**
   * Record feedback directly from a response
   */
  async recordResponseFeedback(
    sessionId: string,
    iterationNumber: number,
    roundNumber: number,
    responseId: string,
    modelId: string,
    modelName: string,
    systemPrompt: string,
    userPrompt: string,
    metrics: {
      time: number;
      cost: number;
      tps: number;
      inputTokens: number;
      outputTokens: number;
    },
    feedback: AIResponseFeedback
  ): Promise<FeedbackRecord> {
    return this.recordFeedback({
      sessionId,
      iterationNumber,
      roundNumber,
      responseId,
      modelId,
      modelName,
      prompt: {
        system: systemPrompt,
        user: userPrompt,
      },
      metrics,
      feedback,
    });
  }

  /**
   * Get all feedback for a session
   */
  async getSessionFeedback(sessionId: string): Promise<FeedbackRecord[]> {
    const all = await storageService.getAll<FeedbackRecord>(this.STORE_NAME);
    return all.filter((r: FeedbackRecord) => r.sessionId === sessionId);
  }

  /**
   * Get all feedback for a model
   */
  async getModelFeedback(modelId: string): Promise<FeedbackRecord[]> {
    const all = await storageService.getAll<FeedbackRecord>(this.STORE_NAME);
    return all.filter((r: FeedbackRecord) => r.modelId === modelId);
  }

  /**
   * Get aggregated statistics for a model
   */
  async getModelStats(modelId: string): Promise<{
    totalResponses: number;
    avgTime: number;
    avgCost: number;
    avgTPS: number;
    relevanceScore: number;
    toneScore: number;
    relevanceCount: { up: number; down: number; neutral: number };
    toneCount: { up: number; down: number; neutral: number };
  }> {
    const feedback = await this.getModelFeedback(modelId);
    
    if (feedback.length === 0) {
      return {
        totalResponses: 0,
        avgTime: 0,
        avgCost: 0,
        avgTPS: 0,
        relevanceScore: 0,
        toneScore: 0,
        relevanceCount: { up: 0, down: 0, neutral: 0 },
        toneCount: { up: 0, down: 0, neutral: 0 },
      };
    }

    const relevanceCount = { up: 0, down: 0, neutral: 0 };
    const toneCount = { up: 0, down: 0, neutral: 0 };

    let totalTime = 0;
    let totalCost = 0;
    let totalTPS = 0;

    for (const record of feedback) {
      totalTime += record.metrics.time;
      totalCost += record.metrics.cost;
      totalTPS += record.metrics.tps;

      if (record.feedback.relevance === 1) relevanceCount.up++;
      else if (record.feedback.relevance === -1) relevanceCount.down++;
      else relevanceCount.neutral++;

      if (record.feedback.tone === 1) toneCount.up++;
      else if (record.feedback.tone === -1) toneCount.down++;
      else toneCount.neutral++;
    }

    const relevanceScore = relevanceCount.up - relevanceCount.down;
    const toneScore = toneCount.up - toneCount.down;

    return {
      totalResponses: feedback.length,
      avgTime: totalTime / feedback.length,
      avgCost: totalCost / feedback.length,
      avgTPS: totalTPS / feedback.length,
      relevanceScore,
      toneScore,
      relevanceCount,
      toneCount,
    };
  }

  /**
   * Get all feedback records
   */
  async getAllFeedback(): Promise<FeedbackRecord[]> {
    return storageService.getAll<FeedbackRecord>(this.STORE_NAME);
  }

  /**
   * Clear all feedback (for testing/reset)
   */
  async clearAll(): Promise<void> {
    await storageService.clear(this.STORE_NAME);
  }

  /**
   * Export feedback as JSON
   */
  async exportFeedback(): Promise<string> {
    const all = await this.getAllFeedback();
    return JSON.stringify(all, null, 2);
  }

  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const feedbackService = new FeedbackService();
