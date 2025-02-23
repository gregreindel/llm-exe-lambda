import { LlmExeHandlerInput } from "@/types";
import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsJsonWithLocal } from "@/utils/getS3ObjectAsJsonWithLocal";
import { parseDialogue } from "@/utils/parseDialogue";
import { parseFrontmatter } from "@/utils/parseFrontmatter";
import pick = require("lodash.pick");

export async function getLlmExeHandlerInput(
  event: Record<string, any>
): Promise<Record<string, any>> {
  const defaults = {
    output: "string",
  };

  if ("key" in event && "bucket" in event) {
    const { key, bucket, version } = event;
    const loaded = await getS3ObjectAsJsonWithLocal<LlmExeHandlerInput>(
      key,
      bucket,
      version
    );
    return Object.assign({}, defaults, loaded);
  } else if ("url" in event) {
    const { url } = event;
    // get from url
    const loaded = await getContentFromUrl(url);
    // check if json or string
    if (loaded.startsWith("{")) {
      // if json, parse and return it
      return Object.assign({}, defaults, JSON.parse(loaded));
    }

    // if string, try to parse it with frontmatter and prompt-style
    const { body = "", attributes = {} } = parseFrontmatter(loaded);
    const parsed: Record<string, any> = pick(attributes, []);
    const parsedDialogue = parseDialogue(body);

    if (parsedDialogue.length === 0) {
      parsed.message = body;
    } else {
      parsed.message = parsedDialogue;
    }

    return Object.assign({}, defaults, parsed);
  } else {
    return Object.assign({}, defaults, event);
  }
}
