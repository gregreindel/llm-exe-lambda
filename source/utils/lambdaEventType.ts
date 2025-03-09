export function lambdaEventType(event: Record<string, any>) {
  switch (true) {
    case (typeof event === "undefined" || event === null):
      return "unknown";
    case event?.httpMethod !== undefined && event?.path !== undefined:
      return "api-gateway";
    case event?.Records !== undefined &&
      event?.Records[0]?.eventSource === "aws:s3":
      return "s3";
    case event?.Records !== undefined &&
      event?.Records[0].EventSource === "aws:sns":
      return "sns";
    case event.Records !== undefined &&
      event?.Records[0].eventSource === "aws:sqs":
      return "sqs";
    case event.agent !== undefined:
      return "bedrock-agent";
    case (event.version === "2.0" && event?.requestContext?.http !== undefined):
        return "lambda-url";
    default:
      return "unknown";
  }
}