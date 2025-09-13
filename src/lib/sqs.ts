import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { logger } from '../utils/logger.js';

export interface AnalysisMessage {
  repository: string;
  owner: string;
  repo: string;
  pullRequestNumber: number;
  action: string;
}

export class SQSService {
  private client: SQSClient;
  private queueUrl: string;

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
    });

    this.queueUrl = process.env.SQS_QUEUE_URL || '';

    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL environment variable is required');
    }
  }

  async sendAnalysisMessage(message: AnalysisMessage): Promise<void> {
    try {
      const messageBody = JSON.stringify(message);

      const input: SendMessageCommandInput = {
        QueueUrl: this.queueUrl,
        MessageBody: messageBody,
        MessageAttributes: {
          repository: {
            StringValue: message.repository,
            DataType: 'String'
          },
          pullRequestNumber: {
            StringValue: message.pullRequestNumber.toString(),
            DataType: 'Number'
          },
          action: {
            StringValue: message.action,
            DataType: 'String'
          }
        }
      };

      const command = new SendMessageCommand(input);
      const result = await this.client.send(command);

      logger.info('Message sent to SQS successfully', {
        messageId: result.MessageId,
        repository: message.repository,
        pullRequestNumber: message.pullRequestNumber
      });

    } catch (error) {
      logger.error('Failed to send message to SQS', error);
      throw error;
    }
  }
}