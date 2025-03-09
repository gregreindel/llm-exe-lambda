// Set the DEPLOY_REGION before importing the module so the constructor picks it up
process.env.DEPLOY_REGION = "test-region";

import { StartSyncExecutionCommand } from "@aws-sdk/client-sfn";
import { startSyncExecution } from "./startSyncExecution";
import { sfnClient } from "./client";

// Mock the AWS SDK
jest.mock("./client", () => ({
  sfnClient: {
    send: jest.fn(),
  },
}));

describe("SFNClientGetObject", () => {
  it("calls send() on the client with a new StartSyncExecutionCommand", async () => {
    (sfnClient.send as jest.Mock).mockResolvedValueOnce({
      output: JSON.stringify({ hello: "world" }),
    });

    const params = { stateMachineArn: "arn:something", input: "\{\}" };
    const result = await startSyncExecution(params);
    // expect(StartSyncExecutionCommand).toHaveBeenCalledWith(params);
    expect(sfnClient.send).toHaveBeenCalledWith(
      expect.any(StartSyncExecutionCommand)
    );
    expect(result).toEqual({ hello: "world" });
  });

  it("returns empty object if 'response.output' is undefined", async () => {
    (sfnClient.send as jest.Mock).mockResolvedValueOnce({
      output: undefined,
    });

    const params = { stateMachineArn: "arn:something", input: "\{\}" };
    const result = await startSyncExecution(params);
    expect(sfnClient.send).toHaveBeenCalledWith(
      expect.any(StartSyncExecutionCommand)
    );
    expect(result).toEqual({});
  });

  it("returns error if 'response.output' is not able to be parsed", async () => {
    (sfnClient.send as jest.Mock).mockResolvedValueOnce({
      output: "u cant parse this",
    });

    const params = { stateMachineArn: "arn:something", input: "\{\}" };
    expect(() => startSyncExecution(params)).rejects.toThrow();
  });
});
