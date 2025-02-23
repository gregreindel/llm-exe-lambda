import { getKeyObjectFromProvider } from "@/utils/getKeyObjectFromProvider";
import { useLlm } from "llm-exe";

export async function withLlmExeClient(options: Record<string, any>) {
  const { provider, ...restOfOptions } = options;
  const apiKey = await getKeyObjectFromProvider(options.provider);

  const llm = useLlm(
    provider,
    Object.assign({ timeout: 60000 }, restOfOptions, apiKey)
  );

  return llm;
}
