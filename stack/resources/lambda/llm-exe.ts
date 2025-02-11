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

const snakeCase = require('lodash.snakecase');
const { version } = require("../../../package.json");

export class LambdaUseLlmExe extends Construct {
  public readonly handler: NodejsFunction;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const AppName = this.node.tryGetContext("AppName");

    const region = Stack.of(this).region;
    const account = Stack.of(this).account;

    this.handler = new NodejsFunction(this, "LlmExeHandler", {
      functionName: `${AppName}-LlmExeHandler-v_${snakeCase(version)}`,
      description: `[Lambda] Use llm-exe helper (v${version})`,
      entry: path.join(
        __dirname,
        "../../../source/handlers/lambda/use-llm-exe.handler.ts"
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

    const endpointEnabled = this.node.tryGetContext("endpointEnabled");
    if (!!endpointEnabled) {
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
}
