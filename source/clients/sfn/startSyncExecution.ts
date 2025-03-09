import {
  StartSyncExecutionCommand,
  StartSyncExecutionCommandInput,
} from "@aws-sdk/client-sfn";
import { sfnClient } from "./client";


export async function startSyncExecution(
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
