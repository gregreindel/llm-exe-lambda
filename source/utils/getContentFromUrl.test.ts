import { getContentFromUrl } from "./getContentFromUrl";
import { parseS3Url } from "@/handlers/lambda/utils/parseS3Url";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";

jest.mock("@/handlers/lambda/utils/parseS3Url", () => ({
  parseS3Url: jest.fn(),
}));

jest.mock("@/utils/getS3ObjectAsWithLocal", () => ({
  getS3ObjectAsWithLocal: jest.fn(),
}));

describe("getContentFromUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("S3 URL handling", () => {
    it("returns trimmed content from S3", async () => {
      const s3Url = "s3://bucket/key?version=123";
      const parsed = { key: "key", bucket: "bucket", version: "123" };
      (parseS3Url as jest.Mock).mockReturnValue(parsed);
      (getS3ObjectAsWithLocal as jest.Mock).mockResolvedValue("  some content  ");

      const result = await getContentFromUrl(s3Url);

      expect(parseS3Url).toHaveBeenCalledWith(s3Url);
      expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("key", {
        format: "string",
        bucket: "bucket",
        version: "123",
      });
      expect(result).toBe("some content");
    });

    it("throws an error when S3 retrieval fails", async () => {
      const s3Url = "s3://bucket/key?version=123";
      const parsed = { key: "key", bucket: "bucket", version: "123" };
      (parseS3Url as jest.Mock).mockReturnValue(parsed);
      (getS3ObjectAsWithLocal as jest.Mock).mockRejectedValue(new Error("S3 failure"));

      await expect(getContentFromUrl(s3Url)).rejects.toThrow(`Failed to fetch data from ${s3Url}`);
      expect(parseS3Url).toHaveBeenCalledWith(s3Url);
      expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("key", {
        format: "string",
        bucket: "bucket",
        version: "123",
      });
    });
  });

  describe("HTTP URL handling", () => {
    const originalFetch = global.fetch;
    let clearTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
      clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    });

    afterEach(() => {
      global.fetch = originalFetch;
      clearTimeoutSpy.mockRestore();
    });

    it("returns trimmed content from HTTP fetch", async () => {
      const httpUrl = "https://example.com/data";
      const fakeResponse = {
        text: jest.fn().mockResolvedValue("  hello world  "),
      };
      global.fetch = jest.fn().mockResolvedValue(fakeResponse);

      const result = await getContentFromUrl(httpUrl);

      expect(global.fetch).toHaveBeenCalled();
      const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCallArgs[0]).toBe(httpUrl);
      expect(fetchCallArgs[1]).toHaveProperty("signal");
      expect(fakeResponse.text).toHaveBeenCalled();
      expect(result).toBe("hello world");
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("throws an error when HTTP fetch fails", async () => {
      const httpUrl = "https://example.com/failure";
      global.fetch = jest.fn().mockRejectedValue(new Error("Fetch error"));

      await expect(getContentFromUrl(httpUrl)).rejects.toThrow(`Failed to fetch data from ${httpUrl}`);
      expect(global.fetch).toHaveBeenCalledWith(httpUrl, expect.objectContaining({ signal: expect.any(AbortSignal) }));
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  it("aborts the fetch request immediately (mocked) to test timeout behavior", async () => {
    const httpUrl = "https://example.com/timeout";
  
    // Preserve originals
    const originalFetch = global.fetch;
    const originalSetTimeout = global.setTimeout;
  
    try {
      // Mock setTimeout to call abort callback immediately
      (global as any).setTimeout = jest.fn((callback) => {
        callback(); // Immediately aborts
        return 0;   // Simulate a timeout ID
      });
  
      // Mock fetch to simulate a never-resolving request unless aborted
      global.fetch = jest.fn((_url, { signal }: any) => {
        return new Promise((_resolve, reject) => {
          // If the signal is already aborted, reject immediately
          if (signal.aborted) {
            return reject(new Error("Aborted"));
          }
        });
      });
  
      // Validate that the function throws our expected error
      await expect(getContentFromUrl(httpUrl)).rejects.toThrow(
        `Failed to fetch data from ${httpUrl}`
      );
  
      // Ensure fetch was called with a signal
      expect(global.fetch).toHaveBeenCalledWith(
        httpUrl,
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    } finally {
      // Restore originals
      global.fetch = originalFetch;
      global.setTimeout = originalSetTimeout;
    }
  });

});