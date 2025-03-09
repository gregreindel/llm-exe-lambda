export function mergeInputsInOrder(initial: any, newInput: any) {
  // use this to merge so we can get the right order
  if (
    typeof initial !== "object" ||
    typeof newInput !== "object" ||
    initial === null ||
    newInput === null ||
    Array.isArray(initial) ||
    Array.isArray(newInput)
  ) {
    throw new Error("Invalid objects");
  }
  return Object.assign({}, newInput, initial);
}
