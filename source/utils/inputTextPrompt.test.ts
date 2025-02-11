import { createChatPrompt } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";

jest.mock("llm-exe", () => ({
  createChatPrompt: jest.fn(() => ({
    addSystemMessage: jest.fn(),
    addUserMessage: jest.fn(),
    addAssistantMessage: jest.fn(),
    addFromHistory: jest.fn(),
  })),
}));

describe("inputTextPrompt", () => {
  const mockPromptInstance = createChatPrompt();

  beforeEach(() => {
    jest.clearAllMocks();
    (createChatPrompt as jest.Mock).mockReturnValue(mockPromptInstance);
  });

  it("should create a prompt with system message as string", () => {
    const message = "Test system message";

    inputTextPrompt(message);

    expect(mockPromptInstance.addSystemMessage).toHaveBeenCalledWith(message);
  });

  it("should append schema string to system message if addSchemaToSystem is true", () => {
    const message = "Test system message";
    const expectedMessage = `${message}\n\nThe schema specification below defines the format you are expected to respond with.\n{{>JsonSchema key='schema'}}\n\nReview the request and then respond as valid JSON per the schema. For example:\n{{>JsonSchemaExampleJson key='schema'}}`;

    inputTextPrompt(message, [], true);

    expect(mockPromptInstance.addSystemMessage).toHaveBeenCalledWith(expectedMessage);
  });

  it("should add messages as system, user, and assistant messages from array", () => {
    const messages = ["system message", "user message", "assistant message"];

    inputTextPrompt(messages);

    expect(mockPromptInstance.addSystemMessage).toHaveBeenCalledWith(messages[0]);
    expect(mockPromptInstance.addUserMessage).toHaveBeenCalledWith(messages[1]);
    expect(mockPromptInstance.addAssistantMessage).toHaveBeenCalledWith(messages[2]);
  });

  it("should add messages from objects with roles", () => {
    const messages = [
      { role: "system", content: "system content" },
      { role: "user", content: "user content" },
    ];

    inputTextPrompt(messages);

    expect(mockPromptInstance.addFromHistory).toHaveBeenCalledWith(messages);
  });

  it("should append schema to first message content if messages are objects and addSchemaToSystem is true", () => {
    const messages = [
      { role: "system", content: "system content" },
      { role: "user", content: "user content" },
    ];
    const expectedMessage = `${messages[0].content}\n\nThe schema specification below defines the format you are expected to respond with.\n{{>JsonSchema key='schema'}}\n\nReview the request and then respond as valid JSON per the schema. For example:\n{{>JsonSchemaExampleJson key='schema'}}`;
    messages[0].content = expectedMessage;

    inputTextPrompt(messages, [], true);

    expect(mockPromptInstance.addFromHistory).toHaveBeenCalledWith(messages);
  });

  it("should add history if provided", () => {
    const history = [
      { role: "system", content: "previous system content" },
      { role: "user", content: "previous user content" },
    ];

    inputTextPrompt("Test message", history);

    expect(mockPromptInstance.addFromHistory).toHaveBeenCalledWith(history);
  });

  it("should append schema string to the system message when messages array contains a system message and addSchemaToSystem is true", () => {
    const messages = ["system message", "user message", "assistant message"];
    const expectedSystemMessage = `${messages[0]}\n\nThe schema specification below defines the format you are expected to respond with.\n{{>JsonSchema key='schema'}}\n\nReview the request and then respond as valid JSON per the schema. For example:\n{{>JsonSchemaExampleJson key='schema'}}`;

    inputTextPrompt(messages, [], true);

    expect(mockPromptInstance.addSystemMessage).toHaveBeenCalledWith(expectedSystemMessage);
    expect(mockPromptInstance.addUserMessage).toHaveBeenCalledWith(messages[1]);
    expect(mockPromptInstance.addAssistantMessage).toHaveBeenCalledWith(messages[2]);
  });
});