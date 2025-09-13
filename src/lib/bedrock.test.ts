import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BedrockService } from './bedrock.js';
import { InvokeModelCommandOutput } from '@aws-sdk/client-bedrock-runtime';
import bedrockResponse from '../../tests/fixtures/bedrock/analysis-response.json' with { type: 'json' };

// Mock AWS SDK
const mockSend = jest.fn<() => Promise<InvokeModelCommandOutput>>();

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: mockSend
  })),
  InvokeModelCommand: jest.fn()
}));

jest.mock('../utils/config', () => ({
  config: {
    awsRegion: 'ap-northeast-1',
    bedrockModelId: 'anthropic.claude-3-haiku-20240307-v1:0'
  }
}));

jest.mock('../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('BedrockService', () => {
  let service: BedrockService;

  beforeEach(() => {
    service = new BedrockService();
    jest.clearAllMocks();
  });

  it('should analyze code and return parsed result', async () => {
    const mockBody = new TextEncoder().encode(JSON.stringify(bedrockResponse));
    Object.assign(mockBody, {
      transformToString: () => JSON.stringify(bedrockResponse)
    });

    mockSend.mockResolvedValue({
      body: mockBody,
      contentType: 'application/json',
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        attempts: 1,
        totalRetryDelay: 0
      }
    } as InvokeModelCommandOutput);

    const result = await service.analyzeCode('const x = 1;', 'test.js');

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should throw error when Bedrock response is empty', async () => {
    mockSend.mockResolvedValue({
      body: null,
      contentType: 'application/json',
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        attempts: 1,
        totalRetryDelay: 0
      }
    } as unknown as InvokeModelCommandOutput);

    await expect(service.analyzeCode('const x = 1;', 'test.js'))
      .rejects.toThrow('Empty response from Bedrock');
  });

  it('should throw error when Bedrock response has no content', async () => {
    const mockBody = new TextEncoder().encode(JSON.stringify({ content: [] }));
    Object.assign(mockBody, {
      transformToString: () => JSON.stringify({ content: [] })
    });

    mockSend.mockResolvedValue({
      body: mockBody,
      contentType: 'application/json',
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        attempts: 1,
        totalRetryDelay: 0
      }
    } as InvokeModelCommandOutput);

    await expect(service.analyzeCode('const x = 1;', 'test.js'))
      .rejects.toThrow('No content in Bedrock response');
  });
});