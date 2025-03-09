import { convertNameTypeValueArrayToObject } from "@/utils/convertNameTypeValueArrayToObject";

export function getBedrockAgentPayload(event: Record<string, any>) {
  if (event.requestBody.content["application/json"]) {
    return convertNameTypeValueArrayToObject(
      event.requestBody.content["application/json"].properties
    );
  }
  // @TODO need to add others?
  return {};
}
