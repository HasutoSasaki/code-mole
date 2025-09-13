import { Config } from '../types/common.js';

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'ap-northeast-1',
  bedrockModelId: process.env.BEDROCK_MODEL_ID || 'amazon.titan-text-express-v1',
  ...(process.env.GITHUB_TOKEN && { githubToken: process.env.GITHUB_TOKEN }),
  ...(process.env.QIITA_TOKEN && { qiitaToken: process.env.QIITA_TOKEN }),
  ...(process.env.GOOGLE_API_KEY && { googleApiKey: process.env.GOOGLE_API_KEY })
};

export function validateConfig(): void {
  const required = ['AWS_REGION'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}