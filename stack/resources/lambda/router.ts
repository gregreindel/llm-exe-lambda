import * as path from "path";
import * as kms from "aws-cdk-lib/aws-kms";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  Runtime,
  HttpMethod,
  FunctionUrl,
  FunctionUrlAuthType,
  ParamsAndSecretsLayerVersion,
  ParamsAndSecretsVersions,
} from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";

export class LambdaUseLlmExeRouter extends Construct {
  public readonly handler: NodejsFunction;
  constructor(scope: Construct, id: string, args: { llmExeStorageBucket: Bucket }) {
    super(scope, id);

    const AppName = this.node.tryGetContext("AppName");

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    this.handler = new NodejsFunction(this, "LlmExeRouter", {
      functionName: `${AppName}-LlmExeRouter`,
      description: `[Lambda] Use llm-exe router`,
      entry: path.join(
        __dirname,
        "../../../source/handlers/lambda/router.handler.ts"
      ),
      memorySize: 512,
      runtime: Runtime.NODEJS_LATEST,
      paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
        ParamsAndSecretsVersions.V1_0_103
      ),
      environment: {
        NODE_ENV: this.node.tryGetContext("environment"),
        STACK_NAME: this.node.tryGetContext("AppName"),
      },
      timeout: Duration.seconds(30),
    });

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${region}:${account}:parameter/${AppName}/*`],
      })
    );

    this.handler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["kms:Decrypt"],
        resources: [
          kms.Alias.fromAliasName(this, "ssmKms", "alias/aws/ssm").keyArn,
        ],
      })
    );

    // Add bucket permissions
    args.llmExeStorageBucket.grantReadWrite(this.handler);

    // Add bucket name to environment
    this.handler.addEnvironment(
      "AWS_S3_FILES_BUCKET_NAME",
      args.llmExeStorageBucket.bucketName
    );

    const allowedBedrockModels = this.node.tryGetContext(
      "allowedBedrockModels"
    );

    if (allowedBedrockModels && allowedBedrockModels.length > 0) {
      this.handler.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["bedrock:InvokeModel"],
          resources: allowedBedrockModels,
        })
      );
    }

    const endpointAllowedOrigins = this.node.tryGetContext(
      "endpointAllowedOrigins"
    );

    const lambdaUrl = new FunctionUrl(this, "Url", {
      function: this.handler,
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: endpointAllowedOrigins || [],
        allowedHeaders: ["*"],
        allowedMethods: [HttpMethod.POST],
      },
    });

    new CfnOutput(this, "FunctionUrl", {
      value: lambdaUrl.url,
    });
  }
}
