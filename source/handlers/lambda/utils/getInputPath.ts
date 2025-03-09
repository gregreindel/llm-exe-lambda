import { lambdaEventType } from "@/utils/lambdaEventType";

/**
 * Returns a normalized request path from an event object coming from different sources.
 *
 * The function evaluates the type of the Lambda event using the helper lambdaEventType,
 * and then extracts the appropriate path based on the event type:
 *  - For API Gateway: it returns event.path if it's a valid string.
 *  - For Lambda URL: it returns event.rawPath if it's a valid string.
 *  - For Bedrock events: it looks inside the nested agent object and returns agent.path if valid.
 * If none of the supported types match or if the expected value isn't a valid string,
 * an empty string is returned.
 *
 * @param event - The original event payload received by Lambda. Its structure may vary depending on the source.
 * @returns A normalized request path as a string, or an empty string if no valid path is found.
 */
export function getInputPath(event: Record<string, any>): string {
  // Determine event type via helper function; this abstracts the specifics of event schema detection.
  const type = lambdaEventType(event);
  switch (type) {
    case "api-gateway":
      // Check if event.path exists and is a string; return it, otherwise fallback to an empty string.
      return typeof event.path === "string" ? event.path : "";
    case "lambda-url":
      // For Lambda URL events, check the rawPath property.
      return typeof event.rawPath === "string" ? event.rawPath : "";
    case "bedrock-agent":
      // For Bedrock events, ensure that the nested agent object exists and its path property is a string.
      return event.apiPath && typeof event.apiPath === "string"
        ? event.apiPath
        : "";
    default:
      // For any unrecognized event type, return an empty string.
      return "";
  }
}
