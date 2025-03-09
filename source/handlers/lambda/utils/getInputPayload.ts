import { lambdaEventType } from "@/utils/lambdaEventType";
import { getBedrockAgentPayload } from "./getBedrockAgentPayload";

/**
 * Normalizes the event object to a standard format regardless of the source.
 * @param event - The original event payload received by Lambda.
 * @returns A normalized event object.
 */
export function getInputPayload(
  event: Record<string, any>
): Record<string, any> {
  const type = lambdaEventType(event);
  switch (type) {
    case "api-gateway":
      return JSON.parse(event.body);
    case "s3":
      return event.Records[0].s3;
    case "sns":
      return event.Records[0].Sns.Message;
    case "sqs":
      return event.Records[0].body;
    case "bedrock-agent":
      return {
        data: {
          ...getBedrockAgentPayload(event),
          inputText: event.inputText || "",
          sessionAttributes: event.sessionAttributes || {},
          promptSessionAttributes: event.promptSessionAttributes || {},
        },
      };
    case "lambda-url":
      return JSON.parse(event.body);
    default:
      return event;
  }
}
