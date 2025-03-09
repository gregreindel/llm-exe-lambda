import { promises as fs } from "fs";
import * as path from "path";
import {
  getS3ObjectAs,
  GetS3ObjectOptions,
  GetS3ObjectOptionsString,
  GetS3ObjectOptionsJson,
} from "./getS3ObjectAs";

export async function getS3ObjectAsWithLocal<T extends Record<string, any>>(
  key: string,
  options: GetS3ObjectOptionsJson
): Promise<T>;

export async function getS3ObjectAsWithLocal(
  key: string,
  options: GetS3ObjectOptionsString
): Promise<string>;

export async function getS3ObjectAsWithLocal(key: string): Promise<string>;

/**
 * Fetches an S3 object as JSON and saves it to the local filesystem.
 * If the file already exists locally, it reads and parses the local file.
 */
export async function getS3ObjectAsWithLocal<
  T extends Record<string, any> = Record<string, any>
>(key: string, options?: GetS3ObjectOptions): Promise<T | string> {
  const {
    bucket = process?.env?.AWS_S3_FILES_BUCKET_NAME,
    format,
    version,
  } = options || {};

  if (process.env.NODE_ENV === "development") {
    const data = await fs.readFile(
      `${process.env.LOCAL_S3_MOCK_DIRECTORY}/${key}`,
      "utf-8"
    );
    return JSON.parse(data) as T;
  } else {
    if (!key) {
      throw new Error("Missing key");
    }

    if (!bucket) {
      throw new Error("Missing bucket name");
    }

    const parseFile = path.parse(`/tmp/${key}`);
    const filePath = parseFile.dir;
    const fileName = parseFile.base;

    // check to see if local file exists
    try {
      const data = await fs.readFile(`${filePath}/${fileName}`, "utf-8");
      return JSON.parse(data) as T;
    } catch (err) {
      // file does not exist
    }

    try {
      await fs.access(filePath);
    } catch (err) {
      await fs.mkdir(filePath, { recursive: true });
    }

    if (format === "json") {
      const response = await getS3ObjectAs(key, { format, bucket, version });
      await fs.writeFile(`${filePath}/${fileName}`, JSON.stringify(response));
      return response as T;
    }

    const response = await getS3ObjectAs(key, { format, bucket, version });
    await fs.writeFile(`${filePath}/${fileName}`, JSON.stringify(response));
    return response;
  }
}
