import { withLlmExeClient } from "@/clients/llm-exe";
import { createParser, createLlmExecutor } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";
import { inputTextOutputString } from "./inputTextOutputString";

jest.mock("@/clients/llm-exe", () => ({
  withLlmExeClient: jest.fn(),
}));

jest.mock("llm-exe", () => ({
  createParser: jest.fn(),
  createLlmExecutor: jest.fn(),
}));

jest.mock("./inputTextPrompt", () => ({
  inputTextPrompt: jest.fn(),
}));

describe("inputTextOutputString", () => {
  const mockLlm = { apiKey: "test" };
  const mockPrompt = "mockPrompt";
  const mockParser = jest.fn();
  const mockExecutor = {
    execute: jest.fn(),
  };

  const mockMessages = "mockMessage";
  const mockOptions = {
    providor: "mockProvider",
    model: "mockModel",
    data: { key: "value" },
    debug: true,
  };
  const mockHistory: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    (withLlmExeClient as jest.Mock).mockResolvedValue(mockLlm);
    (inputTextPrompt as jest.Mock).mockReturnValue(mockPrompt);
    (createParser as jest.Mock).mockReturnValue(mockParser);
    (createLlmExecutor as jest.Mock).mockReturnValue(mockExecutor);
    mockExecutor.execute.mockResolvedValue("mockResult");
  });

  it("should call withLlmExeClient with correct config", async () => {
    await inputTextOutputString(mockMessages, mockOptions, mockHistory);
    expect(withLlmExeClient).toHaveBeenCalledWith({
      timeout: 30000,
      providor: mockOptions.providor,
      model: mockOptions.model,
    });
  });

  it("should create a prompt using inputTextPrompt", async () => {
    await inputTextOutputString(mockMessages, mockOptions, mockHistory);
    expect(inputTextPrompt).toHaveBeenCalledWith(mockMessages, mockHistory);
  });

  it("should create a parser of type 'string'", async () => {
    await inputTextOutputString(mockMessages, mockOptions, mockHistory);
    expect(createParser).toHaveBeenCalledWith("string");
  });

  it("should create an LLM executor with the correct parameters", async () => {
    await inputTextOutputString(mockMessages, mockOptions, mockHistory);
    expect(createLlmExecutor).toHaveBeenCalledWith(
      {
        llm: mockLlm,
        prompt: mockPrompt,
        parser: mockParser,
      },
      {
        hooks: {
          onComplete: expect.any(Function),
        },
      }
    );
  });

  it("should execute the LLM executor with provided data", async () => {
    await inputTextOutputString(mockMessages, mockOptions, mockHistory);
    expect(mockExecutor.execute).toHaveBeenCalledWith(mockOptions.data);
  });

  it("should execute the LLM executor with default empty data if no data is provided", async () => {
    const optionsWithoutData = { ...mockOptions, data: undefined };
    await inputTextOutputString(mockMessages, optionsWithoutData);
    expect(mockExecutor.execute).toHaveBeenCalledWith({});
  });

  it("should return the result of execution", async () => {
    const result = await inputTextOutputString(
      mockMessages,
      mockOptions,
      mockHistory
    );
    expect(result).toBe("mockResult");
  });

  it("should log the result if debug option is true", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    await inputTextOutputString(mockMessages, mockOptions);
    const onCompleteHook = (createLlmExecutor as jest.Mock).mock.calls[0][1]
      .hooks.onComplete;
    onCompleteHook({ resultKey: "resultValue" });
    expect(consoleSpy).toHaveBeenCalledWith({ resultKey: "resultValue" });
    consoleSpy.mockRestore();
  });
});
