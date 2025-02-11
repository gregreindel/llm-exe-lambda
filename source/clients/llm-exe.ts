import { getKeyObjectFromProvidor } from "@/utils/getKeyObjectFromProvidor";
import { useLlm } from "llm-exe";

export async function withLlmExeClient(options: Record<string, any>) {
  const { providor, ...restOfOptions } = options;
  const apiKey = await getKeyObjectFromProvidor(options.providor);

  const llm = useLlm(
    providor,
    Object.assign({ timeout: 60000 }, restOfOptions, apiKey)
  );

  return llm;
}
