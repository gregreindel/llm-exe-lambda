import { LlmExeHandlerInput } from "@/types";
import { getS3ObjectAsJsonWithLocal } from "@/utils/getS3ObjectAsJsonWithLocal";

export async function getLlmExeHandlerInput(
  event: Record<string, any>
): Promise<Record<string, any>> {
  const defaults = {
    output: "string",
  };

  if ("key" in event) {
    const name = `${event.key}.${
      event.version ? event.version : "latest"
    }.json`;
    const loaded = await getS3ObjectAsJsonWithLocal<LlmExeHandlerInput>(name);
    return Object.assign({}, defaults, loaded);
  } else {
    return Object.assign({}, defaults, event);
  }
}
