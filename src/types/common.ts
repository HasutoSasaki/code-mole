export interface AnalysisResult {
  id: string;
  repository: string;
  pullRequestId: string;
  issues: CodeIssue[];
  suggestions: LearningResource[];
  summary: string;
  createdAt: string;
}

export interface CodeIssue {
  type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

export interface LearningResource {
  title: string;
  url: string;
  source: 'qiita' | 'google' | 'official-docs';
  description: string;
  language?: string;
  tags: string[];
}

export interface Config {
  nodeEnv: string;
  awsRegion: string;
  bedrockModelId: string;
  githubToken?: string;
  qiitaToken?: string;
  googleApiKey?: string;
}

export interface LogContext {
  requestId: string;
  repository?: string;
  pullRequestId?: string;
  userId?: string;
}