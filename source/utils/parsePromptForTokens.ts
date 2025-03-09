import { parseWithoutProcessing } from "@handlebars/parser";
import { extractHbsAttributeNamesFromString } from "./extractHbsAttributeNamesFromString";

export function parsePromptForTokens(str: string) {
  const { body } = parseWithoutProcessing(str);
  const attributeNames = extractHbsAttributeNamesFromString(body);
  return attributeNames;
}