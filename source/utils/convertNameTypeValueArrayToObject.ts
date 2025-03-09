import { NameTypeValueItem } from "@/types";
import { parseNameTypeValueItemValue } from "./parseNameTypeValueItemValue";

export function convertNameTypeValueArrayToObject(
  items: NameTypeValueItem[]
): Record<string, unknown> {
  const resultObject: Record<string, unknown> = {};

  for (const item of items) {
    resultObject[item.name] = parseNameTypeValueItemValue(
      item.value,
      item.type
    );
  }

  return resultObject;
}
