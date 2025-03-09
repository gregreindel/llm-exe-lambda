import { isInputValid } from "@/handlers/lambda/utils/assertPayloadIsValid";
import { getLlmExeHandlerInput } from "@/handlers/lambda/utils/getLlmExeHandlerInput";
import { LlmExeRouterConfig } from "@/types";
import { mergeInputsInOrder } from "./mergeInputsInOrder";
import { schemaEndpointFromRoute } from "./schemaEndpointFromRoute";

export async function schemaFromRoutes(config: LlmExeRouterConfig) {
  const base: Record<string, any> = {
    openapi: "3.0.0",
    info: {
      title: config.title || "LlmExe Tools API",
      version: config.version || "1.0.0",
      description: config.description || "LlmExe Tools API",
    },
    paths: {},
  };

  const routes = Object.keys(config.routes);
  for (const path of routes) {
    const route = config.routes[path];
    if (route) {
      if (route.handler) {
        // if a handler, we will depend on the config to provide the schema
        // maybe should warn or error here if that is not defined?
        base.paths[path] = schemaEndpointFromRoute(
          path,
          mergeInputsInOrder(route, {})
        );
      } else {
        const input = await getLlmExeHandlerInput(route);
        if (!isInputValid(input)) {
          console.warn("Warning: input not valid", input);
        } else {
          base.paths[path] = schemaEndpointFromRoute(
            path,
            mergeInputsInOrder(route, input)
          );
        }
      }
    }
  }
  return base;
}
