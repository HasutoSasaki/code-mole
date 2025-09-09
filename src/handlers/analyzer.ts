import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { logger } from '../utils/logger';
import { validateConfig } from '../utils/config';
import { AnalysisService, AnalyzeRequest } from '../services/analysis';
import { AnalysisMessage } from '../lib/sqs';

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<void> => {
  logger.setContext({ requestId: context.awsRequestId });

  try {
    validateConfig();
    logger.info('Code analyzer handler started', { recordCount: event.Records.length });

    const analysisService = new AnalysisService();
    
    // Process each SQS record
    for (const record of event.Records) {
      await processSQSRecord(record, analysisService);
    }
    
    logger.info('All SQS records processed successfully');

  } catch (error) {
    logger.error('Error in code analyzer', error);
    throw error; // Re-throw to trigger SQS retry mechanism
  }
};

async function processSQSRecord(record: SQSRecord, analysisService: AnalysisService): Promise<void> {
  try {
    const message: AnalysisMessage = JSON.parse(record.body);
    
    logger.info('Processing analysis message', {
      repository: message.repository,
      pullRequestNumber: message.pullRequestNumber,
      action: message.action
    });
    
    const request: AnalyzeRequest = {
      repository: message.repository,
      owner: message.owner,
      repo: message.repo,
      pullRequestNumber: message.pullRequestNumber
    };
    
    logger.setContext({
      repository: request.repository,
      pullRequestId: request.pullRequestNumber.toString()
    });

    await analysisService.analyzeCode(request);
    
    logger.info('Code analysis completed successfully', { 
      messageId: record.messageId,
      repository: message.repository,
      pullRequestNumber: message.pullRequestNumber
    });
    
  } catch (error) {
    logger.error('Failed to process SQS record', {
      messageId: record.messageId,
      error
    });
    throw error;
  }
}