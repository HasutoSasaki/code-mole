import { GitHubWebhookPayload } from '../types/github';
import { logger } from '../utils/logger';

export interface WebhookProcessResult {
  message: string;
  prNumber?: number;
  action?: string;
  shouldAnalyze: boolean;
}

export class WebhookService {
  async processWebhookEvent(payload: GitHubWebhookPayload): Promise<WebhookProcessResult> {
    const { action, pull_request: pr } = payload;

    logger.info('Processing webhook event', {
      action,
      prNumber: pr.number,
      repository: payload.repository.full_name
    });

    switch (action) {
      case 'opened':
      case 'synchronize':
        logger.info('PR opened or updated, triggering analysis');
        return { 
          message: 'Analysis triggered', 
          prNumber: pr.number,
          shouldAnalyze: true 
        };
        
      case 'closed':
        logger.info('PR closed, skipping analysis');
        return { 
          message: 'PR closed, no analysis needed', 
          prNumber: pr.number,
          shouldAnalyze: false 
        };
        
      default:
        logger.info('Unhandled webhook action', { action });
        return { 
          message: 'Action ignored', 
          action,
          shouldAnalyze: false 
        };
    }
  }
}