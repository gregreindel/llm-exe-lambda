import { LlmExeHandlerInput } from "@/types";
import { getContentFromUrlAsJson } from "@/utils/getContentFromUrl";
import { getS3ObjectAsJsonWithLocal } from "@/utils/getS3ObjectAsJsonWithLocal";

export async function getLlmExeHandlerInput(
  event: Record<string, any>
): Promise<Record<string, any>> {
  const defaults = {
    output: "string",
  };

  if ("key" in event && "bucket" in event) {
    const { key, bucket, version } = event;
    const loaded = await getS3ObjectAsJsonWithLocal<LlmExeHandlerInput>(
      key,
      bucket,
      version
    );
    return Object.assign({}, defaults, loaded);
  } else if ("url" in event) {
    const { url } = event;
    const loaded = await getContentFromUrlAsJson<LlmExeHandlerInput>(url);
    return Object.assign({}, defaults, loaded);
  } else {
    return Object.assign({}, defaults, event);
  }
}
