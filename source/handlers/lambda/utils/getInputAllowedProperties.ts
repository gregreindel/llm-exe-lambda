import pick = require("lodash.pick");

export function getInputAllowedProperties(input: Record<string, any>){
    return pick(input, [
      "provider",
      "model",
      "message",
      "output",
      "schema",
      "data",
    ]);
}