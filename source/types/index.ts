export interface LlmExeRouterRouteToolConfig {
  // optional only if using as tools via router; otherwise useless.
  inputSchema?: Record<string, any>;
  operationId?: string;
  description?: string;
  summary?: string;
}

export interface LlmExeHandlerInput {
  provider: "openai" | "anthropic" | "amazon:anthropic" | "amazon:meta";
  model: string;
  output?: "string" | "json" | "list";
  message: string | { role: string; content: string }[] | string[];
  schema?: Record<string, any>;
  data?: Record<string, any>;
  // specify handler or load external override
  handler?: string;
  url?: string;
}

export interface LlmExeHandlerConfig extends Partial<LlmExeHandlerInput> {
  url: string;
}

export interface LlmExeHandlerConfigWithHandler
  extends Partial<LlmExeHandlerInput> {
  handler: string;
}

export type LlmExeRouterConfigRoute = (
  | LlmExeHandlerConfig
  | LlmExeHandlerInput
  | LlmExeHandlerConfigWithHandler
) &
  LlmExeRouterRouteToolConfig;

export type LlmExeRouterConfigRoutes = {
  [key: string]: LlmExeRouterConfigRoute;
};

export type LlmExeRouterConfig = {
  title?: string;
  version?: string;
  description?: string;
  routes: LlmExeRouterConfigRoutes;
};


export interface NameTypeValueItem {
  name: string;
  type: "string" | "number" | "boolean";
  value: string; // all values come in as strings and need conversion
}
