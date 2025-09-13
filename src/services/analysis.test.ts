import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AnalysisService } from './analysis.js';
import { GitHubFile } from '../types/github.js';
import prFiles from '../../tests/fixtures/github/pr-files.json' with { type: 'json' };

// Mock dependencies with proper typing
const mockGitHubService = {
  getPullRequestFiles: jest.fn<() => Promise<GitHubFile[]>>(),
  getFileContent: jest.fn<() => Promise<string>>()
};

const mockBedrockService = {
  analyzeCode: jest.fn<() => Promise<string>>()
};

jest.mock('../lib/github', () => ({
  GitHubService: jest.fn().mockImplementation(() => mockGitHubService)
}));

jest.mock('../lib/bedrock', () => ({
  BedrockService: jest.fn().mockImplementation(() => mockBedrockService)
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = new AnalysisService();
    jest.clearAllMocks();

    // Setup default mock implementations
    mockGitHubService.getPullRequestFiles.mockResolvedValue(prFiles as GitHubFile[]);
    mockGitHubService.getFileContent.mockResolvedValue('function helper() { const x = 1; return x; }');
    mockBedrockService.analyzeCode.mockResolvedValue(JSON.stringify({
      issues: [{
        type: 'style',
        severity: 'low',
        line: 1,
        description: '変数名が短すぎます',
        recommendation: 'より説明的な変数名を使用してください'
      }],
      summary: '1件のスタイルの問題が見つかりました'
    }));
  });

  it('should analyze code files and return results', async () => {
    const request = {
      repository: 'testuser/test-repo',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo'
    };

    const result = await service.analyzeCode(request);

    expect(result).toBeDefined();
    expect(result.repository).toBe('testuser/test-repo');
    expect(result.pullRequestId).toBe('123');
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('style');
    expect(result.issues[0].severity).toBe('low');
    expect(result.suggestions).toEqual([]);
  });

  it('should generate summary based on issues', async () => {
    const request = {
      repository: 'testuser/test-repo',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo'
    };

    const result = await service.analyzeCode(request);

    expect(result.summary).toContain('1 件');
  });

  it('should skip non-code files', async () => {
    const request = {
      repository: 'testuser/test-repo',
      pullRequestNumber: 123,
      owner: 'testuser',
      repo: 'test-repo'
    };

    const result = await service.analyzeCode(request);

    // Only .js file should be analyzed, README.md should be skipped
    expect(result.issues).toHaveLength(1);
    expect(mockBedrockService.analyzeCode).toHaveBeenCalledTimes(1);
  });
});