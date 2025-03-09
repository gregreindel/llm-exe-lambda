export function debug(...args: any[]) {
  const debugValue = process.env.DEBUG;
  if (
    typeof debugValue === "string" &&
    debugValue !== "" &&
    debugValue.toLowerCase() !== "undefined" &&
    debugValue.toLowerCase() !== "null"
  ) {
    console.debug(...args);
  }
}