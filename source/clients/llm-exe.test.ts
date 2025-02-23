import { getKeyObjectFromProvider } from "@/utils/getKeyObjectFromProvider";
import { useLlm } from "llm-exe";
import { withLlmExeClient } from "./llm-exe";

jest.mock("@/utils/getKeyObjectFromProvider", () => ({
  getKeyObjectFromProvider: jest.fn(),
}));

jest.mock("llm-exe", () => ({
  useLlm: jest.fn(),
}));

describe("withLlmExeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call getKeyObjectFromProvider with the correct provider", async () => {
    const mockOptions = { provider: "testProvider", model: "testModel" };
    
    (getKeyObjectFromProvider as jest.Mock).mockResolvedValue({ apiKey: "testApiKey" });

    await withLlmExeClient(mockOptions);

    expect(getKeyObjectFromProvider).toHaveBeenCalledWith(mockOptions.provider);
  });

  it("should call useLlm with the correct parameters", async () => {
    const mockOptions = { provider: "testProvider", model: "testModel" };
    const mockApiKey = { apiKey: "testApiKey" };
    
    (getKeyObjectFromProvider as jest.Mock).mockResolvedValue(mockApiKey);

    await withLlmExeClient(mockOptions);

    expect(useLlm).toHaveBeenCalledWith(
      "testProvider",
      {
        timeout: 60000,
        model: "testModel",
        ...mockApiKey
      }
    );
  });

  it("should return the LLM client", async () => {
    const mockLlmClient = {};
    const mockOptions = { provider: "testProvider", model: "testModel" };

    (getKeyObjectFromProvider as jest.Mock).mockResolvedValue({ apiKey: "testApiKey" });
    (useLlm as jest.Mock).mockReturnValue(mockLlmClient);

    const result = await withLlmExeClient(mockOptions);

    expect(result).toBe(mockLlmClient);
  });

  it("should handle missing apiKey gracefully", async () => {
    const mockOptions = { provider: "testProvider", model: "testModel" };

    (getKeyObjectFromProvider as jest.Mock).mockResolvedValue(null);

    await expect(withLlmExeClient(mockOptions)).resolves.toEqual({});
  });
});