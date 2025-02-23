import { withKey } from "@/clients/keychain";
import { getKeyObjectFromProvider } from "./getKeyObjectFromProvider";

jest.mock("@/clients/keychain", () => ({
  withKey: jest.fn(),
}));

describe("getKeyObjectFromProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return OpenAI API key if provider is OpenAI and key is found", async () => {
    const mockApiKey = "mockOpenAiApiKey";
    (withKey as jest.Mock).mockResolvedValue(mockApiKey);

    const result = await getKeyObjectFromProvider("openai.chat.v1");

    expect(withKey).toHaveBeenCalledWith("KeyOpenAI");
    expect(result).toEqual({ openAiApiKey: mockApiKey });
  });

  it("should throw an error if OpenAI key is not found", async () => {
    (withKey as jest.Mock).mockResolvedValue(null);

    await expect(getKeyObjectFromProvider("openai.chat.v1")).rejects.toThrow("OpenAI API Key not found");
    expect(withKey).toHaveBeenCalledWith("KeyOpenAI");
  });

  it("should return Anthropic API key if provider is Anthropic and key is found", async () => {
    const mockApiKey = "mockAnthropicApiKey";
    (withKey as jest.Mock).mockResolvedValue(mockApiKey);

    const result = await getKeyObjectFromProvider("anthropic.model.v1" as any);

    expect(withKey).toHaveBeenCalledWith("KeyAnthropic");
    expect(result).toEqual({ anthropicApiKey: mockApiKey });
  });

  it("should throw an error if Anthropic key is not found", async () => {
    (withKey as jest.Mock).mockResolvedValue(null);

    await expect(getKeyObjectFromProvider("anthropic.model.v1" as any)).rejects.toThrow("Anthropic API Key not found");
    expect(withKey).toHaveBeenCalledWith("KeyAnthropic");
  });

  it("should return an empty object if provider does not require a key", async () => {
    const result = await getKeyObjectFromProvider("unknown.provider" as any);

    expect(withKey).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});