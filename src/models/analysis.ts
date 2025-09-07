import { AnalysisResult, CodeIssue, LearningResource } from '../types/common';

export class AnalysisModel {
  public readonly id: string;
  public readonly repository: string;
  public readonly pullRequestId: string;
  public readonly issues: CodeIssueModel[];
  public readonly suggestions: LearningResourceModel[];
  public readonly summary: string;
  public readonly createdAt: Date;

  constructor(analysisResult: AnalysisResult) {
    this.id = analysisResult.id;
    this.repository = analysisResult.repository;
    this.pullRequestId = analysisResult.pullRequestId;
    this.issues = analysisResult.issues.map(issue => new CodeIssueModel(issue));
    this.suggestions = analysisResult.suggestions.map(suggestion => new LearningResourceModel(suggestion));
    this.summary = analysisResult.summary;
    this.createdAt = new Date(analysisResult.createdAt);
  }

  get totalIssues(): number {
    return this.issues.length;
  }

  get criticalIssues(): CodeIssueModel[] {
    return this.issues.filter(issue => issue.severity === 'critical');
  }

  get highSeverityIssues(): CodeIssueModel[] {
    return this.issues.filter(issue => issue.severity === 'high');
  }

  get mediumSeverityIssues(): CodeIssueModel[] {
    return this.issues.filter(issue => issue.severity === 'medium');
  }

  get lowSeverityIssues(): CodeIssueModel[] {
    return this.issues.filter(issue => issue.severity === 'low');
  }

  get hasCriticalIssues(): boolean {
    return this.criticalIssues.length > 0;
  }

  get issuesByType(): Record<string, CodeIssueModel[]> {
    return this.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, CodeIssueModel[]>);
  }

  get affectedFiles(): string[] {
    return [...new Set(this.issues.map(issue => issue.file))];
  }

  getIssuesForFile(filename: string): CodeIssueModel[] {
    return this.issues.filter(issue => issue.file === filename);
  }

  toJSON(): object {
    return {
      id: this.id,
      repository: this.repository,
      pullRequestId: this.pullRequestId,
      issues: this.issues.map(issue => issue.toJSON()),
      suggestions: this.suggestions.map(suggestion => suggestion.toJSON()),
      summary: this.summary,
      createdAt: this.createdAt.toISOString(),
      totalIssues: this.totalIssues,
      affectedFiles: this.affectedFiles
    };
  }
}

export class CodeIssueModel {
  public readonly type: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly file: string;
  public readonly line?: number;
  public readonly description: string;
  public readonly recommendation: string;

  constructor(issue: CodeIssue) {
    this.type = issue.type;
    this.severity = issue.severity;
    this.file = issue.file;
    if (issue.line !== undefined) {
      this.line = issue.line;
    }
    this.description = issue.description;
    this.recommendation = issue.recommendation;
  }

  get isHighPriority(): boolean {
    return this.severity === 'critical' || this.severity === 'high';
  }

  get locationString(): string {
    return this.line ? `${this.file}:${this.line}` : this.file;
  }

  toJSON(): object {
    return {
      type: this.type,
      severity: this.severity,
      file: this.file,
      ...(this.line !== undefined && { line: this.line }),
      description: this.description,
      recommendation: this.recommendation,
      locationString: this.locationString,
      isHighPriority: this.isHighPriority
    };
  }
}

export class LearningResourceModel {
  public readonly title: string;
  public readonly url: string;
  public readonly source: 'qiita' | 'google' | 'official-docs';
  public readonly description: string;
  public readonly language?: string;
  public readonly tags: string[];

  constructor(resource: LearningResource) {
    this.title = resource.title;
    this.url = resource.url;
    this.source = resource.source;
    this.description = resource.description;
    if (resource.language) {
      this.language = resource.language;
    }
    this.tags = resource.tags;
  }

  get isJapanese(): boolean {
    return this.language === 'ja' || this.source === 'qiita';
  }

  toJSON(): object {
    return {
      title: this.title,
      url: this.url,
      source: this.source,
      description: this.description,
      ...(this.language && { language: this.language }),
      tags: this.tags,
      isJapanese: this.isJapanese
    };
  }
}