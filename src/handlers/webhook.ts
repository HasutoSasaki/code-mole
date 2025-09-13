import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger } from '../utils/logger.js';
import { validateConfig } from '../utils/config.js';
import { validateWebhookPayload, ValidationError } from '../utils/validator.js';
import { GitHubWebhookPayload } from '../types/github.js';
import { WebhookService } from '../services/webhook.js';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.setContext({ requestId: context.awsRequestId });

  try {
    validateConfig();
    logger.info('Webhook handler started');

    if (!event.body) {
      logger.warn('No body in request');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const payload: GitHubWebhookPayload = JSON.parse(event.body);

    validateWebhookPayload(payload);

    logger.setContext({
      repository: payload.repository.full_name,
      pullRequestId: payload.pull_request.number.toString()
    });

    const webhookService = new WebhookService();
    const result = await webhookService.processWebhookEvent(payload);

    logger.info('Webhook processed successfully', { result });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Webhook processed successfully',
        data: result
      })
    };

  } catch (error) {
    logger.error('Error processing webhook', error);

    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};