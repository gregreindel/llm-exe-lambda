import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { LlmExeRouterConfig } from "@/types";
import { getLlmExeRoutes } from "./getLlmExeRoutes";

export async function getLlmExeRouterHandlerInput(
  payload: Record<string, any>
): Promise<Record<string, any>> {
  // If "router" is a string, treat it as a URL we need to fetch
  if (payload?.router && typeof payload.router === "string") {
    const content = await getContentFromUrl(payload.router);
    try {
      const parsed = JSON.parse(content);
      return getLlmExeRoutes(parsed);
    } catch {
      throw new Error("Invalid router");
    }
  }

  // If "router" is an object, use it directly
  if (payload?.router && typeof payload.router === "object") {
    return getLlmExeRoutes(payload.router);
  }

  // If "routes" is a string, treat it as a URL we need to fetch
  if (payload?.routes && typeof payload.routes === "string") {
    const content = await getContentFromUrl(payload.routes);
    try {
      const parsed = JSON.parse(content);
      return getLlmExeRoutes(parsed);
    } catch {
      throw new Error("Invalid routes");
    }
  }

  // If "routes" is an object, use it directly
  if (payload?.routes && typeof payload.routes === "object") {
    return getLlmExeRoutes(payload);
  }

  // Otherwise, fall back to S3
  const routes = await getS3ObjectAsWithLocal<LlmExeRouterConfig>(
    "router.json",
    { format: "json" }
  );
  return {
    routes,
    data: payload,
  };
}
