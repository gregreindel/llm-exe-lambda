import { LlmExeHandlerInput } from "@/types";
import { assertMessageIsValid } from "./assertMessageIsValid";

export function isInputValid(event: any): event is LlmExeHandlerInput {
  if (!event) {
    throw new Error("Invalid event");
  }

  if (!event.message) {
    throw new Error("Invalid message");
  }

  assertMessageIsValid(event.message);

  if (!event.model) {
    throw new Error("Invalid model");
  }

  if (
    !event.providor ||
    !["openai", "anthropic", "amazon:anthropic", "amazon:meta"].includes(
      event.providor
    )
  ) {
    throw new Error("Invalid providor type");
  }

  if (!event.output) {
    throw new Error("Invalid output type");
  }

  if (event.output === "json") {
    if (!event.schema) {
      throw new Error("Output type of json requires schema");
    }
  }
  return true;
}
