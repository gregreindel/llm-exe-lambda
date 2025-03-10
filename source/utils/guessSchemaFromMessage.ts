import { guessSchemaAttributesFromMessage } from "./guessSchemaAttributesFromMessage";
import { inputTextPrompt } from "./inputTextPrompt";
import { makeObjectSchemaFromAttributeNames } from "./makeObjectSchemaFromAttributeNames";

export function guessSchemaFromMessage(
  message: Parameters<typeof inputTextPrompt>[0]
) {
  const attributes = guessSchemaAttributesFromMessage(message);
  return makeObjectSchemaFromAttributeNames(attributes);
}
