import { withLlmExeClient } from "@/clients/llm-exe";
import { createParser, createLlmExecutor } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";

export async function inputTextOutputStringList(
  messages: string | any[],
  options: {
    provider: string;
    model: string;
    data?: Record<string, any>;
    debug?: boolean;
  }
) {
  const config: any = {
    timeout: 30000,
    provider: options.provider,
    model: options.model,
  };

  const llm = await withLlmExeClient(config);
  const prompt = inputTextPrompt(messages);
  const parser = createParser("listToArray");

  const data = options?.data || {};

  return createLlmExecutor(
    {
      llm,
      prompt,
      parser,
    },
    {
      hooks: {
        onComplete(m) {
          if (options?.debug) {
            console.log(m);
          }
        },
      },
    }
  ).execute(data);
}
