export function mergeInputsInOrder(route: any, input: any) {
  // use this to merge so we can get the right order
  if (
    typeof route !== "object" ||
    typeof input !== "object" ||
    route === null ||
    input === null ||
    Array.isArray(route) ||
    Array.isArray(input)
  ) {
    throw new Error("Invalid objects");
  }
  return Object.assign({}, input, route);
}
