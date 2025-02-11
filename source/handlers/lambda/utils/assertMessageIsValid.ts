export function assertMessageIsValid(message: any) {
  if (typeof message === "string") {
    // ok
    return true;
  } else if (Array.isArray(message)) {
    if (message.every((a) => typeof a === "string")) {
      // cool, all strings
      return true;
    } else if (
      message.every((a) => typeof a === "object" && a?.content && a?.role)
    ) {
      // alright as well
      return true;
    }
  }
  throw new Error("Invalid format");
}
