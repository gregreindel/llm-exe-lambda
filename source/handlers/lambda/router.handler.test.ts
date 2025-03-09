
import { LlmExeRouterHandler } from "./router";
import { handler } from "./router.handler";

jest.mock("./router", () => ({
  LlmExeRouterHandler: jest.fn(),
}));


describe("router", () => {
  const LlmExeRouterHandlerMock = LlmExeRouterHandler as jest.Mock;

  const mockResponse = { hello: "world" };

  const mockEvent = {
    body: "",
    headers: {},
    multiValueHeaders: {},
    httpMethod: "",
    isBase64Encoded: false,
    path: "",
    pathParameters: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    stageVariables: {},
    requestContext: {} as any,
    resource: "",
  }

  beforeEach(() => {
    LlmExeRouterHandlerMock.mockClear();
  });

  it("calls the handler", async () => {
    LlmExeRouterHandlerMock.mockResolvedValueOnce(mockResponse)
    const response = await handler(mockEvent);
    expect(LlmExeRouterHandlerMock).toBeCalledWith(mockEvent);
    expect(response).toEqual(mockResponse);
  });
});
