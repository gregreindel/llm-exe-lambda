import { schemaEndpointFromRoute } from "./schemaEndpointFromRoute";
import { guessSchemaFromMessage } from "./guessSchemaFromMessage";
import { guessSchemaFromData } from "./guessSchemaFromData";

jest.mock("./guessSchemaFromMessage", () => ({
  guessSchemaFromMessage: jest.fn(),
}));

jest.mock("./guessSchemaFromData", () => ({
  guessSchemaFromData: jest.fn(),
}));

describe("schemaEndpointFromRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a basic 'post' endpoint with defaults if no fields are provided", () => {
    const route: any = {}; // empty route
    const path = "test"
    const result = schemaEndpointFromRoute(path, route);
    expect(result).toHaveProperty("post");
    const post = result.post;
    expect(post.operationId).toBe("test_post");
    expect(post.summary).toBe("test");
    expect(post.description).toBe("POST test");
    expect(post.requestBody).toEqual({
      required: true,
      content: {
        "text/plain": { schema: { type: "string" } },
      },
    });
    expect(post.responses).toEqual({
      "200": {
        description: "Success",
        content: {
          "text/plain": { schema: { type: "string" } },
        },
      },
    });
    expect(guessSchemaFromMessage).not.toHaveBeenCalled();
  });

  it("should set summary, description, operationId from route if provided", () => {
    const path = "test"
    const route: any = {
      summary: "Test Summary",
      description: "Test Description",
      operationId: "testOperation",
    };
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;
    expect(post.summary).toBe("Test Summary");
    expect(post.description).toBe("Test Description");
    expect(post.operationId).toBe("testOperation");
  });

  it("should use inputSchema when route.inputSchema is provided and ignore route.message", () => {
    const path = "test"
    const route: any = {
      inputSchema: { type: "object", properties: { foo: { type: "string" } } },
      message: "ignored message",
    };
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;
    expect(post.requestBody).toEqual({
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", properties: { foo: { type: "string" } } },
        },
      },
    });
    expect(guessSchemaFromMessage).not.toHaveBeenCalled();
  });

  it("should call guessSchemaFromMessage and set its result if route.message is provided without inputSchema", () => {
    (guessSchemaFromMessage as jest.Mock).mockReturnValue({
      type: "object",
      properties: { guessed: { type: "string" } },
    });
    const path = "test"
    const route: any = {
      message: "Sample message",
    };
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;

    expect(guessSchemaFromMessage).toHaveBeenCalledWith("Sample message");
    expect(post.requestBody).toEqual({
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", properties: { guessed: { type: "string" } } },
        },
      },
    });
  });

  it("should call guessSchemaFromData and set its result if route.data is provided without inputSchema", () => {
    (guessSchemaFromData as jest.Mock).mockReturnValue({
      type: "object",
      properties: { hello: { type: "string" } },
    });
    const path = "test"
    const route: any = {
      data: { hello: "world"},
    };
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;

    expect(guessSchemaFromData).toHaveBeenCalledWith({ hello: "world"});
    expect(post.requestBody).toEqual({
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", properties: { hello: { type: "string" } } },
        },
      },
    });
  });

  it("should use route.schema in the 200 response if provided", () => {
    const route: any = {
      schema: { type: "array", items: { type: "number" } },
    };
    const path = "test"
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;
    expect(post.responses["200"].content).toEqual({
      "application/json": {
        schema: { type: "array", items: { type: "number" } },
      },
    });
  });

  it("should default to text/plain in the 200 response if route.schema is not provided", () => {
    const route: any = {};
    const path = "test"
    const result = schemaEndpointFromRoute(path, route);
    expect(result.post.responses["200"].content).toEqual({
      "text/plain": { schema: { type: "string" } },
    });
  });

  it("should handle route with all fields present (inputSchema, schema, etc.)", () => {
    const route: any = {
      summary: "Full Test",
      description: "Description of full test",
      operationId: "fullTestOp",
      inputSchema: { type: "object", properties: { testProp: { type: "integer" } } },
      message: "Should not be called because inputSchema is present",
      schema: { type: "object", properties: { result: { type: "boolean" } } },
    };
    const path = "test"
    const result = schemaEndpointFromRoute(path, route);
    const post = result.post;

    expect(post.summary).toBe("Full Test");
    expect(post.description).toBe("Description of full test");
    expect(post.operationId).toBe("fullTestOp");

    // inputSchema should take precedence over message
    expect(post.requestBody.content).toEqual({
      "application/json": {
        schema: { type: "object", properties: { testProp: { type: "integer" } } },
      },
    });
    expect(guessSchemaFromMessage).not.toHaveBeenCalled();

    // route.schema should be used for response
    expect(post.responses["200"].content).toEqual({
      "application/json": {
        schema: { type: "object", properties: { result: { type: "boolean" } } },
      },
    });
  });

  it("should not fail if inputSchema is something unexpected; it just sets that as schema", () => {
    // Trying to trick the function
    const invalidInputSchema = "I'm not a JSON schema object at all" as any;
    const route: any = {
      inputSchema: invalidInputSchema,
    };
    const path = "test"

    const result = schemaEndpointFromRoute(path,route);
    expect(result.post.requestBody.content).toEqual({
      "application/json": {
        schema: invalidInputSchema,
      },
    });
    // The function doesn't validate inputSchema, so no error expected
  });

  it("should not fail if route.message is non-string; guessSchemaFromMessage is just called", () => {
    (guessSchemaFromMessage as jest.Mock).mockReturnValue({
      type: "object",
      properties: { guessed: { type: "string" } },
    });
    const route: any = {
      message: 12345, // not a string
    };
    const path = "test"
    const result = schemaEndpointFromRoute(path, route);
    expect(guessSchemaFromMessage).toHaveBeenCalledWith(12345);
    expect(result.post.requestBody.content).toEqual({
      "application/json": {
        schema: { type: "object", properties: { guessed: { type: "string" } } },
      },
    });
  });
});