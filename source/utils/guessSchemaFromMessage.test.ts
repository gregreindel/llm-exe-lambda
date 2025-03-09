import { guessSchemaFromMessage } from "./guessSchemaFromMessage";
import { guessSchemaAttributesFromMessage } from "./guessSchemaAttributesFromMessage";
import { makeObjectSchemaFromAttributeNames } from "./makeObjectSchemaFromAttributeNames";

jest.mock("./guessSchemaAttributesFromMessage");
jest.mock("./makeObjectSchemaFromAttributeNames");

describe("guessSchemaFromMessage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should call guessSchemaAttributesFromMessage with the provided message", () => {
    const testMessage = "Test input message";
    (guessSchemaAttributesFromMessage as jest.Mock).mockReturnValue(["attr1", "attr2"]);
    (makeObjectSchemaFromAttributeNames as jest.Mock).mockReturnValue({ schema: "objectSchema" });

    guessSchemaFromMessage(testMessage);

    expect(guessSchemaAttributesFromMessage).toHaveBeenCalledWith(testMessage);
  });

  it("should call makeObjectSchemaFromAttributeNames with the attributes returned from guessSchemaAttributesFromMessage", () => {
    const testMessage = { content: "Some content" };
    const attributes = ["attributeA", "attributeB"];
    (guessSchemaAttributesFromMessage as jest.Mock).mockReturnValue(attributes);
    (makeObjectSchemaFromAttributeNames as jest.Mock).mockReturnValue({ type: "customSchema" });

    guessSchemaFromMessage(testMessage as any);

    expect(makeObjectSchemaFromAttributeNames).toHaveBeenCalledWith(attributes);
  });

  it("should return the object schema produced by makeObjectSchemaFromAttributeNames", () => {
    const testMessage = "Another test message";
    const objectSchema = { field: "value" };
    (guessSchemaAttributesFromMessage as jest.Mock).mockReturnValue(["x", "y"]);
    (makeObjectSchemaFromAttributeNames as jest.Mock).mockReturnValue(objectSchema);

    const result = guessSchemaFromMessage(testMessage);
    expect(result).toBe(objectSchema);
  });

  it("should propagate an error if guessSchemaAttributesFromMessage throws an error", () => {
    const testMessage = "Error triggering message";
    const error = new Error("Attribute extraction error");
    (guessSchemaAttributesFromMessage as jest.Mock).mockImplementation(() => {
      throw error;
    });

    expect(() => guessSchemaFromMessage(testMessage)).toThrow(error);
  });

  it("should propagate an error if makeObjectSchemaFromAttributeNames throws an error", () => {
    const testMessage = "Error in schema generation";
    (guessSchemaAttributesFromMessage as jest.Mock).mockReturnValue(["attrX"]);
    const error = new Error("Schema builder failure");
    (makeObjectSchemaFromAttributeNames as jest.Mock).mockImplementation(() => {
      throw error;
    });

    expect(() => guessSchemaFromMessage(testMessage)).toThrow(error);
  });
});