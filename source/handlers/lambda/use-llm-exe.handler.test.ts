
import { LlmExeHandler } from "./use-llm-exe";
import { handler } from "./use-llm-exe.handler";

jest.mock("./use-llm-exe", () => ({
  LlmExeHandler: jest.fn(),
}));


describe("use-llm-exe", () => {
  const LlmExeHandlerMock = LlmExeHandler as jest.Mock;

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
    LlmExeHandlerMock.mockClear();
  });

  it("calls the handler", async () => {
    LlmExeHandlerMock.mockResolvedValueOnce(mockResponse)
    const response = await handler(mockEvent);
    expect(LlmExeHandlerMock).toBeCalledWith(mockEvent);
    expect(response).toEqual(mockResponse);
  });
});
