import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { S3Bucket } from "./s3/bucket-prompt";
import { LambdaUseLlmExe } from "./lambda/llm-exe";
import { LambdaUseLlmExeRouter } from "./lambda/router";

import type { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class LlmExeLambdaStack extends Stack {
  public readonly bucket: Bucket;
  public readonly handler: NodejsFunction;
  public readonly router: NodejsFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Define the S3 bucket that can be used for prompts
    this.bucket = new S3Bucket(this, `S3BucketForPrompts`).s3Bucket;
    // Define the Lambda function that will wrap llm-exe
    this.handler = new LambdaUseLlmExe(this, "LambdaUseLlmExe", {
      llmExeStorageBucket: this.bucket,
    }).handler;
    // Define the Lambda function that will can act as a router for llm-exe
    this.router = new LambdaUseLlmExeRouter(this, "LambdaLlmExeRouter", {
      llmExeStorageBucket: this.bucket,
    }).handler;
  }
}
