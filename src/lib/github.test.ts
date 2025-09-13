import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GitHubService } from './github.js';
import prFiles from '../../tests/fixtures/github/pr-files.json' with { type: 'json' };

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      pulls: {
        listFiles: jest.fn()
      },
      repos: {
        getContent: jest.fn()
      },
      issues: {
        createComment: jest.fn()
      }
    }
  }))
}));

jest.mock('../utils/config', () => ({
  config: {
    githubToken: 'test-token'
  }
}));

jest.mock('../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('GitHubService', () => {
  let service: GitHubService;
  let mockOctokit: any;

  beforeEach(() => {
    const { Octokit } = require('@octokit/rest');
    mockOctokit = {
      rest: {
        pulls: {
          listFiles: jest.fn()
        },
        repos: {
          getContent: jest.fn()
        },
        issues: {
          createComment: jest.fn()
        }
      }
    };
    Octokit.mockImplementation(() => mockOctokit);
    
    service = new GitHubService();
    jest.clearAllMocks();
  });

  it('should get PR files', async () => {
    mockOctokit.rest.pulls.listFiles.mockResolvedValue({ data: prFiles });

    const result = await service.getPullRequestFiles('testuser', 'test-repo', 123);

    expect(result).toHaveLength(2);
    expect(result[0].filename).toBe('src/utils/helper.js');
    expect(result[0].status).toBe('modified');
  });

  it('should get file content', async () => {
    const mockContent = {
      type: 'file',
      content: Buffer.from('const x = 1;').toString('base64')
    };
    mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockContent });

    const result = await service.getFileContent('testuser', 'test-repo', 'test.js');

    expect(result).toBe('const x = 1;');
  });

  it('should post comment to PR', async () => {
    mockOctokit.rest.issues.createComment.mockResolvedValue({});

    await service.postComment('testuser', 'test-repo', 123, 'Test comment');

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'testuser',
      repo: 'test-repo',
      issue_number: 123,
      body: 'Test comment'
    });
  });

  it('should throw error when file content is invalid', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({ data: [] });

    await expect(service.getFileContent('testuser', 'test-repo', 'test.js'))
      .rejects.toThrow('Invalid file content response');
  });
});