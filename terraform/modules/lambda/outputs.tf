output "lambda_function" {
  description = "Lambda function for webhook handler"
  value       = aws_lambda_function.webhook_handler
}

output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.webhook_handler.function_name
}

output "webhook_function_arn" {
  description = "Webhook handler function ARN"
  value       = aws_lambda_function.webhook_handler.arn
}

output "analyzer_function_arn" {
  description = "Analyzer function ARN"
  value       = aws_lambda_function.analyzer_handler.arn
}