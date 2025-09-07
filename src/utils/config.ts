import { Config } from '../types/common';

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  awsRegion: process.env.AWS_REGION || 'ap-northeast-1',
  bedrockModelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
  githubToken: process.env.GITHUB_TOKEN,
  qiitaToken: process.env.QIITA_TOKEN,
  googleApiKey: process.env.GOOGLE_API_KEY
};

export function validateConfig(): void {
  const required = ['AWS_REGION'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}