// Set the DEPLOY_REGION before importing the module so the constructor picks it up
process.env.DEPLOY_REGION = "test-region";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClientInvoke } from "./lambda";

// Mock the AWS SDK
jest.mock("@aws-sdk/client-lambda", () => {
  const mockSend = jest
    .fn()
    .mockResolvedValue({
      Payload: new TextEncoder().encode(
        JSON.stringify({ response: "hello world" })
      ).buffer,
    });
  const MockLambdaClient = jest.fn(() => ({ send: mockSend }));
  const MockInvokeCommand = jest.fn((params) => params);

  return {
    LambdaClient: MockLambdaClient,
    InvokeCommand: MockInvokeCommand,
  };
});

describe("LambdaClientGetObject", () => {
  it("initializes LambdaClient with region from DEPLOY_REGION", () => {
    // The LambdaClient constructor is called at import-time with { region: "test-region" }
    expect(LambdaClient).toHaveBeenCalledWith({ region: "test-region" });
  });

  it("calls send() on the S3 client with a new InvokeCommand", async () => {
    const params = { FunctionName: "arn:something", Payload: "\{\}" };
    const result = await lambdaClientInvoke(params);
    expect(InvokeCommand).toHaveBeenCalledWith(params);
    expect(result).toEqual({ response: "hello world" });
  });
});
