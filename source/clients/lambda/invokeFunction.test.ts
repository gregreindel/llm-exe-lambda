import { invokeFunction } from "./invokeFunction";
import { lambdaClient } from "./client";
import { InvokeCommand } from "@aws-sdk/client-lambda";

jest.mock("./client", () => ({
  lambdaClient: {
    send: jest.fn(),
  },
}));

describe("invokeFunction", () => {
  const mockParams = { FunctionName: "testFunction" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return parsed JSON if payload is valid JSON", async () => {
    (lambdaClient.send as jest.Mock).mockResolvedValue({
      Payload: new TextEncoder().encode(JSON.stringify({ hello: "world" })),
      FunctionError: undefined,
    });

    const result = await invokeFunction(mockParams);
    expect(result).toEqual({ hello: "world" });
    expect(lambdaClient.send).toHaveBeenCalledWith(expect.any(InvokeCommand));
  });

  it("should return raw string if payload is invalid JSON", async () => {
    (lambdaClient.send as jest.Mock).mockResolvedValue({
      Payload: new TextEncoder().encode("this is not json"),
      FunctionError: undefined,
    });

    const result = await invokeFunction(mockParams);
    expect(result).toBe("this is not json");
    expect(lambdaClient.send).toHaveBeenCalledWith(expect.any(InvokeCommand));
  });

  it("should throw an error if FunctionError is present", async () => {
    (lambdaClient.send as jest.Mock).mockResolvedValue({
      Payload: undefined,
      FunctionError: "LambdaError",
    });

    await expect(invokeFunction(mockParams)).rejects.toThrow("LambdaError");
    expect(lambdaClient.send).toHaveBeenCalledWith(expect.any(InvokeCommand));
  });

  it("should throw an unknown error if neither Payload nor FunctionError is present", async () => {
    (lambdaClient.send as jest.Mock).mockResolvedValue({
      Payload: undefined,
      FunctionError: undefined,
    });

    await expect(invokeFunction(mockParams)).rejects.toThrow(
      "Unknown Function Error"
    );
    expect(lambdaClient.send).toHaveBeenCalledWith(expect.any(InvokeCommand));
  });
});