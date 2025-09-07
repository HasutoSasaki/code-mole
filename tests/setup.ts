// Jest setup file
import { jest } from '@jest/globals';

// Mock AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn(),
  InvokeModelCommand: jest.fn(),
}));

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'ap-northeast-1';
process.env.BEDROCK_MODEL_ID = 'test-model';