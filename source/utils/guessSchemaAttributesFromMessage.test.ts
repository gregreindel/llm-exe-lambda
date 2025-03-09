import { guessSchemaAttributesFromMessage } from "./guessSchemaAttributesFromMessage";
import { inputTextPrompt } from "./inputTextPrompt";
import { parsePromptForTokens } from "./parsePromptForTokens";

jest.mock("./inputTextPrompt", () => ({
  inputTextPrompt: jest.fn(),
}));

jest.mock("./parsePromptForTokens", () => ({
  parsePromptForTokens: jest.fn(),
}));

describe("guessSchemaAttributesFromMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if prompt.messages is undefined", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({});
    expect(() => guessSchemaAttributesFromMessage("some message")).toThrow(
      "Invalid prompt.messages: expected an array"
    );
  });

  it("should throw an error if prompt.messages is not an array", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({ messages: "not an array" });
    expect(() => guessSchemaAttributesFromMessage("some message")).toThrow(
      "Invalid prompt.messages: expected an array"
    );
  });

  it("should return an empty array when prompt.messages is an empty array", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({ messages: [] });
    const result = guessSchemaAttributesFromMessage("some message");
    expect(result).toEqual([]);
  });

  it("should skip messages that are null or don't have a valid string content", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({
      messages: [
        null,
        { content: null },
        { content: 123 },
        { noContent: "test" },
      ],
    });
    // Even if parsePromptForTokens is provided, it should not be called because content is not a string.
    const result = guessSchemaAttributesFromMessage("some message");
    expect(result).toEqual([]);
    expect(parsePromptForTokens).not.toHaveBeenCalled();
  });

  it("should process messages with valid string content and include tokens if any", () => {
    // Setup: two messages, one returns tokens, one returns empty array.
    (inputTextPrompt as jest.Mock).mockReturnValue({
      messages: [
        { content: "This is message one." },
        { content: "Second message content." },
      ],
    });

    (parsePromptForTokens as jest.Mock)
      .mockImplementation((text: string) => {
        if (text === "This is message one.") {
          return ["tokenA", "tokenB"];
        }
        return [];
      });

    const result = guessSchemaAttributesFromMessage("input data");
    expect(result).toEqual(["tokenA", "tokenB"]);
    expect(parsePromptForTokens).toHaveBeenCalledTimes(2);
    expect(parsePromptForTokens).toHaveBeenNthCalledWith(1, "This is message one.");
    expect(parsePromptForTokens).toHaveBeenNthCalledWith(2, "Second message content.");
  });

  it("should accumulate tokens from multiple valid messages", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({
      messages: [
        { content: "Message one" },
        { content: "Message two" },
        { content: "Message three" },
      ],
    });

    (parsePromptForTokens as jest.Mock)
      .mockImplementation((text: string) => {
        if (text === "Message one") return ["a"];
        if (text === "Message two") return ["b", "c"];
        if (text === "Message three") return ["d"];
        return [];
      });

    const result = guessSchemaAttributesFromMessage("dummy");
    expect(result).toEqual(["a", "b", "c", "d"]);
    expect(parsePromptForTokens).toHaveBeenCalledTimes(3);
    expect(parsePromptForTokens).toHaveBeenNthCalledWith(1, "Message one");
    expect(parsePromptForTokens).toHaveBeenNthCalledWith(2, "Message two");
    expect(parsePromptForTokens).toHaveBeenNthCalledWith(3, "Message three");
  });

  it("should not add tokens if parsePromptForTokens returns an empty array", () => {
    (inputTextPrompt as jest.Mock).mockReturnValue({
      messages: [{ content: "No tokens here" }],
    });

    (parsePromptForTokens as jest.Mock).mockReturnValue([]);
    const result = guessSchemaAttributesFromMessage("dummy input");
    expect(result).toEqual([]);
    expect(parsePromptForTokens).toHaveBeenCalledWith("No tokens here");
  });

  it("should call inputTextPrompt with the provided message argument", () => {
    const testMessage = { some: "value" } as any;
    (inputTextPrompt as jest.Mock).mockReturnValue({ messages: [] });
    guessSchemaAttributesFromMessage(testMessage);
    expect(inputTextPrompt).toHaveBeenCalledWith(testMessage);
  });
});