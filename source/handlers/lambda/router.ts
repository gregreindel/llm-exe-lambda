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
import { debug } from "./utils/debug";
import { mergeInputsInOrder } from "@/utils/mergeInputsInOrder";

export async function LlmExeRouterHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  try {
    debug("LlmExeRouterHandler", { event });

    const path = getInputPath(event);
    debug("LlmExeRouterHandler", { path });

    if (!path || path === "/") {
      throw new Error("Path not found");
    }

    const payload = getInputPayload(event);
    debug("LlmExeRouterHandler", { payload });

    const input = await getLlmExeRouterHandlerInput(payload);
    debug("LlmExeRouterHandler", { input });

    if (path === "/schema.json") {
      const schema = await schemaFromRoutes(
        Object.assign({}, input.data, { routes: input.routes })
      );
      return getOutputPayload(event, schema);
    }

    const route = input?.routes?.[unLeadingSlashIt(path)];
    debug("LlmExeRouterHandler", { route });

    if (!route || typeof route !== "object") {
      throw new Error(`Route not found: (${path})`);
    }

    if (route?.handler?.startsWith("arn:aws:lambda")) {
      const lambdaResponse = await invokeFunction({
        FunctionName: route.handler,
        Payload: JSON.stringify(mergeInputsInOrder(route, input.data)),
      });
      return getOutputPayload(event, lambdaResponse);
    } else if (route?.handler?.startsWith("arn:aws:states")) {
      const sfnResponse = await startSyncExecution({
        stateMachineArn: route.handler,
        input: JSON.stringify(mergeInputsInOrder(route, input.data)),
      });
      return getOutputPayload(event, sfnResponse);
    }


    const response = await LlmExeHandler(mergeInputsInOrder(route, input.data));

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
