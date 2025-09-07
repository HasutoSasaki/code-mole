import { GitHubWebhookPayload } from '../types/github';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateWebhookPayload(payload: any): GitHubWebhookPayload {
  if (!payload) {
    throw new ValidationError('Payload is required');
  }

  if (typeof payload.action !== 'string') {
    throw new ValidationError('Invalid action field');
  }

  if (!payload.pull_request) {
    throw new ValidationError('Pull request data is required');
  }

  if (!payload.repository) {
    throw new ValidationError('Repository data is required');
  }

  if (typeof payload.number !== 'number') {
    throw new ValidationError('Invalid PR number');
  }

  return payload as GitHubWebhookPayload;
}

export function validateGitHubSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const actualSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(actualSignature, 'hex')
  );
}