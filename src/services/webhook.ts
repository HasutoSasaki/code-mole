import { GitHubWebhookPayload } from '../types/github';
import { logger } from '../utils/logger';
import { SQSService, AnalysisMessage } from '../lib/sqs';

export interface WebhookProcessResult {
  message: string;
  prNumber?: number;
  action?: string;
  shouldAnalyze: boolean;
  analysisQueued?: boolean;
}

export class WebhookService {
  private sqsService: SQSService;

  constructor() {
    this.sqsService = new SQSService();
  }

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
      case 'reopened':
        logger.info('PR opened or updated, triggering analysis');
        
        const analysisMessage: AnalysisMessage = {
          repository: payload.repository.full_name,
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          pullRequestNumber: pr.number,
          action
        };
        
        try {
          await this.sqsService.sendAnalysisMessage(analysisMessage);
          return { 
            message: 'Analysis queued successfully', 
            prNumber: pr.number,
            shouldAnalyze: true,
            analysisQueued: true
          };
        } catch (error) {
          logger.error('Failed to queue analysis', error);
          return { 
            message: 'Failed to queue analysis', 
            prNumber: pr.number,
            shouldAnalyze: true,
            analysisQueued: false
          };
        }
        
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