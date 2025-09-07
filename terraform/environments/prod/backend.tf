terraform {
  backend "s3" {
    bucket = "code-mole-terraform-state-prod"
    key    = "prod/terraform.tfstate"
    region = "ap-northeast-1"
  }
}