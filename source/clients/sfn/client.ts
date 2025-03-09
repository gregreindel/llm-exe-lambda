import { SFNClient } from "@aws-sdk/client-sfn";

const { DEPLOY_REGION } = process.env;

export const sfnClient = new SFNClient({
  region: DEPLOY_REGION,
});
