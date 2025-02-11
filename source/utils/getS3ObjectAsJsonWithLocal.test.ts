import { promises as fs } from "fs";
import { getS3ObjectAsJson } from "./getS3ObjectAsJson";
import * as path from "path";
import { getS3ObjectAsJsonWithLocal } from "./getS3ObjectAsJsonWithLocal";

// Mock dependencies
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn().mockResolvedValue({
        Body: {
          transformToString: jest
            .fn()
            .mockResolvedValue(JSON.stringify({ foo: "bar" })),
        },
      }),
    })),
    GetObjectCommand: jest.fn(),
  };
});

jest.mock("./getS3ObjectAsJson");

describe("getS3ObjectAsJsonWithLocal", () => {
  const mockKey = "mockKey.json";
  const mockBucket = "mockBucket";
  const mockData = { foo: "bar" };
  const mockJson = JSON.stringify(mockData);

  const readFileMock = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
  const writeFileMock = fs.writeFile as jest.MockedFunction<
    typeof fs.writeFile
  >;
  const accessFileMock = fs.access as jest.MockedFunction<typeof fs.access>;
  const mkdirMock = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
  const getS3ObjectAsJsonMock = getS3ObjectAsJson as jest.MockedFunction<
    typeof getS3ObjectAsJson
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    readFileMock.mockReset();

    process.env.LOCAL_S3_MOCK_DIRECTORY = "/mockDirectory";
    process.env.AWS_S3_TEMP_FILES_BUCKET_NAME = mockBucket;
  });

  describe("development environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("returns parsed JSON when local file exists", async () => {
      readFileMock.mockResolvedValue(mockJson);

      const result = await getS3ObjectAsJsonWithLocal(mockKey);

      expect(readFileMock).toHaveBeenCalledWith(
        "/mockDirectory/mockKey.json",
        "utf-8"
      );
      expect(result).toEqual(mockData);
    });

    it("reads from default Downloads directory in development if LOCAL_S3_MOCK_DIRECTORY is not set", async () => {
      delete process.env.LOCAL_S3_MOCK_DIRECTORY;
      readFileMock.mockResolvedValue(mockJson);
    
      const result = await getS3ObjectAsJsonWithLocal(mockKey);
    
      expect(readFileMock).toHaveBeenCalledWith(
        path.join("~/Downloads", mockKey),
        "utf-8"
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("production environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("returns parsed JSON from local file if exists", async () => {
      readFileMock.mockResolvedValueOnce(mockJson);

      const result = await getS3ObjectAsJsonWithLocal(mockKey);

      expect(readFileMock).toHaveBeenCalledWith(
        path.join("/tmp", mockKey),
        "utf-8"
      );
      expect(result).toEqual(mockData);
    });

    it("fetches from S3, writes to local, and returns JSON if local file does not exist", async () => {
      readFileMock.mockRejectedValueOnce(new Error("File not found"));
      accessFileMock.mockRejectedValueOnce(new Error("Directory not found"));
      getS3ObjectAsJsonMock.mockResolvedValueOnce(mockData);

      const result = await getS3ObjectAsJsonWithLocal(mockKey);

      expect(accessFileMock).toHaveBeenCalledWith(path.join("/tmp"));
      expect(mkdirMock).toHaveBeenCalledWith(path.join("/tmp"), {
        recursive: true,
      });
      expect(writeFileMock).toHaveBeenCalledWith(
        path.join("/tmp/mockKey.json"),
        mockJson
      );
      expect(result).toEqual(mockData);
    });

    it("throws an error if key is missing", async () => {
      await expect(getS3ObjectAsJsonWithLocal("")).rejects.toThrow(
        "Missing key"
      );
    });

    it("throws an error if bucket name is missing", async () => {
      delete process.env.AWS_S3_TEMP_FILES_BUCKET_NAME;

      await expect(getS3ObjectAsJsonWithLocal(mockKey)).rejects.toThrow(
        "Missing bucket name"
      );
    });
  });
});
