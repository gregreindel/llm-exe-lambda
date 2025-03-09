import { parseS3Url } from "@/handlers/lambda/utils/parseS3Url";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { isValidUrl } from "./isValidUrl";

export async function getContentFromUrl(url: string): Promise<string> {
  if (!url) {
    throw new Error("Missing url");
  }

  if (!isValidUrl(url)) {
    throw new Error("Invalid url");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 7500);

  try {
    if (url.startsWith("s3://")) {
      const { key, bucket, version } = parseS3Url(url);
      const loaded = await getS3ObjectAsWithLocal(key, {
        format: "string",
        bucket,
        version,
      });
      return loaded.trim();
    }

    const response = await fetch(url, { signal: controller.signal });
    const data = await response.text();
    return data.trim();
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
