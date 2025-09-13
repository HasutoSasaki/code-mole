import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { BedrockRequest, BedrockResponse } from '../types/aws.js';

export class BedrockService {
  private client: BedrockRuntimeClient;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: config.awsRegion,
    });
  }

  async analyzeCode(code: string, filename: string): Promise<string> {
    const prompt = this.buildAnalysisPrompt(code, filename);
    
    logger.debug('Sending code analysis request to Bedrock', {
      filename,
      codeLength: code.length
    });

    try {
      const request: BedrockRequest = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: config.bedrockModelId,
        body: JSON.stringify(request),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.client.send(command);
      
      if (!response.body) {
        throw new Error('Empty response from Bedrock');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as BedrockResponse;
      
      if (!responseBody.content || responseBody.content.length === 0) {
        throw new Error('No content in Bedrock response');
      }

      const analysis = responseBody.content[0].text;
      
      logger.info('Code analysis completed', {
        filename,
        inputTokens: responseBody.usage?.input_tokens,
        outputTokens: responseBody.usage?.output_tokens
      });

      return analysis;

    } catch (error) {
      logger.error('Error calling Bedrock API', error);
      throw new Error(`Bedrock analysis failed: ${error}`);
    }
  }

  private buildAnalysisPrompt(code: string, filename: string): string {
    return `あなたは経験豊富なソフトウェアエンジニアです。以下のコードをレビューして、問題点や改善点を日本語で指摘してください。

ファイル名: ${filename}

コード:
\`\`\`
${code}
\`\`\`

以下の観点でレビューしてください：
1. バグや潜在的な問題
2. セキュリティの問題
3. パフォーマンスの問題
4. コードスタイルや可読性
5. ベストプラクティスの観点

各問題について以下の形式でJSONで回答してください：
{
  "issues": [
    {
      "type": "bug|security|performance|style|best-practice",
      "severity": "low|medium|high|critical",
      "line": 行番号(該当する場合),
      "description": "問題の説明",
      "recommendation": "改善提案"
    }
  ],
  "summary": "全体的な評価とコメント"
}`;
  }
}