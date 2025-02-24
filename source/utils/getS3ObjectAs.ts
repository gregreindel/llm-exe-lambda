import { s3ClientGetObject } from "@/clients/s3";
import { streamToObject, streamToString } from "./stream";
import { GetObjectCommandInput } from "@aws-sdk/client-s3";

export type FormatString = "string";
export type FormatJson = "json";

export interface GetS3ObjectOptionsJson {
  bucket?: string;
  version?: string;
  format?: FormatJson;
}

export interface GetS3ObjectOptionsString {
  bucket?: string;
  version?: string;
  format?: FormatString;
}

export type GetS3ObjectOptions =
  | GetS3ObjectOptionsJson
  | GetS3ObjectOptionsString;

export async function getS3ObjectAs<T extends Record<string, any>>(
  key: string,
  options: GetS3ObjectOptionsJson
): Promise<T>;

export async function getS3ObjectAs(
  key: string,
  options: GetS3ObjectOptionsString
): Promise<string>;

export async function getS3ObjectAs(key: string): Promise<string>;

export async function getS3ObjectAs<T extends Record<string, any>>(
  key: string,
  options?: GetS3ObjectOptions & { format?: FormatJson | FormatString }
): Promise<T | string> {
  const {
    bucket = process?.env?.AWS_S3_FILES_BUCKET_NAME,
    format = "string",
    version,
  } = options || {};

  if (!key) {
    throw new Error("Missing key");
  }

  if (!bucket) {
    throw new Error("Missing bucket name");
  }

  const args: GetObjectCommandInput = {
    Bucket: bucket,
    Key: key,
  };

  if (version) {
    args.VersionId = version;
  }

  const response = await s3ClientGetObject(args);

  if (format === "json") {
    return streamToObject(response.Body) as Promise<T>;
  }

  return streamToString(response.Body);
}
