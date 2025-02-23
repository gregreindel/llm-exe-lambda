import { withKey } from "@/clients/keychain";
import { useLlm } from "llm-exe";

export async function getKeyObjectFromProvider(
  provider: Parameters<typeof useLlm>[0]
) {
  if (provider.startsWith("openai")) {
    const openAiApiKey = await withKey("KeyOpenAI");
    if (!openAiApiKey) {
      throw new Error("OpenAI API Key not found");
    }
    return { openAiApiKey };
  }

  if (provider.startsWith("anthropic")) {
    const anthropicApiKey = await withKey("KeyAnthropic");
    if (!anthropicApiKey) {
      throw new Error("Anthropic API Key not found");
    }
    return { anthropicApiKey };
  }

  if (provider.startsWith("xai")) {
    const xAiApiKey = await withKey("KeyXAI");
    if (!xAiApiKey) {
      throw new Error("xAI API Key not found");
    }
    return { xAiApiKey };
  }

  return {};
}