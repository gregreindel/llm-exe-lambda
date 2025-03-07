import { LlmExeHandlerConfig, LlmExeHandlerInput } from "@/types";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getInputPath } from "./utils/getInputPath";
import { LlmExeHandler } from "./use-llm-exe";
import { getLlmExeRouterHandlerInput } from "./utils/getLlmExeRouterHandlerInput";
import { sfnClientStartSyncExecution } from "@/clients/sfn";
import { lambdaClientInvoke } from "@/clients/lambda";
import { unLeadingSlashIt } from "@/utils/slashes";

export async function LlmExeRouterHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  try {
    const payload = getInputPayload(event);
    const input = await getLlmExeRouterHandlerInput(payload);

    const path = getInputPath(event);
    const route = input?.routes?.[unLeadingSlashIt(path)];

    if (!route || typeof route !== "object") {
      throw new Error(`Route not found`);
    }

    if (route?.handler?.startsWith("arn:aws:lambda")) {
      return lambdaClientInvoke({
        FunctionName: route.handler,
        Payload: JSON.stringify(input.data),
      });
    } 
    else if (route?.handler?.startsWith("arn:aws:states")) {
      return sfnClientStartSyncExecution({
        stateMachineArn: route.handler,
        input: JSON.stringify(input.data),
      });
    }

    return LlmExeHandler(Object.assign({}, route, { data: input.data }));
  } catch (error) {
    return getOutputPayload(event, error);
  }
}
