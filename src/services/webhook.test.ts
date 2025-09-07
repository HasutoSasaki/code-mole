import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WebhookService } from './webhook';
import { GitHubWebhookPayload } from '../types/github';
import webhookPayload from '../../tests/fixtures/github/webhook-payload.json';

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn()
  }
}));

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    service = new WebhookService();
    jest.clearAllMocks();
  });

  it('should trigger analysis for opened PR', async () => {
    const result = await service.processWebhookEvent(webhookPayload as GitHubWebhookPayload);

    expect(result).toEqual({
      message: 'Analysis triggered',
      prNumber: 123,
      shouldAnalyze: true
    });
  });

  it('should trigger analysis for synchronized PR', async () => {
    const payload = { ...webhookPayload, action: 'synchronize' };
    
    const result = await service.processWebhookEvent(payload as GitHubWebhookPayload);

    expect(result).toEqual({
      message: 'Analysis triggered',
      prNumber: 123,
      shouldAnalyze: true
    });
  });

  it('should skip analysis for closed PR', async () => {
    const payload = { ...webhookPayload, action: 'closed' };
    
    const result = await service.processWebhookEvent(payload as GitHubWebhookPayload);

    expect(result).toEqual({
      message: 'PR closed, no analysis needed',
      prNumber: 123,
      shouldAnalyze: false
    });
  });

  it('should ignore unhandled actions', async () => {
    const payload = { ...webhookPayload, action: 'assigned' };
    
    const result = await service.processWebhookEvent(payload as GitHubWebhookPayload);

    expect(result).toEqual({
      message: 'Action ignored',
      action: 'assigned',
      shouldAnalyze: false
    });
  });
});