import { withLlmExeClient } from "@/clients/llm-exe";
import { createLlmExecutor, createParser } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";

export async function inputTextOutputJson<T extends Record<string, any>>(
  
  messages: string | any[],
  options: {
    schema: T;
    model: string;
    providor: string;
    data?: Record<string, any>;
    debug?: boolean
  }
) {
  const config: any = {
    useJson: true,
    timeout: 30000,
    providor: options.providor,
    model: options.model,
  };

  const llm = await withLlmExeClient(config);

  const prompt = inputTextPrompt(messages, [], true);
  const parser = createParser("json", { schema: options.schema });
  const data = options?.data || {};

  return createLlmExecutor({
    llm,
    prompt,
    parser,
  },{
    hooks: {
      onComplete(m){
        if(options?.debug){
          console.log(m)
        }
      }
    }
  }).execute(Object.assign({}, data, { schema: options.schema }));
}
