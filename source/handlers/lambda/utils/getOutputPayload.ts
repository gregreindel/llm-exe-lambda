import { lambdaEventType } from "@/utils/lambdaEventType";

export function getOutputPayload(event: Record<string, any>, response: any) {
  const type = lambdaEventType(event);

  switch (type) {
    case "api-gateway":
    case "lambda-url":
      if (response instanceof Error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: response.message }),
        };
      }

      if (!response) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Unknown error" }),
        };
      }

      return {
        statusCode: 200,
        body:
          typeof response === "string" ? response : JSON.stringify(response),
      };
    case "bedrock-agent": {
      if (response instanceof Error) {
        return {
          // here 
          actionGroup: event["actionGroup"],
          apiPath: event["apiPath"],
          httpMethod: event["httpMethod"],
          httpStatusCode: 500,
          responseBody: {
            "application/json": {
              body: JSON.stringify({ error: response.message }),
            },
          },
        };
      }

      if (!response) {
        return {
          actionGroup: event["actionGroup"],
          apiPath: event["apiPath"],
          httpMethod: event["httpMethod"],
          httpStatusCode: 500,
          responseBody: {
            "application/json": {
              body: JSON.stringify({ error: "Unknown error" }),
            },
          },
        };
      }

      return {
        messageVersion: "1.0",
        response: {
          actionGroup: event["actionGroup"],
          apiPath: event["apiPath"],
          httpMethod: event["httpMethod"],
          httpStatusCode: 200,
          responseBody: {
            "text/plain": {
              body:
                typeof response === "string"
                  ? response
                  : JSON.stringify(response),
            },
          },
        },
        sessionAttributes: event["sessionAttributes"],
        promptSessionAttributes: event["promptSessionAttributes"],
      };
    }
    // if function was called naturally - e.g. not via aws service
    default:
      if (response instanceof Error) {
        throw response;
      }
      return response;
  }
}
