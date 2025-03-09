import { LlmExeHandlerConfig, LlmExeHandlerInput } from "@/types";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getInputPath } from "./utils/getInputPath";
import { LlmExeHandler } from "./use-llm-exe";
import { getLlmExeRouterHandlerInput } from "./utils/getLlmExeRouterHandlerInput";
import { sfnClientStartSyncExecution } from "@/clients/sfn";
import { lambdaClientInvoke } from "@/clients/lambda";
import { unLeadingSlashIt } from "@/utils/slashes";
import { schemaFromRoutes } from "@/utils/schemaFromEndpoint";

export async function LlmExeRouterHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  try {
    const path = getInputPath(event);

    if (!path) {
      throw new Error("Path not found");
    }

    const payload = getInputPayload(event);

    const input = await getLlmExeRouterHandlerInput(payload);

    if (path === "/schema.json") {
      const schema = await schemaFromRoutes(
        Object.assign({}, input.data, { routes: input.routes })
      );
      return getOutputPayload(event, schema);
    }

    const route = input?.routes?.[unLeadingSlashIt(path)];

    if (!route || typeof route !== "object") {
      throw new Error(`Route not found: (${path})`);
    }

    if (route?.handler?.startsWith("arn:aws:lambda")) {
      const lambdaResponse = await lambdaClientInvoke({
        FunctionName: route.handler,
        Payload: JSON.stringify(input.data),
      });
      return getOutputPayload(event, lambdaResponse);
    } else if (route?.handler?.startsWith("arn:aws:states")) {
      const sfnResponse = await sfnClientStartSyncExecution({
        stateMachineArn: route.handler,
        input: JSON.stringify(input.data),
      });
      return getOutputPayload(event, sfnResponse);
    }

    const response = await LlmExeHandler(Object.assign({}, route, input.data));

    return getOutputPayload(event, response);
  } catch (error) {
    return getOutputPayload(event, error);
  }
}
