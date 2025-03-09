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
  try {
    const response = await sfnClient.send(
      new StartSyncExecutionCommand(params)
    );
    return JSON.parse(response.output || "{}");
  } catch (error) {
    throw error;
  }
}
