import { getKeyObjectFromProvidor } from "@/utils/getKeyObjectFromProvidor";
import { useLlm } from "llm-exe";
import { withLlmExeClient } from "./llm-exe";

jest.mock("@/utils/getKeyObjectFromProvidor", () => ({
  getKeyObjectFromProvidor: jest.fn(),
}));

jest.mock("llm-exe", () => ({
  useLlm: jest.fn(),
}));

describe("withLlmExeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call getKeyObjectFromProvidor with the correct provider", async () => {
    const mockOptions = { providor: "testProvider", model: "testModel" };
    
    (getKeyObjectFromProvidor as jest.Mock).mockResolvedValue({ apiKey: "testApiKey" });

    await withLlmExeClient(mockOptions);

    expect(getKeyObjectFromProvidor).toHaveBeenCalledWith(mockOptions.providor);
  });

  it("should call useLlm with the correct parameters", async () => {
    const mockOptions = { providor: "testProvider", model: "testModel" };
    const mockApiKey = { apiKey: "testApiKey" };
    
    (getKeyObjectFromProvidor as jest.Mock).mockResolvedValue(mockApiKey);

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
    const mockOptions = { providor: "testProvider", model: "testModel" };

    (getKeyObjectFromProvidor as jest.Mock).mockResolvedValue({ apiKey: "testApiKey" });
    (useLlm as jest.Mock).mockReturnValue(mockLlmClient);

    const result = await withLlmExeClient(mockOptions);

    expect(result).toBe(mockLlmClient);
  });

  it("should handle missing apiKey gracefully", async () => {
    const mockOptions = { providor: "testProvider", model: "testModel" };

    (getKeyObjectFromProvidor as jest.Mock).mockResolvedValue(null);

    await expect(withLlmExeClient(mockOptions)).resolves.toEqual({});
  });
});