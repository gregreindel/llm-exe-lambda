import { LlmExeRouterConfigRoute } from "@/types";
import { guessSchemaFromMessage } from "./guessSchemaFromMessage";

export function schemaEndpointFromRoute(route: LlmExeRouterConfigRoute) {
  const method = "post";
  const summary = route?.summary || "";

  const description = route?.description || "";
  const operationId = route?.operationId || "";

  const requestBody: Record<string, any> = {
    required: true,
    content: {
      /** we'll figure this out and set below */
      "text/plain": { schema: { type: "string" } },
    },
  };

  /**
   * Set input schema
   */
  if (route.inputSchema) {
    // set based on defined input schema
    requestBody.content = {
      "application/json": {
        schema: route.inputSchema,
      },
    };
  } else {
    if (route.message) {
      // guess from message
      const inputSchema = guessSchemaFromMessage(route.message);
      requestBody.content = {
        "application/json": {
          schema: inputSchema,
        },
      };
    }
  }

  const responses: Record<string, any> = {
    "200": {
      description: "Success",
      content: {
        /** we'll figure this out and set below */
        "text/plain": { schema: { type: "string" } },
      },
    },
  };

  /**
   * Set output schema
   */
  if (route.schema) {
    responses["200"].content = {
      "application/json": { schema: route.schema },
    };
  } else {
    // its a string
    responses["200"].content = {
      "text/plain": { schema: { type: "string" } },
    };
  }

  return {
    [method]: {
      operationId: operationId,
      summary: summary,
      description: description,
      requestBody: requestBody,
      responses: responses,
    },
  };
}
