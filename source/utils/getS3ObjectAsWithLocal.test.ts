import { promises as fs } from "fs";
import * as path from "path";
import {
  getS3ObjectAsWithLocal,
} from "./getS3ObjectAsWithLocal";
import { getS3ObjectAs } from "./getS3ObjectAs";

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock("./getS3ObjectAs", () => ({
  getS3ObjectAs: jest.fn(),
}));

describe("getS3ObjectAsWithLocal", () => {
  const readFileMock = fs.readFile as jest.Mock;
  const accessMock = fs.access as jest.Mock;
  const mkdirMock = fs.mkdir as jest.Mock;
  const writeFileMock = fs.writeFile as jest.Mock;
  const getS3ObjectAsMock = getS3ObjectAs as jest.Mock;

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    readFileMock.mockReset();
    accessMock.mockReset();
    mkdirMock.mockReset();
    writeFileMock.mockReset();
    getS3ObjectAsMock.mockReset();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns JSON parsed object in development mode", async () => {
    process.env.NODE_ENV = "development";
    process.env.LOCAL_S3_MOCK_DIRECTORY = "/local/mock";
    const tokenKey = "test.json";
    const localPath = `${process.env.LOCAL_S3_MOCK_DIRECTORY}/${tokenKey}`;
    const fileContent = '{"development": "mode"}';
    readFileMock.mockResolvedValueOnce(fileContent);

    const result = await getS3ObjectAsWithLocal(tokenKey);

    expect(readFileMock).toHaveBeenCalledWith(localPath, "utf-8");
    expect(result).toEqual({ development: "mode" });
  });

  it("throws error if key is missing in production mode", async () => {
    process.env.NODE_ENV = "production";
    await expect(getS3ObjectAsWithLocal("", { bucket: "bucket" })).rejects.toThrow(
      "Missing key"
    );
  });

  it("throws error if bucket is missing in production mode", async () => {
    process.env.NODE_ENV = "production";
    // Neither providing bucket in options nor in ENV
    await expect(getS3ObjectAsWithLocal("test.json", {})).rejects.toThrow(
      "Missing bucket name"
    );
  });

  it("returns local file content if file exists in production mode", async () => {
    process.env.NODE_ENV = "production";
    const key = "test.json";
    const options = { bucket: "bucket" };
    // For key "test.json", path.parse(`/tmp/test.json`) returns dir: "/tmp", base: "test.json"
    const parsedPath = path.parse(`/tmp/${key}`);
    const localFilePath = `${parsedPath.dir}/${parsedPath.base}`;
    const localContent = '{"prod": "local"}';
    readFileMock.mockResolvedValueOnce(localContent);

    const result = await getS3ObjectAsWithLocal(key, options);

    expect(readFileMock).toHaveBeenCalledWith(localFilePath, "utf-8");
    expect(result).toEqual({ prod: "local" });
    expect(getS3ObjectAsMock).not.toHaveBeenCalled();
  });

  it("fetches from S3 and writes file when local file does not exist (json format), creating directory if needed", async () => {
    process.env.NODE_ENV = "production";
    const key = "test.json";
    const options = { format: "json", bucket: "bucket", version: "v1" };
    const parsedPath = path.parse(`/tmp/${key}`);
    const localFilePath = `${parsedPath.dir}/${parsedPath.base}`;

    // Simulate local file does not exist.
    readFileMock.mockRejectedValueOnce(new Error("File not found"));
    // Simulate the local directory does not exist.
    accessMock.mockRejectedValueOnce(new Error("Dir not found"));
    mkdirMock.mockResolvedValueOnce(undefined);

    const s3Response = { s3: "data" };
    getS3ObjectAsMock.mockResolvedValueOnce(s3Response);
    writeFileMock.mockResolvedValueOnce(undefined);

    const result = await getS3ObjectAsWithLocal(key, options as any);

    expect(readFileMock).toHaveBeenCalledWith(localFilePath, "utf-8");
    expect(accessMock).toHaveBeenCalledWith(parsedPath.dir);
    expect(mkdirMock).toHaveBeenCalledWith(parsedPath.dir, { recursive: true });
    expect(getS3ObjectAsMock).toHaveBeenCalledWith(key, {
      format: "json",
      bucket: "bucket",
      version: "v1",
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      localFilePath,
      JSON.stringify(s3Response)
    );
    expect(result).toEqual(s3Response);
  });

  it("fetches from S3 and writes file when local file does not exist and directory exists (non-json format)", async () => {
    process.env.NODE_ENV = "production";
    const key = "test.txt";
    const options = { format: "text", bucket: "bucket", version: "v2" };
    const parsedPath = path.parse(`/tmp/${key}`);
    const localFilePath = `${parsedPath.dir}/${parsedPath.base}`;

    readFileMock.mockRejectedValueOnce(new Error("File not found"));
    // Simulate that the directory exists.
    accessMock.mockResolvedValueOnce(undefined);

    const s3Response = "s3textresponse";
    getS3ObjectAsMock.mockResolvedValueOnce(s3Response);
    writeFileMock.mockResolvedValueOnce(undefined);

    const result = await getS3ObjectAsWithLocal(key, options as any);

    expect(readFileMock).toHaveBeenCalledWith(localFilePath, "utf-8");
    expect(accessMock).toHaveBeenCalledWith(parsedPath.dir);
    expect(mkdirMock).not.toHaveBeenCalled();
    expect(getS3ObjectAsMock).toHaveBeenCalledWith(key, {
      format: "text",
      bucket: "bucket",
      version: "v2",
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      localFilePath,
      JSON.stringify(s3Response)
    );
    expect(result).toEqual(s3Response);
  });

  it("fetches from S3 and writes file using bucket from environment when options are not provided", async () => {
    process.env.NODE_ENV = "production";
    process.env.AWS_S3_FILES_BUCKET_NAME = "env-bucket";
    const key = "test.json";
    const parsedPath = path.parse(`/tmp/${key}`);
    const localFilePath = `${parsedPath.dir}/${parsedPath.base}`;

    readFileMock.mockRejectedValueOnce(new Error("File not found"));
    accessMock.mockResolvedValueOnce(undefined);

    const s3Response = { from: "s3-env" };
    getS3ObjectAsMock.mockResolvedValueOnce(s3Response);
    writeFileMock.mockResolvedValueOnce(undefined);

    const result = await getS3ObjectAsWithLocal(key);

    expect(readFileMock).toHaveBeenCalledWith(localFilePath, "utf-8");
    expect(accessMock).toHaveBeenCalledWith(parsedPath.dir);
    expect(getS3ObjectAsMock).toHaveBeenCalledWith(key, {
      format: undefined,
      bucket: "env-bucket",
      version: undefined,
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      localFilePath,
      JSON.stringify(s3Response)
    );
    expect(result).toEqual(s3Response);
  });
});