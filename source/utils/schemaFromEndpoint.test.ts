import { schemaFromRoutes } from "./schemaFromEndpoint";
import { isInputValid } from "@/handlers/lambda/utils/assertPayloadIsValid";
import { getLlmExeHandlerInput } from "@/handlers/lambda/utils/getLlmExeHandlerInput";
import { mergeInputsInOrder } from "./mergeInputsInOrder";
import { schemaEndpointFromRoute } from "./schemaEndpointFromRoute";
import { LlmExeRouterConfig } from "@/types";

jest.mock("@/handlers/lambda/utils/assertPayloadIsValid", () => ({
  isInputValid: jest.fn(),
}));

jest.mock("@/handlers/lambda/utils/getLlmExeHandlerInput", () => ({
  getLlmExeHandlerInput: jest.fn(),
}));

jest.mock("./mergeInputsInOrder", () => ({
  mergeInputsInOrder: jest.fn(),
}));

jest.mock("./schemaEndpointFromRoute", () => ({
  schemaEndpointFromRoute: jest.fn(),
}));

describe("schemaFromRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return base object with default info if config has no title, version, or description", async () => {
    const config: LlmExeRouterConfig = {
      routes: {},
      // no title, version, description
    } as any;

    const result = await schemaFromRoutes(config);

    expect(result).toEqual({
      openapi: "3.0.0",
      info: {
        title: "LlmExe Tools API",
        version: "1.0.0",
        description: "LlmExe Tools API",
      },
      paths: {},
    });
  });

  it("should return base object with provided info if config has title, version, and description", async () => {
    const config: LlmExeRouterConfig = {
      title: "My Title",
      version: "2.0.0",
      description: "My Description",
      routes: {},
    };

    const result = await schemaFromRoutes(config);

    expect(result).toMatchObject({
      openapi: "3.0.0",
      info: {
        title: "My Title",
        version: "2.0.0",
        description: "My Description",
      },
      paths: {},
    });
  });

  it("should handle a route with a handler by merging empty object and calling schemaEndpointFromRoute", async () => {
    const mockRoute = {
      handler: jest.fn(),
    };
    const mockSchema = { some: "schema" };
    (mergeInputsInOrder as jest.Mock).mockReturnValue({});
    (schemaEndpointFromRoute as jest.Mock).mockReturnValue(mockSchema);

    const config: LlmExeRouterConfig = {
      routes: {
        "/test": mockRoute as any,
      },
    };

    const result = await schemaFromRoutes(config);

    expect(mergeInputsInOrder).toHaveBeenCalledWith(mockRoute, {});
    expect(schemaEndpointFromRoute).toHaveBeenCalledWith({});
    expect(result.paths["/test"]).toEqual(mockSchema);
  });

  it("should handle a route with no handler but valid input", async () => {
    const mockRoute = {};
    const mockInput = { valid: true };
    const mockMerged = { merged: true };
    const mockSchema = { some: "schema" };

    (getLlmExeHandlerInput as jest.Mock).mockResolvedValue(mockInput);
    (isInputValid as unknown as jest.Mock).mockReturnValue(true);
    (mergeInputsInOrder as jest.Mock).mockReturnValue(mockMerged);
    (schemaEndpointFromRoute as jest.Mock).mockReturnValue(mockSchema);

    const config: LlmExeRouterConfig = {
      routes: {
        "/noHandler": mockRoute as any,
      },
    };

    const result = await schemaFromRoutes(config);

    expect(getLlmExeHandlerInput).toHaveBeenCalledWith(mockRoute);
    expect(isInputValid).toHaveBeenCalledWith(mockInput);
    expect(mergeInputsInOrder).toHaveBeenCalledWith(mockRoute, mockInput);
    expect(schemaEndpointFromRoute).toHaveBeenCalledWith(mockMerged);
    expect(result.paths["/noHandler"]).toBe(mockSchema);
  });

  it("should handle a route with no handler but invalid input and log a warning", async () => {
    const mockRoute = {};
    const mockInput = { invalid: true };

    (getLlmExeHandlerInput as jest.Mock).mockResolvedValue(mockInput);
    (isInputValid as unknown as jest.Mock).mockReturnValue(false);

    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    const config: LlmExeRouterConfig = {
      routes: {
        "/invalid": mockRoute as any,
      },
    };

    const result = await schemaFromRoutes(config);

    expect(getLlmExeHandlerInput).toHaveBeenCalledWith(mockRoute);
    expect(isInputValid).toHaveBeenCalledWith(mockInput);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Warning: input not valid",
      mockInput
    );
    // Should not add a path for invalid input
    expect(result.paths["/invalid"]).toBeUndefined();

    consoleWarnSpy.mockRestore();
  });

  it("should skip route if route is undefined", async () => {
    const config: LlmExeRouterConfig = {
      routes: {
        "/undefined": undefined as any,
      },
    };
    const result = await schemaFromRoutes(config);
    expect(result.paths["/undefined"]).toBeUndefined();
  });

  it("should handle multiple routes", async () => {
    const routeWithHandler = { handler: jest.fn() };
    const routeWithoutHandler = {};
    const validInput = { foo: "bar" };
    const schema1 = { schema: "handlerRoute" };
    const schema2 = { schema: "noHandlerRoute" };

    (mergeInputsInOrder as jest.Mock).mockReturnValueOnce(schema1); // for handler
    (mergeInputsInOrder as jest.Mock).mockReturnValueOnce(schema2); // for no handler
    (schemaEndpointFromRoute as jest.Mock)
      .mockReturnValueOnce(schema1)
      .mockReturnValueOnce(schema2);

    (getLlmExeHandlerInput as jest.Mock).mockResolvedValue(validInput);
    (isInputValid as unknown as jest.Mock).mockReturnValue(true);

    const config: LlmExeRouterConfig = {
      routes: {
        "/handler": routeWithHandler as any,
        "/nohandler": routeWithoutHandler as any,
      },
    };

    const result = await schemaFromRoutes(config);

    expect(result.paths["/handler"]).toEqual(schema1);
    expect(result.paths["/nohandler"]).toEqual(schema2);
  });

  it("should propagate an error if getLlmExeHandlerInput throws", async () => {
    const mockRoute = {};
    (getLlmExeHandlerInput as jest.Mock).mockRejectedValue(
      new Error("Failed to get input")
    );

    const config: LlmExeRouterConfig = {
      routes: {
        "/throw": mockRoute as any,
      },
    };

    await expect(schemaFromRoutes(config)).rejects.toThrow("Failed to get input");
  });
});