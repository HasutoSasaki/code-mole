import { logger } from '../utils/logger';
import { BedrockService } from '../lib/bedrock';
import { GitHubService } from '../lib/github';
import { CodeIssue, AnalysisResult } from '../types/common';

export interface AnalyzeRequest {
  repository: string;
  pullRequestNumber: number;
  owner: string;
  repo: string;
}

export class AnalysisService {
  private githubService: GitHubService;
  private bedrockService: BedrockService;

  constructor() {
    this.githubService = new GitHubService();
    this.bedrockService = new BedrockService();
  }

  async analyzeCode(request: AnalyzeRequest): Promise<AnalysisResult> {
    const { owner, repo, pullRequestNumber, repository } = request;
    
    logger.info('Starting code analysis', { repository, pullRequestNumber });

    // PR のファイル一覧を取得
    const files = await this.githubService.getPullRequestFiles(owner, repo, pullRequestNumber);
    
    logger.info('Analyzing files', { 
      fileCount: files.length,
      files: files.map(f => f.filename)
    });

    const allIssues: CodeIssue[] = [];
    
    // 各ファイルを分析
    for (const file of files) {
      if (file.status === 'removed') {
        logger.debug('Skipping removed file', { filename: file.filename });
        continue;
      }

      if (!this.shouldAnalyzeFile(file.filename)) {
        logger.debug('Skipping non-code file', { filename: file.filename });
        continue;
      }

      try {
        const fileContent = await this.githubService.getFileContent(owner, repo, file.filename);
        const analysis = await this.bedrockService.analyzeCode(fileContent, file.filename);
        
        // Bedrock からの分析結果をパース
        const issues = this.parseAnalysisResult(analysis, file.filename);
        allIssues.push(...issues);
        
      } catch (error) {
        logger.warn('Failed to analyze file', { 
          filename: file.filename, 
          error: error 
        });
      }
    }

    const analysisResult: AnalysisResult = {
      id: `${repository}-${pullRequestNumber}-${Date.now()}`,
      repository,
      pullRequestId: pullRequestNumber.toString(),
      issues: allIssues,
      suggestions: [], // 学習リソース機能は後で実装
      summary: this.generateSummary(allIssues),
      createdAt: new Date().toISOString()
    };

    logger.info('Code analysis completed', {
      repository,
      pullRequestNumber,
      issueCount: allIssues.length
    });

    return analysisResult;
  }

  private shouldAnalyzeFile(filename: string): boolean {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go', '.rs'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  private parseAnalysisResult(analysis: string, filename: string): CodeIssue[] {
    try {
      const parsed = JSON.parse(analysis);
      
      if (!parsed.issues || !Array.isArray(parsed.issues)) {
        logger.warn('Invalid analysis result format', { filename });
        return [];
      }

      return parsed.issues.map((issue: any) => ({
        type: issue.type || 'style',
        severity: issue.severity || 'low',
        file: filename,
        line: issue.line,
        description: issue.description || 'No description',
        recommendation: issue.recommendation || 'No recommendation'
      }));

    } catch (error) {
      logger.warn('Failed to parse analysis result', { filename, error });
      return [];
    }
  }

  private generateSummary(issues: CodeIssue[]): string {
    const totalIssues = issues.length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    if (totalIssues === 0) {
      return '素晴らしいです！特に大きな問題は見つかりませんでした。';
    }

    let summary = `合計 ${totalIssues} 件の問題が見つかりました。`;
    
    if (criticalIssues > 0) {
      summary += ` 重大: ${criticalIssues}件`;
    }
    if (highIssues > 0) {
      summary += ` 高: ${highIssues}件`;
    }
    if (mediumIssues > 0) {
      summary += ` 中: ${mediumIssues}件`;
    }
    if (lowIssues > 0) {
      summary += ` 低: ${lowIssues}件`;
    }

    return summary;
  }
}