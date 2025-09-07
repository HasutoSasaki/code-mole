# Architecture Overview

## Directory Structure

```
code-mole/
├── README.md
├── CONTRIBUTING.md
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── lambda/
│   │   │   ├── main.tf
│   │   │   └── variables.tf
│   │   ├── api-gateway/
│   │   │   ├── main.tf
│   │   │   └── variables.tf
│   └── environments/
│       ├── dev/
│       │   ├── terraform.tfvars
│       │   └── backend.tf
│       └── prod/
│           ├── terraform.tfvars
│           └── backend.tf
├── src/
│   ├── handlers/
│   │   ├── webhook.ts
│   │   └── analyzer.ts
│   ├── services/
│   │   ├── webhook.ts
│   │   └── analysis.ts
│   ├── lib/
│   │   ├── github.ts
│   │   ├── bedrock.ts
│   │   ├── qiita.ts
│   │   └── google.ts
│   ├── models/
│   │   ├── pullRequest.ts
│   │   ├── analysis.ts
│   │   └── resource.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── config.ts
│   │   └── validator.ts
│   └── types/
│       ├── github.ts
│       ├── aws.ts
│       └── common.ts
├── tests/
│   ├── unit/
│   │   ├── handlers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   └── fixtures/
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   └── test.sh
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── configuration.md
└── dist/
    └── (build artifacts)
```

## Directory Descriptions

### `/terraform/`
Infrastructure as Code using Terraform for AWS resource management.

- **`modules/`**: Reusable Terraform modules for different AWS services
- **`environments/`**: Environment-specific configurations (dev, prod)
- **`main.tf`**: Main infrastructure definition
- **`variables.tf`**: Input variables
- **`outputs.tf`**: Output values

### `/src/`
TypeScript source code for Lambda functions.

- **`handlers/`**: Lambda function entry points (thin API layer)
  - `webhook.ts`: GitHub webhook handler
  - `analyzer.ts`: Code analysis handler

- **`services/`**: Business logic and domain services
  - `webhook.ts`: Webhook event processing logic
  - `analysis.ts`: Code analysis orchestration

- **`lib/`**: External API integrations and infrastructure layer
  - `github.ts`: GitHub API client
  - `bedrock.ts`: AWS Bedrock integration
  - `qiita.ts`: Qiita API client
  - `google.ts`: Google Search API client

- **`models/`**: Data models and business logic
  - `pullRequest.ts`: Pull request data structure
  - `analysis.ts`: Code analysis results
  - `resource.ts`: Learning resource data

- **`utils/`**: Utility functions
  - `logger.ts`: Logging utilities
  - `config.ts`: Configuration management
  - `validator.ts`: Input validation

- **`types/`**: TypeScript type definitions
  - `github.ts`: GitHub API types
  - `aws.ts`: AWS service types
  - `common.ts`: Common type definitions

### `/tests/`
Test files organized by testing strategy.

- **`unit/`**: Unit tests mirroring the src structure
- **`integration/`**: Integration tests
- **`fixtures/`**: Test data and mock responses

### `/scripts/`
Build and deployment scripts.

- `build.sh`: Build TypeScript to JavaScript
- `deploy.sh`: Deploy infrastructure and code
- `test.sh`: Run test suites

### `/.github/workflows/`
GitHub Actions CI/CD pipelines.

- `deploy.yml`: Deployment workflow
- `test.yml`: Testing workflow

## Technology Stack

- **Runtime**: Node.js 22 with TypeScript
- **Infrastructure**: AWS Lambda, API Gateway
- **IaC**: Terraform
- **AI/ML**: AWS Bedrock (Claude, LLaMA)
- **Testing**: Jest (recommended)
- **CI/CD**: GitHub Actions

## Key Design Principles

1. **Separation of Concerns**: Clear separation between handlers (API layer), services (business logic), and lib (infrastructure layer)
2. **Environment Management**: Infrastructure code organized by environments
3. **Type Safety**: Comprehensive TypeScript type definitions
4. **Testability**: Test structure mirrors source structure
5. **Modularity**: Reusable Terraform modules for infrastructure components