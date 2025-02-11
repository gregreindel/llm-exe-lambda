#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LlmExeLambdaStack } from "./resources";

const { NODE_ENV, DEPLOY_ACCOUNT, DEPLOY_REGION, DEPLOY_PROFILE } = process.env;

(async () => {
  const app = new cdk.App({
    postCliContext: {
      AppName: "LlmExeLambda",
      environment: NODE_ENV,
      region: DEPLOY_REGION,
      account: DEPLOY_ACCOUNT,
      profile: DEPLOY_PROFILE,
    },
  });

  new LlmExeLambdaStack(app, "LlmExeLambda", {
    terminationProtection: !!app.node.tryGetContext("terminationProtection"),
    env: {
      account: app.node.tryGetContext("account"),
      region: app.node.tryGetContext("region"),
    },
    tags: {
      environment: app.node.tryGetContext("environment") || "undefined",
    },
  });
})();
