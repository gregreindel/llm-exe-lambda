export function unTrailingSlashIt(str?: string) {
  if (str?.endsWith("/")) {
    return str.substring(0, str.length - 1);
  }
  return str || "";
}

export function trailingSlashIt(str?: string) {
  if (!str) {
    return "/";
  }

  if (str?.endsWith("/")) {
    return str;
  }
  return `${str}/`;
}

export function unLeadingSlashIt(str?: string) {
  if (str?.startsWith("/")) {
    return str.substring(1);
  }
  return str || "";
}