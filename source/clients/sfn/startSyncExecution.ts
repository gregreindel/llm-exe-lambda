import {
  StartSyncExecutionCommand,
  StartSyncExecutionCommandInput,
} from "@aws-sdk/client-sfn";
import { sfnClient } from "./client";
import { debug } from "@/handlers/lambda/utils/debug";

export async function startSyncExecution(
  params: StartSyncExecutionCommandInput
) {
  debug("StartSyncExecutionCommand", { params });
  try {
    const response = await sfnClient.send(
      new StartSyncExecutionCommand(params)
    );
    return JSON.parse(response.output || "{}");
  } catch (error) {
    throw error;
  }
}
