variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "lambda_function" {
  description = "Lambda function resource"
  type        = any
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}