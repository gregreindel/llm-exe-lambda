import { s3ClientGetObject } from "@/clients/s3";
import { streamToObject } from "./stream";

export async function getS3ObjectAsJson<T extends Record<string, any>>(
  key: string,
  bucket = process?.env?.AWS_S3_FILES_BUCKET_NAME,
  version?: string
): Promise<T> {
  if (!key) {
    throw new Error("Missing key");
  }

  if (!bucket) {
    throw new Error("Missing bucket name");
  }

  const response = await s3ClientGetObject({
    Bucket: bucket,
    Key: key,
    VersionId: version,
  });

  return streamToObject(response.Body);
}
