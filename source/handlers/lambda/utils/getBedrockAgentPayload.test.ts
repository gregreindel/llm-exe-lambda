import { getBedrockAgentPayload } from "./getBedrockAgentPayload";
import { convertNameTypeValueArrayToObject } from "@/utils/convertNameTypeValueArrayToObject";

jest.mock("@/utils/convertNameTypeValueArrayToObject", () => ({
  convertNameTypeValueArrayToObject: jest.fn(),
}));

describe("getBedrockAgentPayload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call convertNameTypeValueArrayToObject and return its result when application/json exists", () => {
    const propertiesMock = [{ name: "foo", type: "string", value: "bar" }];
    const event = {
      requestBody: {
        content: {
          "application/json": {
            properties: propertiesMock,
          },
        },
      },
    };
    // Set the mock to return a specific object.
    (convertNameTypeValueArrayToObject as jest.Mock).mockReturnValue({
      foo: "bar",
    });
    const result = getBedrockAgentPayload(event);
    expect(convertNameTypeValueArrayToObject).toHaveBeenCalledWith(
      propertiesMock
    );
    expect(result).toEqual({ foo: "bar" });
  });

  it("should return an empty object when application/json key is missing", () => {
    const event = {
      requestBody: {
        content: {
          "text/plain": {
            properties: [{ name: "a", type: "number", value: 1 }],
          },
        },
      },
    };
    const result = getBedrockAgentPayload(event);
    expect(convertNameTypeValueArrayToObject).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it("should return an empty object when application/json exists but is falsy", () => {
    const event = {
      requestBody: {
        content: {
          "application/json": null,
        },
      },
    };
    const result = getBedrockAgentPayload(event);
    expect(convertNameTypeValueArrayToObject).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  // Testing potential misuse/trick cases
  it("should throw an error if requestBody is missing", () => {
    const event = {};
    expect(() => getBedrockAgentPayload(event as any)).toThrow();
  });

  it("should throw an error if content is missing in requestBody", () => {
    const event = {
      requestBody: {},
    };
    expect(() => getBedrockAgentPayload(event as any)).toThrow();
  });

  it("should throw an error if content is not an object", () => {
    const event = {
      requestBody: {
        content: "not-an-object",
      },
    };
    expect(getBedrockAgentPayload(event as any)).toEqual({});
  });
});
