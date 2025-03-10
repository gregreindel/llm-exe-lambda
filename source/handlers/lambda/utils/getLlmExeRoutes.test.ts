import { getLlmExeRoutes } from "./getLlmExeRoutes";
import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { LlmExeRouterConfig } from "@/types";

jest.mock("@/utils/getContentFromUrl", () => ({
  getContentFromUrl: jest.fn(),
}));

jest.mock("@/utils/getS3ObjectAsWithLocal", () => ({
  getS3ObjectAsWithLocal: jest.fn(),
}));

describe("getLlmExeRoutes", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should parse 'routes' string from payload and return parsed routes + remainder of payload as data", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ someRoute: "someValue" })
    );

    const payload = {
      routes: "http://example.com/routes.json",
      extraKey: "extraValue",
    };

    const result = await getLlmExeRoutes(payload);

    expect(getContentFromUrl).toHaveBeenCalledWith(
      "http://example.com/routes.json"
    );
    expect(result).toEqual({
      routes: { someRoute: "someValue" },
      data: { extraKey: "extraValue" },
    });
  });

  it("should throw 'Invalid routes config' if JSON parsing fails", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValueOnce("invalid-json");

    const payload = { routes: "http://example.com/routes.json" };

    await expect(getLlmExeRoutes(payload)).rejects.toThrow(
      "Invalid routes config"
    );
  });

  it("should return routes if routes is an object", async () => {
    const payload = {
      routes: { routeObj: "someObjValue" },
      other: "otherValue",
    };

    const result = await getLlmExeRoutes(payload);

    expect(result).toEqual({
      routes: { routeObj: "someObjValue" },
      data: { other: "otherValue" },
    });
  });

  it("should fetch routes from S3 if no 'routes' in payload", async () => {
    const mockS3Result: LlmExeRouterConfig = {
      someRoute: { prompt: "testPrompt" },
    } as any
    (getS3ObjectAsWithLocal as jest.Mock).mockResolvedValueOnce(mockS3Result);

    const payload = { randomKey: "randomValue" };
    const result = await getLlmExeRoutes(payload);

    expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("routes.json", {
      format: "json",
    });
    expect(result).toEqual({
      routes: mockS3Result,
      data: { randomKey: "randomValue" },
    });
  });

  it("should throw 'Invalid routes' if routes is not a string or object (e.g., number)", async () => {
    const payload = { routes: 42 };

    await expect(getLlmExeRoutes(payload)).rejects.toThrow("Invalid routes");
  });

  it("should throw 'Invalid routes' if routes is null", async () => {
    const payload = { routes: null };

    await expect(getLlmExeRoutes(payload)).rejects.toThrow("Invalid routes");
  });

  it("should throw 'Invalid routes' if routes property exists but is undefined", async () => {
    const payload = { routes: undefined };

    await expect(getLlmExeRoutes(payload)).rejects.toThrow("Invalid routes");
  });

  it("should throw an error if the routes string is empty", async () => {
    const payload = { routes: "   " };
    await expect(getLlmExeRoutes(payload)).rejects.toThrow(
      "Routes string cannot be empty"
    );
  });
});