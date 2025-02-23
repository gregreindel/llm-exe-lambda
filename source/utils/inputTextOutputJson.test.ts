import { withLlmExeClient } from "@/clients/llm-exe";
import { createLlmExecutor, createParser } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";
import { inputTextOutputJson } from "./inputTextOutputJson";

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

describe("inputTextOutputJson", () => {
  const mockLlm = { apiKey: "test" };
  const mockPrompt = "mockPrompt";
  const mockParser = jest.fn();
  const mockExecutor = {
    execute: jest.fn(),
  };

  const mockMessages = "mockMessage";
  const mockOptions = {
    schema: { key: "value" },
    provider: "mockProvider",
    model: "mockModel",
    data: { additionalKey: "additionalValue" },
    debug: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (withLlmExeClient as jest.Mock).mockResolvedValue(mockLlm);
    (inputTextPrompt as jest.Mock).mockReturnValue(mockPrompt);
    (createParser as jest.Mock).mockReturnValue(mockParser);
    (createLlmExecutor as jest.Mock).mockReturnValue(mockExecutor);
    mockExecutor.execute.mockResolvedValue({ resultKey: "resultValue" });
  });

  it("should call withLlmExeClient with correct config", async () => {
    await inputTextOutputJson(mockMessages, mockOptions);
    expect(withLlmExeClient).toHaveBeenCalledWith({
      useJson: true,
      timeout: 30000,
      provider: mockOptions.provider,
      model: mockOptions.model,
    });
  });

  it("should create a prompt using inputTextPrompt with json argument", async () => {
    await inputTextOutputJson(mockMessages, mockOptions);
    expect(inputTextPrompt).toHaveBeenCalledWith(mockMessages, [], true);
  });

  it("should create a parser of type 'json' with schema", async () => {
    await inputTextOutputJson(mockMessages, mockOptions);
    expect(createParser).toHaveBeenCalledWith("json", { schema: mockOptions.schema });
  });

  it("should execute the LLM executor with default empty data if no data is provided", async () => {
    const optionsWithoutData = { ...mockOptions, data: undefined };
    await inputTextOutputJson(mockMessages, optionsWithoutData);
    expect(mockExecutor.execute).toHaveBeenCalledWith(
      Object.assign({}, {}, { schema: optionsWithoutData.schema })
    );
  });

  it("should create an LLM executor with the correct parameters", async () => {
    await inputTextOutputJson(mockMessages, mockOptions);
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

  it("should execute the LLM executor with provided data and schema", async () => {
    await inputTextOutputJson(mockMessages, mockOptions);
    expect(mockExecutor.execute).toHaveBeenCalledWith(
      Object.assign({}, mockOptions.data, { schema: mockOptions.schema })
    );
  });

  it("should return the result of execution as a JSON object", async () => {
    const result = await inputTextOutputJson(mockMessages, mockOptions);
    expect(result).toEqual({ resultKey: "resultValue" });
  });

  it("should log the result if debug option is true", async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await inputTextOutputJson(mockMessages, mockOptions);
    const onCompleteHook = (createLlmExecutor as jest.Mock).mock.calls[0][1].hooks.onComplete;
    onCompleteHook({ resultKey: "resultValue" });
    expect(consoleSpy).toHaveBeenCalledWith({ resultKey: "resultValue" });
    consoleSpy.mockRestore();
  });
});