output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "${aws_api_gateway_stage.main.invoke_url}/"
}

output "webhook_url" {
  description = "Webhook endpoint URL"
  value       = "${aws_api_gateway_stage.main.invoke_url}/webhook"
}