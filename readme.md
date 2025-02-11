# llm-exe Lambda: AWS CDK Integration

## Overview

LLM‑EXE Lambda is a purpose‐built AWS CDK stack that acts as a wrapper around the llm‑exe package. It simplifies the integration and orchestration of LLM (Large Language Model) calls by deploying a Lambda function, an S3 bucket, and an API Gateway within your AWS environment. This deployment can be integrated into your workflows – such as AWS Step Functions – or used as a standalone service to trigger LLM requests with minimal overhead.

**Key Features:**
• Seamless deployment of Lambda, API Gateway, and S3 resources using AWS CDK.
• Direct integration with the llm‑exe package—enabling LLM calls in pure JavaScript/TypeScript with full type inference.
• Supports both text-based LLM prompts (llama‑3) and chat-based interactions (gpt‑4o, claude‑3.5).
• Provides comprehensive prompt templating with handlebars and enables LLMs to call functions or chain executors.
• Minimal opinionated design: maintain full control over how you leverage the components.

### Prerequisites

To deploy and use LLM‑EXE Lambda, ensure you have the following installed and properly configured:

• AWS CLI – must be installed and configured with appropriate permissions.
• Node.js – any LTS version is recommended.
• AWS Account – you will need your AWS account ID, region, and deployment profile details.

Theres two main steps to using this. First, you need to deploy into your account. Then you can use it.

## AWS Account Setup

You need to have a user or role configured to be able to deploy using the AWS CLI. If you have never done this before, follow this guide.

## Create CDK Permission Boundary Policy
1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from `documentation/setup/LlmExeLambdaCdkPermissionBoundaryPolicy.json` 
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `LlmExeLambdaCdkPermissionBoundaryPolicy`.


## Create CDK Deploy Policy & User
1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from `documentation/setup/DeployLlmExeCdkAppPolicy.json` 
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `DeployLlmExeCdkAppPolicy`.
4. Create a new User. 
  - Name the user `LlmExeLambdaCdkDeployUser`
  - When asked to set permissions, select the `Attach policies directly` option, and then select the policy you just created. (can be helpful to sort the table by "Type", you'll notice the 'customer managed' policy.)
 - Add the new user
5. Click on the newly created user and click on the securirty credentials tab 
    - Click create access key 
    - Access key best practices & alternatives - select "Other"
    - Provide a description, such as "Key used to deploy CDK"
    - Copy the Access key and Secret access key, you'll need them next.


## Configure AWS CLI with the new permissions

On your computer, run `aws configure --profile llm-exe-lambda`
- it will ask for the access key you just created. `AWS Access Key ID [None]:`. Paste in your access key (startes with AKI). Hit enter.
- it will ask for the access key you just created. `AWS Secret Access Key [None]: `. Paste in your secret access key (the other one). Hit enter.
- it will ask for the default region. `Default region name [None]:` If you want to use a different region, use that, otherwise us-west-2.

Run the following command to make sure the CLI is configured properly.

`aws sts get-caller-identity --profile llm-exe-lambda`

You should see a response like:

```json
{
    "UserId": "YOUR_ACCESS_KEY_ID",
    "Account": "YOUR_ACCOUNT_ID",
    "Arn": "arn:aws:iam::YOUR_ACCOUNT_ID:user/LlmExeLambdaCdkDeployUser"
}
```

### Initial Setup

Begin by preparing your environment:

1. Duplicate the sample environment file:
   • Rename .env.sample to .env.
2. Edit the .env file to include your deployment details and API keys. Example variables:

| Variable          | Required | Description                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| NODE_ENV          | required | Set your runtime environment.                                               |
| DEPLOY_ACCOUNT    | required | Your AWS Account ID.                                                        |
| DEPLOY_REGION     | required | The target AWS region for resource deployment (must be a valid AWS region). |
| DEPLOY_PROFILE    | required | The AWS CLI profile to use for deployment.                                  |
| OPEN_AI_API_KEY   | optional | Your OpenAI API key.                                                        |
| ANTHROPIC_API_KEY | optional | Your Anthropic API key.                                                     |

### Deployment Process

Follow these steps to set up and deploy the CDK stack:

1. **Bootstrap your AWS environment:** Execute the following command to initialize the environment with necessary CDK assets: `npm run bootstrap`

2. **Deploy the stack:**
   Deploy your CDK stack to AWS by running: `npm run deploy`

Once deployed, the generated Lambda can be directly invoked via API Gateway or incorporated into more complex workflows like AWS Step Functions.

### Using it

You can invoke you model using the payload or by referening a config in an s3 bucket.

Config - is using basic config,

```typescript
interface LlmExeHandlerInput {
  providor: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string; // the model specific to the providor
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
}
```

S3 Config - is using config hosted in s3

```typescript
interface LlmExeHandlerInput {
  key: string;
  version?: string;
  data?: Record<string, any>;
}
```

### Usage Examples

Below are several example payloads that illustrate how to use the deployed Lambda to make LLM calls. Each example covers a different provider and prompt configuration.

Example 1: OpenAI Provider with a Simple Prompt

```json
{
  "providor": "openai",
  "model": "gpt-4o-mini",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}
```

Example 2: Anthropic Provider with a Text Message Prompt

```json
{
  "providor": "amazon:anthropic",
  "model": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}
```

Example 3: Anthropic Provider using a Structured Chat Message

```json
{
  "providor": "anthropic",
  "model": "claude-3-5-sonnet-20240620",
  "output": "string",
  "message": [
    {
      "role": "user",
      "content": "Talk like a kitten. Hello!"
    }
  ]
}
```

Example 5: OpenAI Provider with a Dynamic Prompt Template and Schema

```json
{
  "output": "json",
  "providor": "openai",
  "model": "gpt-4o-mini",
  "message": [
    "You are performing research for an article. Search Google to learn more about the topic. The topic is: {{ topic }}"
  ],
  "schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "default": "none",
        "description": "The query you would like to use for initiating a Google search."
      },
      "explanation": {
        "type": "string",
        "default": "none",
        "description": "Provide a brief explanation on the required research approach or findings, as if collaborating with a colleague."
      },
      "thought": {
        "type": "string",
        "default": "none",
        "description": "Detail your insights or thought process in a first-person narrative."
      }
    },
    "required": ["query", "explanation", "thought"],
    "additionalProperties": false
  },
  "data": {
    "topic": "shark week"
  }
}
```

LLM‑EXE Lambda empowers you to integrate advanced LLM capabilities with your AWS infrastructure in a straightforward and flexible manner. With complete control over your prompt configurations and cloud resources, you can design powerful and scalable LLM-driven workflows.

For further technical details on the underlying llm‑exe package and advanced usage instructions, consult the official repository and API documentation.

---

## Errors

**Message**: Need to perform AWS calls for account XXXXXXX, but no credentials have been configured
**Solution**: You are not authenticated with AWS.
