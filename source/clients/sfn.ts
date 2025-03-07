import {
  SFNClient,
  StartSyncExecutionCommand,
  StartSyncExecutionCommandInput,
} from "@aws-sdk/client-sfn";

const { DEPLOY_REGION } = process.env;

export const sfnClient = new SFNClient({
  region: DEPLOY_REGION,
});

export async function sfnClientStartSyncExecution(
  params: StartSyncExecutionCommandInput
) {
  const { output = "{}" } = await sfnClient.send(
    new StartSyncExecutionCommand(params)
  );
  return JSON.parse(output);
}
