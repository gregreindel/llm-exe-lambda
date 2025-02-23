export interface LlmExeHandlerS3Config {
  key: string;
  bucket?: string;
  version?: string;
  data?: Record<string, any>;
}

export interface LlmExeHandlerPublicConfig {
  url: string;
  data?: Record<string, any>;
}

export type LlmExeHandlerConfig =
  | LlmExeHandlerS3Config
  | LlmExeHandlerPublicConfig;

export interface LlmExeHandlerInput {
  provider: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string;
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
}
