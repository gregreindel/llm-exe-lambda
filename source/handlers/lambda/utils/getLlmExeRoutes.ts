import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { LlmExeRouterConfig } from "@/types";

export async function getLlmExeRoutes(
  payload: Record<string, any>
): Promise<Record<string, any>> {
  // If "routes" is present in the payload
  if ("routes" in payload) {
    const { routes, ...restOfPayload } = payload;

    // If "routes" is a string, assume it’s a URL to fetch/parse
    if (typeof routes === "string") {
      // Don’t allow empty strings
      if (!routes.trim()) {
        throw new Error("Routes string cannot be empty");
      }

      const content = await getContentFromUrl(routes);
      try {
        const parsed = JSON.parse(content);
        return {
          routes: parsed,
          data: restOfPayload,
        };
      } catch (err) {
        throw new Error("Invalid routes config: not valid JSON");
      }
    }

    // If "routes" is an object, accept it as-is
    if (!!routes && typeof routes === "object") {
      return {
        routes,
        data: restOfPayload,
      };
    }

    // If "routes" is present but not a string or object, fail
    throw new Error("Invalid routes config: must be a string or object");
  }

  // Otherwise, fall back to loading routes from S3
  const routes = await getS3ObjectAsWithLocal<LlmExeRouterConfig>(
    "routes.json",
    { format: "json" }
  );
  return {
    routes,
    data: payload,
  };
}
