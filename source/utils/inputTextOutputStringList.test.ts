import { withLlmExeClient } from "@/clients/llm-exe";
import { createParser, createLlmExecutor } from "llm-exe";
import { inputTextPrompt } from "./inputTextPrompt";
import { inputTextOutputStringList } from "./inputTextOutputStringList";

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

describe("inputTextOutputStringList", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (withLlmExeClient as jest.Mock).mockResolvedValue(mockLlm);
    (inputTextPrompt as jest.Mock).mockReturnValue(mockPrompt);
    (createParser as jest.Mock).mockReturnValue(mockParser);
    (createLlmExecutor as jest.Mock).mockReturnValue(mockExecutor);
    mockExecutor.execute.mockResolvedValue(["mockResult1", "mockResult2"]);
  });

  it("should call withLlmExeClient with correct config", async () => {
    await inputTextOutputStringList(mockMessages, mockOptions);
    expect(withLlmExeClient).toHaveBeenCalledWith({
      timeout: 30000,
      providor: mockOptions.providor,
      model: mockOptions.model,
    });
  });

  it("should create a prompt using inputTextPrompt", async () => {
    await inputTextOutputStringList(mockMessages, mockOptions);
    expect(inputTextPrompt).toHaveBeenCalledWith(mockMessages);
  });

  it("should create a parser of type 'listToArray'", async () => {
    await inputTextOutputStringList(mockMessages, mockOptions);
    expect(createParser).toHaveBeenCalledWith("listToArray");
  });

  it("should create an LLM executor with the correct parameters", async () => {
    await inputTextOutputStringList(mockMessages, mockOptions);
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
    await inputTextOutputStringList(mockMessages, mockOptions);
    expect(mockExecutor.execute).toHaveBeenCalledWith(mockOptions.data);
  });

  it("should execute the LLM executor with default empty data if no data is provided", async () => {
    const optionsWithoutData = { ...mockOptions, data: undefined };
    await inputTextOutputStringList(mockMessages, optionsWithoutData);
    expect(mockExecutor.execute).toHaveBeenCalledWith({});
  });

  it("should return the result of execution as an array", async () => {
    const result = await inputTextOutputStringList(mockMessages, mockOptions);
    expect(result).toEqual(["mockResult1", "mockResult2"]);
  });

  it("should log the result if debug option is true", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    await inputTextOutputStringList(mockMessages, mockOptions);
    const onCompleteHook = (createLlmExecutor as jest.Mock).mock.calls[0][1]
      .hooks.onComplete;
    onCompleteHook({ resultKey: "resultValue" });
    expect(consoleSpy).toHaveBeenCalledWith({ resultKey: "resultValue" });
    consoleSpy.mockRestore();
  });
});