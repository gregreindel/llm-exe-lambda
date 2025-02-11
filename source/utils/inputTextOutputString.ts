import { withLlmExeClient } from "@/clients/llm-exe";
import { createParser, createLlmExecutor } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";

export async function inputTextOutputString(
  messages: string | any[],
  options: {
    providor: string;
    model: string;
    data?: Record<string, any>;
    debug?: boolean;
  },
  history?: any[]
) {
  const config: any = {
    timeout: 30000,
    providor: options.providor,
    model: options.model,
  };

  const llm = await withLlmExeClient(config);
  const prompt = inputTextPrompt(messages, history);
  const parser = createParser("string");

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
