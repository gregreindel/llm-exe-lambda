import { LlmExeRouterHandler } from "./router";
import { getInputPath } from "./utils/getInputPath";
import { getInputPayload } from "./utils/getInputPayload";
import { getOutputPayload } from "./utils/getOutputPayload";
import { getLlmExeRouterHandlerInput } from "./utils/getLlmExeRouterHandlerInput";
import { startSyncExecution } from "@/clients/sfn/startSyncExecution";
import { invokeFunction } from "@/clients/lambda/invokeFunction";
import { unLeadingSlashIt } from "@/utils/slashes";
import { schemaFromRoutes } from "@/utils/schemaFromEndpoint";
import { LlmExeHandler } from "./use-llm-exe";
import { mergeInputsInOrder } from "@/utils/mergeInputsInOrder";

jest.mock("./utils/getInputPath", () => ({
  getInputPath: jest.fn(),
}));
jest.mock("./utils/getInputPayload", () => ({
  getInputPayload: jest.fn(),
}));
jest.mock("./utils/getOutputPayload", () => ({
  getOutputPayload: jest.fn(),
}));
jest.mock("./utils/getLlmExeRouterHandlerInput", () => ({
  getLlmExeRouterHandlerInput: jest.fn(),
}));
jest.mock("@/clients/sfn/startSyncExecution", () => ({
  startSyncExecution: jest.fn(),
}));
jest.mock("@/clients/lambda/invokeFunction", () => ({
  invokeFunction: jest.fn(),
}));
jest.mock("@/utils/slashes", () => ({
  unLeadingSlashIt: jest.fn(),
}));
jest.mock("@/utils/schemaFromEndpoint", () => ({
  schemaFromRoutes: jest.fn(),
}));
jest.mock("./use-llm-exe", () => ({
  LlmExeHandler: jest.fn(),
}));

describe("LlmExeRouterHandler", () => {
  const mockEvent = { mockKey: "mockValue" } as any;
  let mockPath: string | undefined;
  let mockPayload: any;
  let mockHandlerInput: any;
  let mockRoutes: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockPath = "/testRoute";
    mockPayload = { data: { foo: "bar" } };
    mockRoutes = {
      testRoute: {
        handler: "someHandler",
      },
    };
    mockHandlerInput = {
      data: mockPayload.data,
      routes: mockRoutes,
    };

    (getInputPath as jest.Mock).mockReturnValue(mockPath);
    (getInputPayload as jest.Mock).mockReturnValue(mockPayload);
    (getLlmExeRouterHandlerInput as jest.Mock).mockResolvedValue(mockHandlerInput);
    (getOutputPayload as jest.Mock).mockImplementation((e, r) => ({
      event: e,
      response: r,
    }));
    (unLeadingSlashIt as jest.Mock).mockImplementation((path) =>
      typeof path === "string" && path.startsWith("/")
        ? path.slice(1)
        : path
    );
    (invokeFunction as jest.Mock).mockResolvedValue("lambdaResult");
    (startSyncExecution as jest.Mock).mockResolvedValue("sfnResult");
    (schemaFromRoutes as jest.Mock).mockResolvedValue("schemaResult");
    (LlmExeHandler as jest.Mock).mockResolvedValue("llmExeHandlerResult");
  });

  it("throws if the path is not found", async () => {
    (getInputPath as jest.Mock).mockReturnValue(undefined);

    const result = await LlmExeRouterHandler(mockEvent);
    expect(result.response).toBeInstanceOf(Error);
    expect(result.response.message).toBe("Path not found");
  });

  it("returns schema if path === '/schema.json'", async () => {
    (getInputPath as jest.Mock).mockReturnValue("/schema.json");

    const result = await LlmExeRouterHandler(mockEvent);

    expect(schemaFromRoutes).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockHandlerInput.data,
        routes: mockHandlerInput.routes,
      })
    );
    expect(result).toEqual({
      event: mockEvent,
      response: "schemaResult",
    });
  });

  it("throws an error if route is not found", async () => {
    (getInputPath as jest.Mock).mockReturnValue("/someMissingRoute");
    (unLeadingSlashIt as jest.Mock).mockReturnValue("someMissingRoute");

    const result = await LlmExeRouterHandler(mockEvent);
    expect(result.response).toBeInstanceOf(Error);
    expect(result.response.message).toContain("Route not found: (/someMissingRoute)");
  });

  it("throws an error if route is not an object", async () => {
    (getInputPath as jest.Mock).mockReturnValue("/weirdRoute");
    (unLeadingSlashIt as jest.Mock).mockReturnValue("weirdRoute");
    mockRoutes.weirdRoute = "notAnObject"; // <= This is not an object

    const result = await LlmExeRouterHandler(mockEvent);

    expect(result.response).toBeInstanceOf(Error);
    expect(result.response.message).toContain("Route not found: (/weirdRoute)");
  });

  it("calls invokeFunction if route.handler starts with 'arn:aws:lambda'", async () => {
    mockRoutes.testRoute.handler = "arn:aws:lambda:fake";
    const result = await LlmExeRouterHandler(mockEvent);

    expect(invokeFunction).toHaveBeenCalledWith({
      FunctionName: "arn:aws:lambda:fake",
      Payload: JSON.stringify(mergeInputsInOrder(mockRoutes.testRoute, mockPayload.data)),
    });
    expect(result).toEqual({
      event: mockEvent,
      response: "lambdaResult",
    });
  });

  it("calls startSyncExecution if route.handler starts with 'arn:aws:states'", async () => {
    mockRoutes.testRoute.handler = "arn:aws:states:fake";
    const result = await LlmExeRouterHandler(mockEvent);

    expect(startSyncExecution).toHaveBeenCalledWith({
      stateMachineArn: "arn:aws:states:fake",
      input: JSON.stringify(mergeInputsInOrder(mockRoutes.testRoute, mockPayload.data)),
    });
    expect(result).toEqual({
      event: mockEvent,
      response: "sfnResult",
    });
  });

  it("calls LlmExeHandler otherwise", async () => {
    mockRoutes.testRoute.handler = "someOtherString";
    const result = await LlmExeRouterHandler(mockEvent);

    expect(LlmExeHandler).toHaveBeenCalledWith({
      ...mockRoutes.testRoute,
      ...mockPayload.data,
    });
    expect(result).toEqual({
      event: mockEvent,
      response: "llmExeHandlerResult",
    });
  });

  it("calls LlmExeHandler if route.handler is missing (object but no handler)", async () => {
    mockRoutes.testRoute = {}; // an empty object
    const result = await LlmExeRouterHandler(mockEvent);

    expect(LlmExeHandler).toHaveBeenCalledWith({
      ...mockRoutes.testRoute,
      ...mockPayload.data,
    });
    expect(result).toEqual({
      event: mockEvent,
      response: "llmExeHandlerResult",
    });
  });

  it("returns an error in getOutputPayload if something in try block throws", async () => {
    (getLlmExeRouterHandlerInput as jest.Mock).mockRejectedValue(
      new Error("Something went wrong")
    );

    const result = await LlmExeRouterHandler(mockEvent);

    expect(result.response).toBeInstanceOf(Error);
    expect(result.response.message).toBe("Something went wrong");
  });
});