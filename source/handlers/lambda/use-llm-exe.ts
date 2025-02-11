import { LlmExeHandlerConfig, LlmExeHandlerInput } from "@/types";
import { inputTextOutputJson } from "@/utils/inputTextOutputJson";
import { inputTextOutputString } from "@/utils/inputTextOutputString";
import { inputTextOutputStringList } from "@/utils/inputTextOutputStringList";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getLlmExeHandlerInput } from "./utils/getLlmExeHandlerInput";
import { isInputValid } from "./utils/assertPayloadIsValid";

export async function LlmExeHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  try {
    const payload = getInputPayload(event);
    const input = await getLlmExeHandlerInput(payload);

    if (isInputValid(input)) {
      let response;
      const { schema = {} } = input;

      const providor = `${input.providor}.chat.v1`;

      if (input.output === "json") {
        response = await inputTextOutputJson(input.message, {
          providor,
          model: input.model,
          data: input.data,
          schema: schema,
          debug: !!input?.data?.debug,
        });
      } else if (input.output === "list") {
        response = await inputTextOutputStringList(input.message, {
          providor,
          model: input.model,
          data: input.data,
          debug: !!input?.data?.debug,
        });
      } else {
        response = await inputTextOutputString(input.message, {
          providor,
          model: input.model,
          data: input.data,
          debug: !!input?.data?.debug,
        });
      }

      return getOutputPayload(event, response);
    }

    throw new Error("Invalid input");
  } catch (error) {
    return getOutputPayload(event, error);
  }
}
