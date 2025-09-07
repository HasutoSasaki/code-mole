#!/bin/bash

set -e

ENVIRONMENT=${1:-dev}

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Invalid environment. Use 'dev' or 'prod'"
  exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Build the project
./scripts/build.sh

# Navigate to terraform directory
cd terraform

# Copy environment-specific backend configuration
cp environments/$ENVIRONMENT/backend.tf .

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/$ENVIRONMENT/terraform.tfvars"

# Ask for confirmation
read -p "Do you want to apply these changes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Apply changes
  terraform apply -var-file="environments/$ENVIRONMENT/terraform.tfvars" -auto-approve
  echo "✅ Deployment to $ENVIRONMENT completed successfully!"
else
  echo "❌ Deployment cancelled"
  exit 1
fi