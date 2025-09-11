import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handler } from './analyzer';
import { createMockSQSEvent, createMockSQSRecord, createMockContext } from '../../tests/helpers/mocks';
import { AnalysisResult } from '../types/common';

// Mock dependencies
jest.mock('../utils/config', () => ({
  validateConfig: jest.fn()
}));

jest.mock('../services/analysis', () => ({
  AnalysisService: jest.fn().mockImplementation(() => ({
    analyzeCode: jest.fn<() => Promise<AnalysisResult>>().mockResolvedValue({
      id: 'test-analysis-123',
      repository: 'testuser/test-repo',
      pullRequestId: '123',
      issues: [],
      suggestions: [],
      summary: 'No issues found',
      createdAt: '2023-01-01T00:00:00.000Z'
    })
  }))
}));

jest.mock('../utils/logger', () => ({
  logger: {
    setContext: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('analyzer handler', () => {
  const context = createMockContext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle valid SQS message', async () => {
    const message = {
      repository: 'testuser/test-repo',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo',
      action: 'opened'
    };
    const sqsRecord = createMockSQSRecord(JSON.stringify(message));
    const event = createMockSQSEvent([sqsRecord]);

    await expect(handler(event, context)).resolves.toBeUndefined();
  });

  it('should handle empty SQS event', async () => {
    const event = createMockSQSEvent([]);

    await expect(handler(event, context)).resolves.toBeUndefined();
  });

  it('should handle multiple SQS records', async () => {
    const message1 = {
      repository: 'testuser/test-repo-1',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo-1',
      action: 'opened'
    };
    const message2 = {
      repository: 'testuser/test-repo-2',
      pullRequestNumber: 456,
      owner: 'testuser',
      repo: 'test-repo-2',
      action: 'synchronize'
    };
    
    const records = [
      createMockSQSRecord(JSON.stringify(message1), 'msg-1'),
      createMockSQSRecord(JSON.stringify(message2), 'msg-2')
    ];
    const event = createMockSQSEvent(records);

    await expect(handler(event, context)).resolves.toBeUndefined();
  });
});