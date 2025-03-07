import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { LlmExeRouterConfig } from "@/types";

export async function getLlmExeRouterHandlerInput(
  payload: Record<string, any>
): Promise<Record<string, any>> {
  if ("routes" in payload) {
    const { routes, ...restOfPayload } = payload;

    if (typeof routes === "string") {
      const content = await getContentFromUrl(routes);

      try {
        const parsed = JSON.parse(content);
        return {
          routes: parsed,
          data: restOfPayload,
        };
      } catch (e) {
        throw new Error("Invalid routes");
      }
    }
    if (!!routes && typeof routes === "object") {
      return { routes, data: restOfPayload };
    }
  } else {
    const routes = await getS3ObjectAsWithLocal<LlmExeRouterConfig>(
      "routes.json",
      { format: "json" }
    );
    return {
      routes: routes,
      data: payload,
    };
  }
  throw new Error("Invalid routes");
}
