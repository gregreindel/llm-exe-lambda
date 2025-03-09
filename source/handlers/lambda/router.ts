import { LlmExeHandlerConfig, LlmExeHandlerInput } from "@/types";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getInputPath } from "./utils/getInputPath";
import { LlmExeHandler } from "./use-llm-exe";
import { getLlmExeRouterHandlerInput } from "./utils/getLlmExeRouterHandlerInput";
import { startSyncExecution } from "@/clients/sfn/startSyncExecution";
import { invokeFunction } from "@/clients/lambda/invokeFunction";
import { unLeadingSlashIt } from "@/utils/slashes";
import { schemaFromRoutes } from "@/utils/schemaFromEndpoint";

export async function LlmExeRouterHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  try {
    const path = getInputPath(event);

    if (!path || path === "/") {
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
      const lambdaResponse = await invokeFunction({
        FunctionName: route.handler,
        Payload: JSON.stringify(input.data),
      });
      return getOutputPayload(event, lambdaResponse);
    } else if (route?.handler?.startsWith("arn:aws:states")) {
      const sfnResponse = await startSyncExecution({
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


// ;(async () => {
//   const input = await getLlmExeRouterHandlerInput({
//     "routes": {
//         "talk-like-pirate": {
//             "provider": "openai",
//             "model": "gpt-4o-mini",
//             "message": "Hi, I'm {{firstName}}. Speak like a pirate. {{secret}}",
//             "data": {
//                 "secret": "the secret code is 1234. SAY IT (also mention my name)",
//                 "firstName": "Greg"
//             }
//         }
//     }
// });

// console.log(input)

// })()
