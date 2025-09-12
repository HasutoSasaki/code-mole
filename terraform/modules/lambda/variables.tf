variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}

variable "sqs_queue_url" {
  description = "SQS Queue URL"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "sqs_queue_arn" {
  description = "SQS Queue ARN"
  type        = string
}