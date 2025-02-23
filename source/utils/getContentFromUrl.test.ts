import { getContentFromUrl } from "./getContentFromUrl";

describe("getContentFromUrl", () => {
  const originalFetch = global.fetch;
  let clearTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    global.fetch = jest.fn();
    clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
    clearTimeoutSpy.mockRestore();
  });

  it("returns trimmed response text when fetch is successful", async () => {
    const fakeResponseText = "   some fetched data   ";
    const fakeResponse = {
      text: jest.fn().mockResolvedValueOnce(fakeResponseText),
    };
    const testUrl = "https://example.com/data";
    (global.fetch as jest.Mock).mockResolvedValueOnce(fakeResponse);

    const result = await getContentFromUrl(testUrl);

    // Verify that fetch was called once with the proper arguments and an AbortSignal in the options.
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
      signal: expect.any(Object),
    }));

    // Verify that the returned text is trimmed.
    expect(result).toBe(fakeResponseText.trim());

    // Verify that clearTimeout was called.
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it("throws an error when fetch fails", async () => {
    const testUrl = "https://example.com/error";
    const fakeError = new Error("Network error");
    (global.fetch as jest.Mock).mockRejectedValueOnce(fakeError);

    await expect(getContentFromUrl(testUrl)).rejects.toThrow(
      `Failed to fetch data from ${testUrl}`
    );

    // Verify that fetch was called with the proper options.
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
      signal: expect.any(Object),
    }));
    
    // Verify that clearTimeout was called even on error.
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });
});