terraform {
  backend "s3" {
    bucket = "code-mole-terraform-state-dev"
    key    = "dev/terraform.tfstate"
    region = "ap-northeast-1"
  }
}