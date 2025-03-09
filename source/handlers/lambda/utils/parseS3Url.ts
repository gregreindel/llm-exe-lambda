export function parseS3Url(url: string) {
  if (!url.startsWith("s3://")) {
    throw new Error("Invalid S3 URL: must start with 's3://'");
  }

  // Remove protocol.
  const withoutProtocol = url.slice(5); // remove "s3://"

  // Separate path and query.
  let pathPart = withoutProtocol;
  let queryPart = "";
  const queryStart = withoutProtocol.indexOf("?");
  if (queryStart !== -1) {
    pathPart = withoutProtocol.slice(0, queryStart);
    queryPart = withoutProtocol.slice(queryStart + 1);
  }

  const [bucket, ...keyParts] = pathPart.split("/");
  if (!bucket) {
    throw new Error("Invalid S3 URL: bucket name is missing");
  }
  const key = keyParts.join("/");

  // Prepare the result.
  const result: { bucket: string; key: string; version?: string } = {
    bucket,
    key,
  };

  // If there is a query part, parse for known parameters.
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const version = params.get("versionId");
    if (version) {
      result.version = version;
    }
  }

  return result;
}
