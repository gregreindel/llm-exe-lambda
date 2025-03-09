import { LlmExeRouterConfigRoute } from "@/types";
import { guessSchemaFromMessage } from "./guessSchemaFromMessage";
import { guessSchemaFromData } from "./guessSchemaFromData";
import { deepMergeSchema } from "./deepMergeSchema";

export function schemaEndpointFromRoute(
  path: string,
  route: LlmExeRouterConfigRoute
) {
  const method = "post";
  // use path as summary and description if not defined
  const summary = route?.summary || `${path}`;
  const description = route?.description || `${method.toUpperCase()} ${path}`;

  // use path as operationId if not defined
  const operationId =
    route?.operationId || `${path.replace(/\//g, "_")}_${method}`;

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
    // if theres data or a message, we can try to guess the schema
    if (route?.data || route?.message) {
      // guess based off data
      const inputSchemaFromData = route?.data
        ? guessSchemaFromData(route?.data)
        : {};
      // guess based off message
      const inputSchemaFromMessage = route?.message
        ? guessSchemaFromMessage(route?.message)
        : {};
      if (
        Object.keys(inputSchemaFromData).length > 0 ||
        Object.keys(inputSchemaFromMessage).length > 0
      ) {
        // merge them
        const schema = deepMergeSchema(
          inputSchemaFromMessage,
          inputSchemaFromData
        );

        requestBody.content = {
          "application/json": {
            schema,
          },
        };
      }
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
