# llm-exe Lambda: AWS CDK Integration

## Overview

llm-exe Lambda is a purpose‐built AWS CDK stack that acts as a wrapper around the llm-exe package. It simplifies the integration and orchestration of LLM calls by deploying a Lambda function within your AWS environment. This deployment can be integrated into your workflows – such as AWS Step Functions, API Gateway, SQS – or used as a standalone service to trigger LLM requests with minimal overhead.

**Key Features:**
- Seamless deployment of Lambda, and associated resources using AWS CDK.
- Utilizes best practices to store secrets in SSM
- Reference complex prompts from direct input S3 bucket 

**Take advantage of llm-exe core features such as:**
- Supports both text-based LLM prompts (llama‑3) and chat-based interactions (gpt‑4o, claude‑3.5).
- Provides comprehensive prompt templating with handlebars and enables LLMs to call functions or chain executors.

### Getting Started

To deploy and use llm-exe Lambda, ensure you have the following installed and properly configured:

- AWS CLI – must be installed and configured with appropriate permissions.
- Node.js – any LTS version is recommended.
- AWS Account – you will need your AWS account ID, region, and deployment profile details.

**Setup + Deploy Steps**
1. [AWS Account Setup](#aws-account-setup)
    1. [Create CDK Permission Boundary Policy](#create-cdk-permission-boundary-policy)
    2. [Create CDK Deploy Policy & User](#create-cdk-deploy-policy---user)
    3. [Configure AWS CLI with the new permissions](#configure-aws-cli-with-the-new-permissions)
    4. [Test CLI](#test-cli)
2. [Deploy the stack into your AWS account](#deploy-the-stack-into-your-aws-account)
    1. [Setup .env File](#setup-env-file)
    2. [Bootstrap & Deploy Process](#deployment-process)
3. [Using llm-exe Lambda](#using-llm-exe-lambda)
   - [Usage Examples](#usage-examples)
   - [Updating SSM Secrets](#updating-ssm-secrets)
   - [Help](#help)

## 1. AWS Account Setup

You need to have a user or role configured to be able to deploy CDK stacks using the AWS CLI. If you already know what to do here, you can skip ahead.

Note: There are other ways to configure AWS CLI. The instructions below are one of many reasonable options. [See the AWS CLI Docs](https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html)

### Create CDK Permission Boundary Policy
A CDK permission boundary is a mechanism in AWS that allows you to set a custom permission boundary for IAM roles created or updated by the AWS Cloud Development Kit, ensuring roles do not exceed certain privileges. You will create a special policy that you use to deploy this stack. [See the AWS CDK Docs to learn more](https://docs.aws.amazon.com/cdk/v2/guide/customize-permissions-boundaries.html)

1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from `documentation/setup/LlmExeLambdaCdkPermissionBoundaryPolicy.json` 
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `LlmExeLambdaCdkPermissionBoundaryPolicy`.


### Create CDK Deploy Policy & User
Next, you need to create the user (and associated policy) that is used to deploy the actual stack. After creating this user, you'll generate access keys that you'll use on your machine when deploying.

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


### Configure AWS CLI with the new permissions

Foinally, configure the new user with the AWS SLi on your machine. On your computer, run `aws configure --profile llm-exe-lambda`.

- It will ask for the access key you just created. `AWS Access Key ID [None]:`. Paste in your access key (starts with AKI). Hit enter.
- It will ask for the access key you just created. `AWS Secret Access Key [None]: `. Paste in your secret access key (the other one). Hit enter.
- It will ask for the default region. `Default region name [None]:` If you want to use a specific region, use that, otherwise set as us-west-2.


### Test The AWS CLI 

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

## 2. Deploy the stack into your AWS account


### Setup .env File

Begin by preparing your environment:

1. Duplicate the sample environment file:
   - Rename .env.sample to .env.
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

Once deployed, the generated Lambda can be directly invoked via API Gateway or incorporated into more complex workflows like AWS Step Functions, SQS, etc.

## 3. Using llm-exe Lambda

You can invoke you model using the config payload outlined below or by referencing a json-config hosted in an s3 bucket.

### Config-Based Input

The typescript interface below defines the input for the function.

```typescript

interface LlmExeHandlerInput {
  providor: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string;
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
}
```

If you read json-schema better, here is that payload expressed as json-schema
```json
{
  "type": "object",
  "properties": {
    "providor": {
      "type": "string",
      "enum": ["openai", "anthropic", "amazon:anthropic", "amazon:meta"],
      "description": "the organization providing the model - must be one of valid enum."
    },
    "model": {
      "type": "string",
      "description": "the specific model you would like to use"
    },
    "output": {
      "type": "string",
      "enum": ["string", "json", "list"],
      "default": "string",
      "description": "the data object is used to pass data to the message"
    },
    "message": {
      "description": "This is the prompt itsself",
      "oneOf": [
        {
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "role": {
                "type": "string",
                "enum": ["system", "user", "assistant"],
              },
              "content": {
                "type": "string"
              }
            },
            "required": ["role", "content"]
          }
        }
      ]
    },
    "schema": {
      "type": "object",
      "additionalProperties": true,
      "description": "when using output of 'json' - schema is required to define the expected return value"
    },
    "data": {
      "type": "object",
      "additionalProperties": true,
      "description": "the data object is used to pass data to the message"
    }
  },
  "required": ["providor", "model", "message"]
}

```


### S3 Hosted Input
You can store config files in S3 as well if you prefer. This can help with complex schemas. I'll also support other formats soon.

```typescript
interface LlmExeHandlerInput {
  key: string;
  version?: string;
  data?: Record<string, any>;
}
```
aka
```json
{
  "type": "object",
  "properties": {
    "bucket": {
      "type": "string",
      "description": "this is the S3 bucket name"
    },
    "key": {
      "type": "string",
      "description": "this is the key for the file in S3"
    },
    "version": {
      "type": "string",
      "description": "if you would like to specify an object version"
    },
    "data": {
      "type": "object",
      "additionalProperties": true,
      "description": "the data object is used to pass data to the message"
    }
  },
  "required": ["key"]
}
```

### Usage Examples

Below are several example payloads that illustrate how to use the deployed Lambda to make LLM calls. Each example covers a different provider and prompt configuration.

You can copy and paste the examples into the Lambda test area, or invoke the lambda with the payload, or send a POST request to the function url with the examples as the body.

#### Invoke using function url
```bash
curl --location 'YOUR_FUNCTION_URL/invoke' \
--header 'Content-Type: application/json' \
--data '{
  "providor": "openai",
  "model": "gpt-4o-mini",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}'
```
Note: Replace YOUR_FUNCTION_URL with your actual function's url.


#### Example Payloads


```json
{
  "providor": "openai",
  "model": "gpt-4o-mini",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}
```



```json
{
  "providor": "openai",
  "model": "gpt-4o-mini",
  "output": "string",

  "key": "file-name.json",
}
```
or

```json
{
  "providor": "openai",
  "model": "gpt-4o-mini",
  "output": "string",

  "url": "some-public-url-with-json-config",
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

llm-exe Lambda empowers you to integrate advanced LLM capabilities with your AWS infrastructure in a straightforward and flexible manner. With complete control over your prompt configurations and cloud resources, you can design powerful and scalable LLM-driven workflows.

For further technical details on the underlying llm-exe package and advanced usage instructions, check out [llm-exe](https://llm-exe.com/).

---

### Updating SSM Secrets
The secrets for `OPEN_AI_API_KEY` and `ANTHROPIC_API_KEY` are synced to SSM when you bootstrap. If at any time you want to update the secret keys stored in SSM, you are able to by using the update-secrets command.
1. Update the values in the .env file
2. Run `npm run update-secrets`

### Help

**Message**: Need to perform AWS calls for account XXXXXXX, but no credentials have been configured
**Solution**: You are not authenticated with AWS.
