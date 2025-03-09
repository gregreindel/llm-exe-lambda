const toJsonSchema = require('to-json-schema');

export function guessSchemaFromData(data: Record<string, any>) {
  return toJsonSchema(data);
}

