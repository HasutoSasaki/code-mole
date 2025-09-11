import { jest } from '@jest/globals';

export const createMockContext = () => ({
  awsRequestId: 'test-request-id',
  functionName: 'test-function',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:ap-northeast-1:123456789012:function:test',
  memoryLimitInMB: '128',
  getRemainingTimeInMillis: () => 30000,
  logGroupName: '/aws/lambda/test',
  logStreamName: '2023/01/01/[$LATEST]abcdef123456',
  callbackWaitsForEmptyEventLoop: true,
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn()
});

export const createMockAPIGatewayEvent = (body?: string) => ({
  body: body || null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'POST',
  isBase64Encoded: false,
  path: '/webhook',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '123456789012',
    apiId: 'test-api',
    authorizer: {},
    protocol: 'HTTP/1.1',
    httpMethod: 'POST',
    path: '/webhook',
    stage: 'test',
    requestId: 'test-request-id',
    requestTime: '01/Jan/2023:00:00:00 +0000',
    requestTimeEpoch: 1672531200,
    resourceId: 'test-resource',
    resourcePath: '/webhook',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '127.0.0.1',
      user: null,
      userAgent: 'test-agent',
      userArn: null,
      clientCert: null
    }
  },
  resource: '/webhook'
});

export const mockBedrockClient = {
  send: jest.fn()
};

export const createMockSQSEvent = (records: any[] = []) => ({
  Records: records
});

export const createMockSQSRecord = (body: string, messageId: string = 'test-message-id') => ({
  messageId,
  receiptHandle: 'test-receipt-handle',
  body,
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '1672531200000',
    SenderId: 'test-sender',
    ApproximateFirstReceiveTimestamp: '1672531200000'
  },
  messageAttributes: {},
  md5OfBody: 'test-md5',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:ap-northeast-1:123456789012:test-queue',
  awsRegion: 'ap-northeast-1'
});

export const mockOctokit = {
  rest: {
    pulls: {
      listFiles: jest.fn()
    },
    repos: {
      getContent: jest.fn()
    },
    issues: {
      createComment: jest.fn()
    }
  }
};