import { streamToObject } from "./stream";
import { getS3ObjectAsJson } from "./getS3ObjectAsJson";
import { s3ClientGetObject } from "@/clients/s3";

jest.mock("@/clients/s3", () => ({
  s3ClientGetObject: jest.fn(),
}));

jest.mock("./stream", () => ({
  streamToString: jest.fn(),
  streamToObject: jest.fn(),
}));

describe("getS3ObjectAsJson", () => {
    const s3ClientGetObjectMock = s3ClientGetObject as jest.Mock;
    const streamToObjectMock = streamToObject as jest.Mock;
  
    const key = "some-key";
    const bucket = "some-bucket";
    const mockS3Response = { Body: "mock-stream" };
    const mockJsonObject = { some: "data" };


    beforeEach(() => {
      process.env.AWS_S3_FILES_BUCKET_NAME = bucket;
      s3ClientGetObjectMock.mockClear();
      streamToObjectMock.mockClear();
    });
  
  
    it('throws an error if "key" is missing', async () => {
      s3ClientGetObjectMock.mockResolvedValueOnce(mockS3Response);
      expect(() => getS3ObjectAsJson("")).rejects.toThrowError("Missing key")
    });
  
    it('throws an error if "bucket" is missing', async () => {
      process.env.AWS_S3_FILES_BUCKET_NAME = "";
      s3ClientGetObjectMock.mockResolvedValueOnce(mockS3Response);
      expect(() => getS3ObjectAsJson("thing.png")).rejects.toThrowError("Missing bucket name")
    });
  
    it("fetches the object from S3 and returns it as a string", async () => {
      s3ClientGetObjectMock.mockResolvedValueOnce(mockS3Response);
      streamToObjectMock.mockResolvedValueOnce(mockJsonObject);
      const result = await getS3ObjectAsJson(key);
      expect(s3ClientGetObjectMock).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
      });
      expect(streamToObjectMock).toHaveBeenCalledWith("mock-stream");
      expect(result).toBe(mockJsonObject);
    });
  });