import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export interface BedrockResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface BedrockRequest {
  anthropic_version: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
}

export interface TitanRequest {
  inputText: string;
  textGenerationConfig: {
    maxTokenCount: number;
    temperature: number;
    topP?: number;
    stopSequences?: string[];
  };
}

export interface TitanResponse {
  results: Array<{
    outputText: string;
    tokenCount: number;
    completionReason: string;
  }>;
  inputTextTokenCount: number;
}