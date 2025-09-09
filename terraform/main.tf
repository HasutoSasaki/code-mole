terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Lambda Module
module "lambda" {
  source = "./modules/lambda"

  environment    = var.environment
  project_name   = var.project_name
  lambda_runtime = var.lambda_runtime

  tags = var.tags
}

# API Gateway Module
module "api_gateway" {
  source = "./modules/api-gateway"

  environment     = var.environment
  project_name    = var.project_name
  lambda_function = module.lambda.lambda_function

  tags = var.tags
}

