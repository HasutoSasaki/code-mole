import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger } from '../utils/logger';
import { validateConfig } from '../utils/config';
import { AnalysisService, AnalyzeRequest } from '../services/analysis';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.setContext({ requestId: context.awsRequestId });

  try {
    validateConfig();
    logger.info('Code analyzer handler started');

    if (!event.body) {
      logger.warn('No body in request');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const request: AnalyzeRequest = JSON.parse(event.body);
    
    if (!request.repository || !request.pullRequestNumber || !request.owner || !request.repo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    logger.setContext({
      repository: request.repository,
      pullRequestId: request.pullRequestNumber.toString()
    });

    const analysisService = new AnalysisService();
    const result = await analysisService.analyzeCode(request);
    
    logger.info('Code analysis completed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Analysis completed',
        data: result
      })
    };

  } catch (error) {
    logger.error('Error in code analyzer', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Analysis failed' })
    };
  }
};