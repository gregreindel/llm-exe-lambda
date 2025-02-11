import { withKey } from "@/clients/keychain";
import { useLlm } from "llm-exe";

export async function getKeyObjectFromProvidor(
    providor: Parameters<typeof useLlm>[0]
  ) {
    if (providor.startsWith("openai")) {
      const openAiApiKey = await withKey("KeyOpenAI");
      if (!openAiApiKey) {
        throw new Error("OpenAI API Key not found");
      }
      return { openAiApiKey };
    }
  
    if (providor.startsWith("anthropic")) {
      const anthropicApiKey = await withKey("KeyAnthropic");
      if (!anthropicApiKey) {
        throw new Error("Anthropic API Key not found");
      }
      return { anthropicApiKey };
    }
  
    return {};
  }