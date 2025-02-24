// Set the DEPLOY_REGION before importing the module so the constructor picks it up
process.env.DEPLOY_REGION = "test-region";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3ClientGetObject } from "./s3";

// Mock the AWS SDK
jest.mock("@aws-sdk/client-s3", () => {
  const mockSend = jest.fn().mockResolvedValue("mocked-response");
  const MockS3Client = jest.fn(() => ({ send: mockSend }));
  const MockGetObjectCommand = jest.fn((params) => params);

  return {
    S3Client: MockS3Client,
    GetObjectCommand: MockGetObjectCommand,
  };
});

describe("s3ClientGetObject", () => {
  it("initializes S3Client with region from DEPLOY_REGION", () => {
    // The S3Client constructor is called at import-time with { region: "test-region" }
    expect(S3Client).toHaveBeenCalledWith({ region: "test-region" });
  });

  it("calls send() on the S3 client with a new GetObjectCommand", async () => {
    const params = { Bucket: "my-bucket", Key: "my-key" };
    const result = await s3ClientGetObject(params);

    expect(GetObjectCommand).toHaveBeenCalledWith(params);
    expect(result).toBe("mocked-response");
  });
});