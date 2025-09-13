import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handler } from './webhook.js';
import { WebhookProcessResult } from '../services/webhook.js';
import { createMockAPIGatewayEvent, createMockContext } from '../../tests/helpers/mocks.js';
import webhookPayload from '../../tests/fixtures/github/webhook-payload.json' with { type: 'json' };

// Mock dependencies
jest.mock('../utils/config', () => ({
  validateConfig: jest.fn()
}));

const mockWebhookService = {
  processWebhookEvent: jest.fn<() => Promise<WebhookProcessResult>>()
};

jest.mock('../services/webhook', () => ({
  WebhookService: jest.fn().mockImplementation(() => mockWebhookService)
}));

jest.mock('../utils/logger', () => ({
  logger: {
    setContext: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('webhook handler', () => {
  const context = createMockContext();

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebhookService.processWebhookEvent.mockResolvedValue({
      message: 'Analysis triggered',
      prNumber: 123,
      shouldAnalyze: true
    });
  });

  it('should handle valid webhook payload', async () => {
    const event = createMockAPIGatewayEvent(JSON.stringify(webhookPayload));

    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Webhook processed successfully',
      data: {
        message: 'Analysis triggered',
        prNumber: 123,
        shouldAnalyze: true
      }
    });
  });

  it('should return 400 for missing body', async () => {
    const event = createMockAPIGatewayEvent();

    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Request body is required'
    });
  });

  it('should return 400 for invalid JSON', async () => {
    const event = createMockAPIGatewayEvent('invalid json');

    const result = await handler(event, context);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Internal server error'
    });
  });
});