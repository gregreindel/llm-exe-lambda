import { LambdaClient } from "@aws-sdk/client-lambda";

const { DEPLOY_REGION } = process.env;

export const lambdaClient = new LambdaClient({
  region: DEPLOY_REGION,
});
