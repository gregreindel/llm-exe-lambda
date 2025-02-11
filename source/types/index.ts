export interface LlmExeHandlerConfig {
  key: string;
  version?: string;
  data?: Record<string, any>;
}

export interface LlmExeHandlerInput {
  providor: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string;
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
}
