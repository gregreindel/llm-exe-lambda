[![Coverage Status](https://coveralls.io/repos/github/gregreindel/llm-exe-lambda/badge.svg?branch=main)](https://coveralls.io/github/gregreindel/llm-exe-lambda?branch=main)

# llm-exe Lambda: AWS CDK Integration

## Overview

llm-exe Lambda is a purpose‐built AWS CDK stack that acts as a wrapper around the [llm-exe](https://llm-exe.com/) package. It simplifies the integration and orchestration of LLM calls by deploying a Lambda function within your AWS environment. This deployment can be integrated into your workflows – such as AWS Step Functions, API Gateway, SQS – or used as a standalone service to trigger LLM requests with minimal overhead.

**Key Features:**

- Seamless deployment of Lambda, and associated resources using AWS CDK.
- Utilizes best practices to store secrets in SSM
- Reference complex prompts from direct input, S3 bucket, or public url.

**Take advantage of llm-exe core features such as:**

- Supports both text-based LLM prompts (llama‑3) and chat-based interactions (gpt‑4o, claude‑3.5).
- Provides comprehensive prompt templating with handlebars and enables LLMs to call functions or chain executors.

### Getting Started

To deploy and use llm-exe Lambda, ensure you have the following installed and properly configured:

- AWS CLI – must be installed and configured with appropriate permissions.
- Node.js – any LTS version is recommended.
- AWS Account – you will need your AWS account ID, region, and deployment profile details.

**Setup + Deploy Steps**

1. [AWS Account Setup](#1-aws-account-setup)
   1. [Create CDK Permission Boundary Policy](#create-cdk-permission-boundary-policy)
   2. [Create CDK Deploy Policy & User](#create-cdk-deploy-policy---user)
   3. [Configure AWS CLI with the new permissions](#configure-aws-cli-with-the-new-permissions)
   4. [Test CLI](#test-cli)
2. [Clone this repo](#2-clone-repo-and-setup)
3. [Deploy the stack into your AWS account](#3-deploy-the-stack-into-your-aws-account)
   1. [Setup .env File](#setup-env-file)
   2. [Bootstrap & Deploy Process](#deployment-process)
4. [Using llm-exe Lambda](#4-using-llm-exe-lambda)
   - [Usage Examples](#usage-examples)
   - [Updating SSM Secrets](#updating-ssm-secrets)
   - [Help](#help)

## 1. AWS Account Setup

You need to have a user or role configured to be able to deploy CDK stacks using the AWS CLI. If you already know what to do here, you can skip ahead.

Note: There are other ways to configure AWS CLI. The instructions below are one of many reasonable options. [See the AWS CLI Docs](https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html)

### Create CDK Permission Boundary Policy

A CDK permission boundary is a mechanism in AWS that allows you to set a custom permission boundary for IAM roles created or updated by the AWS Cloud Development Kit, ensuring roles do not exceed certain privileges. You will create a special policy that you use to deploy this stack. [See the AWS CDK Docs to learn more](https://docs.aws.amazon.com/cdk/v2/guide/customize-permissions-boundaries.html)

1. Navigate to IAM. Select Policies, and click to create a new policy.
2. Paste in the contents from [`documentation/setup/LlmExeLambdaCdkPermissionBoundaryPolicy.json`](https://github.com/gregreindel/llm-exe-lambda/blob/main/documentation/setup/LlmExeLambdaCdkPermissionBoundaryPolicy.json)
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `LlmExeLambdaCdkPermissionBoundaryPolicy`.
4. Click the Create Policy button to create the new policy.

### Create CDK Deploy Policy & User

Next, you need to create the user (and associated policy) that is used to deploy the actual stack. After creating this user, you'll generate access keys that you'll use on your machine when deploying.

##### Create Policy

1. Navigate to IAM. Select policies, and click to create a new policy.
2. Paste in the contents from [`documentation/setup/DeployLlmExeCdkAppPolicy.json`](https://github.com/gregreindel/llm-exe-lambda/blob/main/documentation/setup/DeployLlmExeCdkAppPolicy.json) into the JSON policy input.
   - Replace `YOUR_AWS_DEPLOY_REGION` with your region. For example: `us-west-2`
   - Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID. For example: 000000000000
3. Name the new policy: `DeployLlmExeCdkAppPolicy`.
4. Click the Create Policy button to create the new policy.

##### Create User

1. Create a new User.
   - Name the user `LlmExeLambdaCdkDeployUser`
   - Do not check the box allowing the user console access. It is not needed.
   - When asked to set permissions, select the `Attach policies directly` option, and then select the `DeployLlmExeCdkAppPolicy` policy you just created. (can be helpful to sort the table by "Type", you'll notice the 'customer managed' policy.)
   - Click create user to add the new user
2. Click on the newly created user and click on the security credentials tab
   - Click create access key
   - Access key best practices & alternatives - select "Other"
   - Provide a description, such as "Key used to deploy CDK"
   - Copy the Access key and Secret access key, you'll need them next.

### Configure AWS CLI with the new permissions

Finally, configure the new user with the AWS CLI on your machine.

On your computer, run the following command to configure the AWS CLI with the new credentials:

```bash
aws configure --profile llm-exe-lambda
```

- It will ask for the access key you just created. `AWS Access Key ID [None]:`. Paste in your access key (starts with AKI). Hit enter.
- It will ask for the access key you just created. `AWS Secret Access Key [None]: `. Paste in your secret access key (the other one). Hit enter.
- It will ask for the default region. `Default region name [None]:` If you want to use a specific region, use that, otherwise set as us-west-2.
- It will ask for `Default output format [None]` - hit enter to keep the value at "None".

### Test The AWS CLI

Run the following command to make sure the CLI is configured properly:

```bash
aws sts get-caller-identity --profile llm-exe-lambda
```

You should see a response like:

```json
{
  "UserId": "YOUR_ACCESS_KEY_ID",
  "Account": "YOUR_ACCOUNT_ID",
  "Arn": "arn:aws:iam::YOUR_ACCOUNT_ID:user/LlmExeLambdaCdkDeployUser"
}
```

## 2. Clone Repo and Setup

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
| DEPLOY_PROFILE    | required | The AWS CLI profile to use for deployment. (llm-exe-lambda)                 |
| OPEN_AI_API_KEY   | optional | Your OpenAI API key.                                                        |
| ANTHROPIC_API_KEY | optional | Your Anthropic API key.                                                     |
| XAI_API_KEY       | optional | Your xAI API key.                                                           |

## 3. Deploy the stack into your AWS account

Once you have the user and policies created in your account, and the AWS ALI configured, you can deploy the stack.
|

### Deployment Process

Follow these steps to set up and deploy the CDK stack:

##### 1. **Bootstrap your AWS environment:**

Execute the following command to initialize the environment with necessary CDK assets:

```bash
npm run bootstrap
```

You should see the output ` ✅  Environment aws://YOUR_ACCOUNT_ID/YOUR_REGION bootstrapped.`.

Note: You should only need to run bootstrap once. If in the future you want to update the stack, you do not need to rnu bootstrap again.

##### 2. **Deploy the stack:**

Deploy your CDK stack to AWS by running:

```bash
npm run deploy
```

You will be asked to confirm the change before the resources are deployed into your account. Confirm with y.

The terminal will indicate once the deploy is completed. Once complete, the Lambda function and related resources will be available in your AWS account. You can visit CloudFormation to see the stack you deployed, and the associated resources.

If you enabled `endpointEnabled` in cdk.json, the output will include your function's execution url. See using llm-exe-lambda for information on how to invoke the function.

```
✅  LlmExeLambda

✨  Deployment time: 68.74s

Outputs:
LlmExeLambda.LambdaUseLlmExeFunctionUrlUUID = https://some-random-url.lambda-url.us-west-2.on.aws/
```

Once deployed, the generated Lambda can be directly invoked via the function url or incorporated into more complex workflows like AWS Step Functions, SQS, etc.

## 4. Using llm-exe Lambda

You can invoke you model using the config payload outlined below or by referencing a config hosted in an S3 bucket or via a public url.

### Configuration Options

| Variable | Required | Description                                                                                                  |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| provider | required | One of the available providers - openai , anthropic , amazon:anthropic , amazon:meta , xai                   |
| model    | required | A valid model                                                                                                |
| output   | optional | string, json, list                                                                                           |
| schema   | optional | When using output of 'json' - schema is required to define the expected return value                         |
| data     | optional | the data object is used to pass data to the message. These properties are available to you inside the prompt |
| message  | required | This is the prompt                                                                                           |

- Direct Input
- Hosted Input JSON (via S3 or url)
- Hosted Markdown (via S3 or url)

### Direct Input

Your llm-exe-configuration JSON must validate against the following schema:

```json
{
  "type": "object",
  "properties": {
    "provider": {
      "type": "string",
      "enum": ["openai", "anthropic", "amazon:anthropic", "amazon:meta", "xai"],
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
      "description": "This is the prompt",
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
                "enum": ["system", "user", "assistant"]
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
  "required": ["provider", "model", "message"]
}
```


### URL Input

You can store config files in S3, or via any url. This can help with complex schemas. The hosted configuration files can be JSON or markdown.

When you deploy the llm-exe-lambda stack, an S3 bucket with the right permissions allowing you to securely and privately store your prompts in that bucket. You can store the configs in any bucket as long as you give the lambda permission to access it.


```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "this is the url to the raw file"
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
  "provider": "openai",
  "model": "gpt-4o-mini",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}'
```

Note: Replace YOUR_FUNCTION_URL with your actual function's url.

#### Example Payloads

##### Config-Based

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "output": "string",
  "message": "Talk like a kitten. Hello!"
}
```

**S3-Based**

```json
{
  "url": "s3://bucket-name/key-of-file.json"
}
```

or

**Public URL-Based**

```json
{
  "url": "https://raw.githubusercontent.com/gregreindel/llm-exe-lambda/refs/heads/main/documentation/examples/url/basic-chat-with-data.md"
}
```

Example 2: Anthropic Provider using a Structured Chat Message

```json
{
  "provider": "anthropic",
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
  "provider": "openai",
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

The secrets for `OPEN_AI_API_KEY` and `ANTHROPIC_API_KEY` and `XAI_API_KEY` are synced from your .env file to SSM when you bootstrap. If at any time you want to update the secret keys stored in SSM, you are able to by using the update-secrets command.

To update the secrets in SSM:

1. Update the values in the .env file
2. Run `npm run update-secrets`

### Help

**Message**: Need to perform AWS calls for account XXXXXXX, but no credentials have been configured
**Solution**: You are not authenticated with AWS.
