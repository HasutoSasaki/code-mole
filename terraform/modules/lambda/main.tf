data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${var.project_name}-${var.environment}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    effect = "Allow"
    actions = [
      "bedrock:InvokeModel"
    ]
    resources = ["*"]
  }
  
  statement {
    effect = "Allow"
    actions = [
      "sqs:SendMessage",
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes"
    ]
    resources = [var.sqs_queue_arn]
  }
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "${var.project_name}-${var.environment}-lambda-policy"
  role   = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../dist/src"
  output_path = "${path.module}/lambda.zip"
}

data "archive_file" "octokit_layer_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../layers/octokit"
  output_path = "${path.module}/octokit-layer.zip"
  excludes    = ["build.sh", "package.json"]
}

resource "aws_lambda_layer_version" "octokit_layer" {
  filename         = data.archive_file.octokit_layer_zip.output_path
  layer_name       = "${var.project_name}-${var.environment}-octokit"
  source_code_hash = data.archive_file.octokit_layer_zip.output_base64sha256
  
  compatible_runtimes = [var.lambda_runtime]
  
  description = "@octokit/rest dependencies layer"
}

resource "aws_lambda_function" "webhook_handler" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-webhook-handler"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handlers/webhook.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = 30
  
  layers = [aws_lambda_layer_version.octokit_layer.arn]

  environment {
    variables = {
      NODE_ENV      = var.environment
      SQS_QUEUE_URL = var.sqs_queue_url
    }
  }

  tags = var.tags
}

resource "aws_lambda_function" "analyzer_handler" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-analyzer"
  role             = aws_iam_role.lambda_role.arn
  handler          = "handlers/analyzer.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = var.lambda_runtime
  timeout          = 300
  
  layers = [aws_lambda_layer_version.octokit_layer.arn]

  environment {
    variables = {
      NODE_ENV      = var.environment
      SQS_QUEUE_URL = var.sqs_queue_url
    }
  }

  tags = var.tags
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.sqs_queue_arn
  function_name    = aws_lambda_function.analyzer_handler.arn
  batch_size       = 1
  enabled          = true
}
