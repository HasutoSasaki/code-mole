variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "code-mole"
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs22.x"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project = "code-mole"
    ManagedBy = "terraform"
  }
}