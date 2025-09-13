output "queue_url" {
  description = "URL of the SQS queue"
  value       = aws_sqs_queue.analysis_queue.url
}

output "queue_arn" {
  description = "ARN of the SQS queue"
  value       = aws_sqs_queue.analysis_queue.arn
}

output "dlq_url" {
  description = "URL of the dead letter queue"
  value       = aws_sqs_queue.analysis_dlq.url
}

output "dlq_arn" {
  description = "ARN of the dead letter queue"
  value       = aws_sqs_queue.analysis_dlq.arn
}