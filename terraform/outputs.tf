output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api_gateway.api_gateway_url
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda.function_name
}

