export function makeObjectSchemaFromAttributeNames(names: string[]) {
  if (!Array.isArray(names)) {
    throw new TypeError("Expected an array of attribute names");
  }
  
  const schema: Record<string, any> = {
    type: "object",
    properties: {},
    required: names,
  };

  for (const name of names) {
    schema.properties[name] = {
      type: "string",
    };
  }

  return schema;
}
