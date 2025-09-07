export interface GitHubWebhookPayload {
  action: string;
  number: number;
  pull_request: PullRequest;
  repository: Repository;
  sender: User;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  draft: boolean;
  head: Branch;
  base: Branch;
  user: User;
  created_at: string;
  updated_at: string;
  diff_url: string;
  patch_url: string;
}

export interface Branch {
  sha: string;
  ref: string;
  repo: Repository;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface User {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
}

export interface GitHubFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  contents_url: string;
  blob_url: string;
  raw_url: string;
  sha: string;
}

export interface GitHubCommit {
  sha: string;
  url: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  message: string;
  tree: {
    sha: string;
    url: string;
  };
  parents: Array<{
    sha: string;
    url: string;
  }>;
}

export interface GitHubPullRequestReview {
  id: number;
  user: User;
  body: string;
  state: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED';
  html_url: string;
  pull_request_url: string;
  submitted_at: string;
}

export interface GitHubComment {
  id: number;
  user: User;
  body: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  issue_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  user: User;
  state: 'open' | 'closed';
  assignees: User[];
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}