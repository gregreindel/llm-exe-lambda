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
    case "bedrock":
      return response;
    default:
      if (response instanceof Error) {
        throw response;
      }
      return response;
  }
}
