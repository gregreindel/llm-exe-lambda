import { getS3ObjectAs } from "./getS3ObjectAs";
import { s3ClientGetObject } from "@/clients/s3";
import { streamToObject, streamToString } from "./stream";
import { GetObjectCommandInput } from "@aws-sdk/client-s3";

jest.mock("@/clients/s3", () => ({
  s3ClientGetObject: jest.fn(),
}));

jest.mock("./stream", () => ({
  streamToObject: jest.fn(),
  streamToString: jest.fn(),
}));

describe("getS3ObjectAs", () => {
  const s3ClientGetObjectMock = s3ClientGetObject as jest.Mock;
  const streamToObjectMock = streamToObject as jest.Mock;
  const streamToStringMock = streamToString as jest.Mock;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    s3ClientGetObjectMock.mockReset();
    streamToObjectMock.mockReset();
    streamToStringMock.mockReset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("throws an error if key is missing", async () => {
    await expect(getS3ObjectAs("")).rejects.toThrow("Missing key");
  });

  it("throws an error if bucket is missing", async () => {
    delete process.env.AWS_S3_FILES_BUCKET_NAME;
    await expect(getS3ObjectAs("some-key")).rejects.toThrow("Missing bucket name");
  });

  it("returns string when format is 'string' (default) and calls s3ClientGetObject with version", async () => {
    process.env.AWS_S3_FILES_BUCKET_NAME = "default-bucket";
    const fakeBody = "fake-body";
    const version = "v1";
    s3ClientGetObjectMock.mockResolvedValueOnce({ Body: fakeBody });
    streamToStringMock.mockReturnValueOnce(Promise.resolve("returned string"));

    const result = await getS3ObjectAs("test-key", { version, format: "string" });
    const expectedArgs: GetObjectCommandInput = {
      Bucket: "default-bucket",
      Key: "test-key",
      VersionId: version,
    };

    expect(s3ClientGetObjectMock).toHaveBeenCalledWith(expectedArgs);
    expect(streamToStringMock).toHaveBeenCalledWith(fakeBody);
    expect(result).toBe("returned string");
  });

  it("returns string when format is 'string' (default) without version and uses options bucket over process.env", async () => {
    process.env.AWS_S3_FILES_BUCKET_NAME = "default-bucket";
    const fakeBody = "body-string";
    s3ClientGetObjectMock.mockResolvedValueOnce({ Body: fakeBody });
    streamToStringMock.mockReturnValueOnce(Promise.resolve("string result"));

    const result = await getS3ObjectAs("key-string", { bucket: "custom-bucket", format: "string" });
    const expectedArgs: GetObjectCommandInput = {
      Bucket: "custom-bucket",
      Key: "key-string",
    };

    expect(s3ClientGetObjectMock).toHaveBeenCalledWith(expectedArgs);
    expect(streamToStringMock).toHaveBeenCalledWith(fakeBody);
    expect(result).toBe("string result");
  });

  it("returns JSON object when format is 'json' and uses options bucket over process.env", async () => {
    process.env.AWS_S3_FILES_BUCKET_NAME = "default-bucket";
    const fakeBody = "body-json";
    const jsonResult = { a: 1, b: "value" };
    s3ClientGetObjectMock.mockResolvedValueOnce({ Body: fakeBody });
    streamToObjectMock.mockReturnValueOnce(Promise.resolve(jsonResult));

    const result = await getS3ObjectAs("key-json", { bucket: "custom-bucket", format: "json" });
    const expectedArgs: GetObjectCommandInput = {
      Bucket: "custom-bucket",
      Key: "key-json",
    };

    expect(s3ClientGetObjectMock).toHaveBeenCalledWith(expectedArgs);
    expect(streamToObjectMock).toHaveBeenCalledWith(fakeBody);
    expect(result).toEqual(jsonResult);
  });
});
