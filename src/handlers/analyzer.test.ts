import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { handler } from './analyzer';
import { createMockAPIGatewayEvent, createMockContext } from '../../tests/helpers/mocks';
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

  it('should handle valid analysis request', async () => {
    const request = {
      repository: 'testuser/test-repo',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo'
    };
    const event = createMockAPIGatewayEvent(JSON.stringify(request));

    const result = await handler(event, context);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Analysis completed');
    expect(body.data).toBeDefined();
  });

  it('should return 400 for missing body', async () => {
    const event = createMockAPIGatewayEvent();

    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Request body is required'
    });
  });

  it('should return 400 for missing required fields', async () => {
    const request = { repository: 'testuser/test-repo' }; // missing other fields
    const event = createMockAPIGatewayEvent(JSON.stringify(request));

    const result = await handler(event, context);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      error: 'Missing required fields'
    });
  });
});