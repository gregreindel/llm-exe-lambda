import { parsePromptForTokens } from "./parsePromptForTokens";
import { inputTextPrompt } from "./inputTextPrompt";


export function guessSchemaAttributesFromMessage(
  message: Parameters<typeof inputTextPrompt>[0]
) {
  const prompt = inputTextPrompt(message);
  const attributes: string[] = [];

  if (!prompt.messages || !Array.isArray(prompt.messages)) {
    throw new Error("Invalid prompt.messages: expected an array");
  }

  for (const msg of prompt.messages) {
    if (msg && msg.content && typeof msg.content === "string") {
      const tokens = parsePromptForTokens(msg.content);
      if (tokens.length > 0) {
        attributes.push(...tokens);
      }
    }
  }

  return attributes;
}