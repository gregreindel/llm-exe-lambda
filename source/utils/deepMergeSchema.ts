import { isPlainObject } from "./isPlainObject";

/* Recursively merge two JSON schema objects.
   In case of conflicts, primary (schema1) takes precedence.
   Non-overlapping keys will be included from both schemas. */
export function deepMergeSchema<
  P extends Record<string, any>,
  S extends Record<string, any>,
>(primary: P, secondary: S): any {
  // If both values are plain objects then merge recursively
  if (isPlainObject(primary) && isPlainObject(secondary)) {
    const result: Record<string, any> = { ...primary };
    Object.keys(secondary).forEach((key) => {
      if (key in result) {
        // Recursively merge values at the key
        result[key] = deepMergeSchema(result[key], secondary[key]);
      } else {
        // Not in primary? Add from secondary.
        result[key] = secondary[key];
      }
    });
    return result;
  }
  // If both values are arrays, combine them (and dedupe using a Set).
  if (Array.isArray(primary) && Array.isArray(secondary)) {
    return Array.from(new Set([...primary, ...secondary]));
  }
  // For all other cases, primary takes precedence if defined.
  return primary !== undefined ? primary : secondary;
}