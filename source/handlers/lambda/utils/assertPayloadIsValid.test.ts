import { assertMessageIsValid } from "./assertMessageIsValid";
import { isInputValid } from "./assertPayloadIsValid";

// Mock dependencies
jest.mock("./assertMessageIsValid");

describe("isInputValid", () => {
  const mockMessage = { id: "message-id", content: "Hello world" };
  const validEvent = {
    message: mockMessage,
    model: "gpt-3.5-turbo",
    provider: "openai",
    output: "text",
  };
  
  const assertMessageIsValidMock = assertMessageIsValid as jest.MockedFunction<
    typeof assertMessageIsValid
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if event is null or undefined", () => {
    expect(() => isInputValid(null)).toThrow("Invalid event");
    expect(() => isInputValid(undefined)).toThrow("Invalid event");
  });

  it("should throw an error if message is missing", () => {
    const event = { ...validEvent, message: undefined };
    expect(() => isInputValid(event)).toThrow("Invalid message");
  });

  it("should call assertMessageIsValid with the message", () => {
    isInputValid(validEvent);
    expect(assertMessageIsValidMock).toHaveBeenCalledWith(mockMessage);
  });

  it("should throw an error if model is missing", () => {
    const event = { ...validEvent, model: undefined };
    expect(() => isInputValid(event)).toThrow("Invalid model");
  });

  it("should throw an error if provider is missing or invalid", () => {
    const invalidProviders = ["", "invalid", "google"];
    invalidProviders.forEach((provider) => {
      const event = { ...validEvent, provider };
      expect(() => isInputValid(event)).toThrow("Invalid provider type");
    });
  });

  it("should throw an error if output type is missing", () => {
    const event = { ...validEvent, output: undefined };
    expect(() => isInputValid(event)).toThrow("Invalid output type");
  });

  it("should throw an error if output type is 'json' but schema is missing", () => {
    const event = { ...validEvent, output: "json", schema: undefined };
    expect(() => isInputValid(event)).toThrow("Output type of json requires schema");
  });

  it("should return true for a valid event", () => {
    expect(isInputValid(validEvent)).toBe(true);
  });

  it("should return true for a valid event with output type 'json' and a schema", () => {
    const event = { ...validEvent, output: "json", schema: {} };
    expect(isInputValid(event)).toBe(true);
  });
});