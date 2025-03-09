import { LlmExeHandlerConfig, LlmExeHandlerInput } from "@/types";
import { inputTextOutputJson } from "@/utils/inputTextOutputJson";
import { inputTextOutputString } from "@/utils/inputTextOutputString";
import { inputTextOutputStringList } from "@/utils/inputTextOutputStringList";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getLlmExeHandlerInput } from "./utils/getLlmExeHandlerInput";
import { isInputValid } from "./utils/assertPayloadIsValid";
import { debug } from "./utils/debug";

export async function LlmExeHandler(
  event: LlmExeHandlerInput | LlmExeHandlerConfig
) {
  debug("LlmExeHandler", { event });

  try {
    const payload = getInputPayload(event);
    debug("LlmExeHandler", { payload });

    const input = await getLlmExeHandlerInput(payload);
    debug("LlmExeHandler", { input });

    if (!isInputValid(input)) {
      throw new Error("Invalid input");
    }

    let response;
    const { schema = {} } = input;
    const provider = `${input.provider}.chat.v1`;
    debug("LlmExeHandler", { provider });

    if (input.output === "json") {
      response = await inputTextOutputJson(input.message, {
        provider,
        model: input.model,
        data: input.data,
        schema: schema,
        debug: !!input?.data?.debug,
      });
    } else if (input.output === "list") {
      response = await inputTextOutputStringList(input.message, {
        provider,
        model: input.model,
        data: input.data,
        debug: !!input?.data?.debug,
      });
    } else {
      response = await inputTextOutputString(input.message, {
        provider,
        model: input.model,
        data: input.data,
        debug: !!input?.data?.debug,
      });
    }

    debug("LlmExeHandler", { response });
    return getOutputPayload(event, response);
  } catch (error) {
    return getOutputPayload(event, error);
  }
}
