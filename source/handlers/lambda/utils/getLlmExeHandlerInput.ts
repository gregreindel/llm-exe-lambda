import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { parseDialogue } from "@/utils/parseDialogue";
import { parseFrontmatter } from "@/utils/parseFrontmatter";
import pick = require("lodash.pick");
import { getInputAllowedProperties } from "./getInputAllowedProperties";

export async function getLlmExeHandlerInput(
  event: Record<string, any>
): Promise<Record<string, any>> {
  const defaults = {
    output: "string",
  };

  if ("url" in event) {
    const { url, ...restOfPayload } = event;

    // get from url
    const loaded = await getContentFromUrl(url);

    // check if json or string
    if (loaded.startsWith("{")) {
      try {
        // if json, parse and return it
        const obj = JSON.parse(loaded);
        return getInputAllowedProperties(Object.assign({}, defaults, obj));
      } catch (error) {
        throw new Error(`Failed to parse JSON from ${url}`);
      }
    }

    // if string, try to parse it with frontmatter and prompt-style
    const { body, attributes } = parseFrontmatter(loaded);
    const parsed: Record<string, any> = pick(attributes, [
      "provider",
      "model",
      "output",
      "schema",
      "data",
    ]);
    const parsedDialogue = parseDialogue(body);

    if (parsedDialogue.length === 0) {
      parsed.message = body;
    } else {
      parsed.message = parsedDialogue;
    }

    // options can be overwritten defaults -> payload -> frontmatter
    return getInputAllowedProperties(
      Object.assign({}, defaults, restOfPayload, parsed)
    );
  } else {
    return getInputAllowedProperties(Object.assign({}, defaults, event));
  }
}
