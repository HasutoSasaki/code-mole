resource "aws_sqs_queue" "analysis_queue" {
  name = var.queue_name

  visibility_timeout_seconds = 300
  message_retention_seconds  = 1209600 # 14 days
  receive_wait_time_seconds  = 0
  delay_seconds             = 0

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.analysis_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue" "analysis_dlq" {
  name = "${var.queue_name}-dlq"

  message_retention_seconds = 1209600 # 14 days

  tags = var.tags
}

resource "aws_sqs_queue_policy" "analysis_queue_policy" {
  queue_url = aws_sqs_queue.analysis_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowLambdaAccess"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.analysis_queue.arn
      }
    ]
  })
}