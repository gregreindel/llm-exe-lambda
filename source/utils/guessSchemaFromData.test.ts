import * as toJsonSchema from "to-json-schema";
import { guessSchemaFromData } from "./guessSchemaFromData"; // replace with actual file name

jest.mock("to-json-schema", () => jest.fn());

describe("guessSchemaFromData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call toJsonSchema with provided object and return its result", () => {
    const testData = { a: 1 };
    const expectedSchema = { type: "object", properties: { a: { type: "number" } } };
    (toJsonSchema as jest.Mock).mockReturnValue(expectedSchema);

    const result = guessSchemaFromData(testData);

    expect(toJsonSchema).toHaveBeenCalledWith(testData);
    expect(result).toEqual(expectedSchema);
  });

  it("should work with an empty object", () => {
    const testData = {};
    const expectedSchema = { type: "object", properties: {} };
    (toJsonSchema as jest.Mock).mockReturnValue(expectedSchema);

    const result = guessSchemaFromData(testData);

    expect(toJsonSchema).toHaveBeenCalledWith(testData);
    expect(result).toEqual(expectedSchema);
  });

  it("should work with nested objects", () => {
    const testData = { nested: { x: "value" } };
    const expectedSchema = {
      type: "object",
      properties: {
        nested: {
          type: "object",
          properties: { x: { type: "string" } },
        },
      },
    };
    (toJsonSchema as jest.Mock).mockReturnValue(expectedSchema);

    const result = guessSchemaFromData(testData);

    expect(toJsonSchema).toHaveBeenCalledWith(testData);
    expect(result).toEqual(expectedSchema);
  });

  it("should work with arrays inside an object", () => {
    const testData = { arr: [1, 2, 3] };
    const expectedSchema = {
      type: "object",
      properties: {
        arr: { type: "array", items: { type: "number" } },
      },
    };
    (toJsonSchema as jest.Mock).mockReturnValue(expectedSchema);

    const result = guessSchemaFromData(testData);

    expect(toJsonSchema).toHaveBeenCalledWith(testData);
    expect(result).toEqual(expectedSchema);
  });

  it("should call toJsonSchema with non-object input (e.g. a primitive) and return its result", () => {
    const testData: any = 123;
    const expectedSchema = { type: "number" };
    (toJsonSchema as jest.Mock).mockReturnValue(expectedSchema);

    const result = guessSchemaFromData(testData);

    expect(toJsonSchema).toHaveBeenCalledWith(testData);
    expect(result).toEqual(expectedSchema);
  });

  it("should propagate errors thrown by toJsonSchema", () => {
    const testData = { a: 1 };
    const error = new Error("Conversion failed");
    (toJsonSchema as jest.Mock).mockImplementation(() => {
      throw error;
    });

    expect(() => guessSchemaFromData(testData)).toThrow("Conversion failed");
  });
});