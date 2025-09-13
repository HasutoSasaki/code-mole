import { Octokit } from '@octokit/rest';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { GitHubFile } from '../types/github.js';

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: config.githubToken,
    });
  }

  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubFile[]> {
    try {
      logger.debug('Fetching PR files from GitHub', {
        owner,
        repo,
        pullNumber
      });

      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      logger.info('Retrieved PR files', {
        fileCount: files.length,
        owner,
        repo,
        pullNumber
      });

      return files.map(file => ({
        filename: file.filename,
        status: file.status as 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'changed' | 'unchanged',
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch || '',
        contents_url: file.contents_url,
        blob_url: file.blob_url || '',
        raw_url: file.raw_url || '',
        sha: file.sha || ''
      }));

    } catch (error) {
      logger.error('Error fetching PR files from GitHub', error);
      throw new Error(`Failed to fetch PR files: ${error}`);
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    try {
      logger.debug('Fetching file content from GitHub', {
        owner,
        repo,
        path,
        ref
      });

      const params: any = { owner, repo, path };
      if (ref) {
        params.ref = ref;
      }
      
      const { data } = await this.octokit.rest.repos.getContent(params);

      if (Array.isArray(data) || data.type !== 'file') {
        throw new Error('Invalid file content response');
      }

      if (!data.content) {
        throw new Error('No content in file');
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      logger.debug('Retrieved file content', {
        owner,
        repo,
        path,
        contentLength: content.length
      });

      return content;

    } catch (error) {
      logger.error('Error fetching file content from GitHub', error);
      throw new Error(`Failed to fetch file content: ${error}`);
    }
  }

  async postComment(
    owner: string,
    repo: string,
    pullNumber: number,
    comment: string
  ): Promise<void> {
    try {
      logger.debug('Posting comment to GitHub PR', {
        owner,
        repo,
        pullNumber
      });

      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: comment,
      });

      logger.info('Posted comment to PR', {
        owner,
        repo,
        pullNumber
      });

    } catch (error) {
      logger.error('Error posting comment to GitHub', error);
      throw new Error(`Failed to post comment: ${error}`);
    }
  }
}