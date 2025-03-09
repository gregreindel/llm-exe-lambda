// Set the DEPLOY_REGION before importing the module so the constructor picks it up
process.env.DEPLOY_REGION = "test-region";

import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";
import { sfnClientStartSyncExecution } from "./sfn";

// Mock the AWS SDK
jest.mock("@aws-sdk/client-sfn", () => {
  const mockSend = jest.fn().mockResolvedValue({output: JSON.stringify({ response: 'hello world'})});
  const MockSFNClient = jest.fn(() => ({ send: mockSend }));
  const MockStartSyncExecutionCommand = jest.fn((params) => params);

  return {
    SFNClient: MockSFNClient,
    StartSyncExecutionCommand: MockStartSyncExecutionCommand,
  };
});

describe("SFNClientGetObject", () => {
  it("initializes SFNClient with region from DEPLOY_REGION", () => {
    // The SFNClient constructor is called at import-time with { region: "test-region" }
    expect(SFNClient).toHaveBeenCalledWith({ region: "test-region" });
  });

  it("calls send() on the S3 client with a new StartSyncExecutionCommand", async () => {
    const params = { stateMachineArn: "arn:something", "input": "\{\}" };
    const result = await sfnClientStartSyncExecution(params);
    expect(StartSyncExecutionCommand).toHaveBeenCalledWith(params);
    expect(result).toEqual({ response: "hello world"});
  });
});