import { PullRequest as GitHubPullRequest, Repository, User } from '../types/github';

export class PullRequestModel {
  public readonly id: number;
  public readonly number: number;
  public readonly title: string;
  public readonly body: string | null;
  public readonly state: 'open' | 'closed';
  public readonly draft: boolean;
  public readonly author: User;
  public readonly repository: Repository;
  public readonly headSha: string;
  public readonly baseSha: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly diffUrl: string;
  public readonly patchUrl: string;

  constructor(githubPr: GitHubPullRequest) {
    this.id = githubPr.id;
    this.number = githubPr.number;
    this.title = githubPr.title;
    this.body = githubPr.body;
    this.state = githubPr.state;
    this.draft = githubPr.draft;
    this.author = githubPr.user;
    this.repository = githubPr.head.repo;
    this.headSha = githubPr.head.sha;
    this.baseSha = githubPr.base.sha;
    this.createdAt = new Date(githubPr.created_at);
    this.updatedAt = new Date(githubPr.updated_at);
    this.diffUrl = githubPr.diff_url;
    this.patchUrl = githubPr.patch_url;
  }

  get isOpen(): boolean {
    return this.state === 'open';
  }

  get isClosed(): boolean {
    return this.state === 'closed';
  }

  get isDraft(): boolean {
    return this.draft;
  }

  get repositoryFullName(): string {
    return this.repository.full_name;
  }

  get authorLogin(): string {
    return this.author.login;
  }

  get isReadyForReview(): boolean {
    return this.isOpen && !this.isDraft;
  }

  toJSON(): object {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      body: this.body,
      state: this.state,
      draft: this.draft,
      author: this.author,
      repository: this.repository,
      headSha: this.headSha,
      baseSha: this.baseSha,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      diffUrl: this.diffUrl,
      patchUrl: this.patchUrl
    };
  }
}