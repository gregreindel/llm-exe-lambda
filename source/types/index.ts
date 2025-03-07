export interface LlmExeHandlerConfig {
  url: string;
  data?: Record<string, any>;
}

export interface LlmExeHandlerInput {
  provider: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string;
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
}

export interface LlmExeRouterConfig {
  [key: string]: (LlmExeHandlerConfig | LlmExeHandlerInput) & { handler?: string };
}
