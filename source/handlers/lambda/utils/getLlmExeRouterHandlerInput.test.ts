import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsWithLocal } from "@/utils/getS3ObjectAsWithLocal";
import { getLlmExeRoutes } from "./getLlmExeRoutes";
import { getLlmExeRouterHandlerInput } from "./getLlmExeRouterHandlerInput";

jest.mock("@/utils/getContentFromUrl", () => ({
  getContentFromUrl: jest.fn(),
}));

jest.mock("@/utils/getS3ObjectAsWithLocal", () => ({
  getS3ObjectAsWithLocal: jest.fn(),
}));

jest.mock("./getLlmExeRoutes", () => ({
  getLlmExeRoutes: jest.fn(),
}));

describe("getLlmExeRouterHandlerInput", () => {
  const mockParsedRoutes = { route: "parsed" };
  const mockS3Routes = { routeFromS3: true };

  beforeEach(() => {
    jest.clearAllMocks();
    (getContentFromUrl as jest.Mock).mockResolvedValue("{}");
    (getS3ObjectAsWithLocal as jest.Mock).mockResolvedValue(mockS3Routes);
    (getLlmExeRoutes as jest.Mock).mockReturnValue(mockParsedRoutes);
  });

  it("should fetch and parse router from a URL when payload.router is a string", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValue(
      JSON.stringify({ routerKey: "routerValue" })
    );
    const payload = { router: "http://example.com/router.json" };
    const result = await getLlmExeRouterHandlerInput(payload);

    expect(getContentFromUrl).toHaveBeenCalledWith(payload.router);
    expect(getLlmExeRoutes).toHaveBeenCalledWith({ routerKey: "routerValue" });
    expect(result).toEqual(mockParsedRoutes);
  });

  it("should throw an error if payload.router is a string but invalid JSON", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValue("invalid json");
    const payload = { router: "http://example.com/invalidRouter.json" };

    await expect(getLlmExeRouterHandlerInput(payload)).rejects.toThrow(
      "Invalid router"
    );
  });

  it("should use router as an object when payload.router is an object", async () => {
    const routerObject = { routerObjKey: "routerObjValue" };
    const payload = { router: routerObject };

    const result = await getLlmExeRouterHandlerInput(payload);
    expect(getLlmExeRoutes).toHaveBeenCalledWith(routerObject);
    expect(result).toEqual(mockParsedRoutes);
  });

  it("should fetch and parse routes from a URL when payload.routes is a string", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValue(
      JSON.stringify({ routesKey: "routesValue" })
    );
    const payload = { routes: "http://example.com/routes.json" };
    const result = await getLlmExeRouterHandlerInput(payload);

    expect(getContentFromUrl).toHaveBeenCalledWith(payload.routes);
    expect(getLlmExeRoutes).toHaveBeenCalledWith({ routesKey: "routesValue" });
    expect(result).toEqual(mockParsedRoutes);
  });

  it("should throw an error if payload.routes is a string but invalid JSON", async () => {
    (getContentFromUrl as jest.Mock).mockResolvedValue("still invalid");
    const payload = { routes: "http://example.com/invalidRoutes.json" };

    await expect(getLlmExeRouterHandlerInput(payload)).rejects.toThrow(
      "Invalid routes"
    );
  });

  it("should use routes as an object when payload.routes is an object", async () => {
    const routesObject = { routesObjKey: "routesObjValue" };
    const payload = { routes: routesObject };

    const result = await getLlmExeRouterHandlerInput(payload);
    expect(getLlmExeRoutes).toHaveBeenCalledWith(payload);
    expect(result).toEqual(mockParsedRoutes);
  });

  it("should fall back to S3 if neither router nor routes is provided", async () => {
    const payload = { someKey: "someValue" };
    const result = await getLlmExeRouterHandlerInput(payload);

    expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("routes.json", {
      format: "json",
    });
    expect(result).toEqual({ routes: mockS3Routes, data: payload });
  });

  it("should fall back to S3 if router is neither string nor object", async () => {
    const payload = { router: 12345 };
    const result = await getLlmExeRouterHandlerInput(payload);

    expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("routes.json", {
      format: "json",
    });
    expect(result).toEqual({ routes: mockS3Routes, data: payload });
  });

  it("should fall back to S3 if routes is neither string nor object", async () => {
    const payload = { routes: false };
    const result = await getLlmExeRouterHandlerInput(payload);

    expect(getS3ObjectAsWithLocal).toHaveBeenCalledWith("routes.json", {
      format: "json",
    });
    expect(result).toEqual({ routes: mockS3Routes, data: payload });
  });
});