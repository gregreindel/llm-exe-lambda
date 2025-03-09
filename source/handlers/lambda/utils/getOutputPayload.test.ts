import { getOutputPayload } from "./getOutputPayload";
import { lambdaEventType } from "@/utils/lambdaEventType";

jest.mock("@/utils/lambdaEventType", () => ({
  lambdaEventType: jest.fn(),
}));

describe("getOutputPayload", () => {
  const baseEvent = {
    actionGroup: "testAction",
    apiPath: "/test",
    httpMethod: "GET",
    sessionAttributes: { foo: "bar" },
    promptSessionAttributes: { baz: "qux" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when lambdaEventType returns 'api-gateway' or 'lambda-url'", () => {
    const eventTypes = ["api-gateway", "lambda-url"];
    eventTypes.forEach((eventType) => {
      describe(`for event type "${eventType}"`, () => {
        const event = { ...baseEvent, someOtherProp: "value" };

        beforeEach(() => {
          (lambdaEventType as jest.Mock).mockReturnValue(eventType);
        });

        it("should call lambdaEventType with the given event", () => {
          getOutputPayload(event, "dummy");
          expect(lambdaEventType).toHaveBeenCalledWith(event);
        });

        it("should return a 500 response with error message if response is an Error", () => {
          const error = new Error("Test error");
          const result = getOutputPayload(event, error);
          expect(result).toEqual({
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
          });
        });

        it("should return a 500 response with 'Unknown error' if response is falsy", () => {
          const result = getOutputPayload(event, null);
          expect(result).toEqual({
            statusCode: 500,
            body: JSON.stringify({ error: "Unknown error" }),
          });
        });

        it("should return a 200 response with string body if response is a string", () => {
          const response = "Success!";
          const result = getOutputPayload(event, response);
          expect(result).toEqual({
            statusCode: 200,
            body: response,
          });
        });

        it("should return a 200 response with JSON stringified body if response is an object", () => {
          const response = { data: 123 };
          const result = getOutputPayload(event, response);
          expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify(response),
          });
        });
      });
    });
  });

  describe("when lambdaEventType returns 'bedrock-agent'", () => {
    const eventType = "bedrock-agent";
    const event = { ...baseEvent };
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue(eventType);
    });

    it("should call lambdaEventType with the given event", () => {
      getOutputPayload(event, "dummy");
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });

    it("should return a response with httpStatusCode 500 and error message if response is an Error", () => {
      const error = new Error("Bedrock error");
      const result = getOutputPayload(event, error);
      expect(result).toEqual({
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 500,
        responseBody: {
          "application/json": {
            body: JSON.stringify({ error: error.message }),
          },
        },
      });
    });

    it("should return a response with httpStatusCode 500 and 'Unknown error' if response is falsy", () => {
      const result = getOutputPayload(event, undefined);
      expect(result).toEqual({
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 500,
        responseBody: {
          "application/json": {
            body: JSON.stringify({ error: "Unknown error" }),
          },
        },
      });
    });

    it("should return a successful response with 200 status and string body if response is a string", () => {
      const response = "Bedrock success!";
      const result = getOutputPayload(event, response);
      expect(result).toEqual({
        messageVersion: "1.0",
        response: {
          actionGroup: event.actionGroup,
          apiPath: event.apiPath,
          httpMethod: event.httpMethod,
          httpStatusCode: 200,
          responseBody: {
            "text/plain": {
              body: response,
            },
          },
        },
        sessionAttributes: event.sessionAttributes,
        promptSessionAttributes: event.promptSessionAttributes,
      });
    });

    it("should return a successful response with 200 status and JSON stringified body if response is an object", () => {
      const response = { success: true };
      const result = getOutputPayload(event, response);
      expect(result).toEqual({
        messageVersion: "1.0",
        response: {
          actionGroup: event.actionGroup,
          apiPath: event.apiPath,
          httpMethod: event.httpMethod,
          httpStatusCode: 200,
          responseBody: {
            "text/plain": {
              body: JSON.stringify(response),
            },
          },
        },
        sessionAttributes: event.sessionAttributes,
        promptSessionAttributes: event.promptSessionAttributes,
      });
    });
  });

  describe("when lambdaEventType returns a type not handled explicitly (default branch)", () => {
    const eventType = "custom";
    const event = { customKey: "customValue" };
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue(eventType);
    });

    it("should call lambdaEventType with the given event", () => {
      getOutputPayload(event, "dummy");
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });

    it("should throw the error if response is an Error", () => {
      const error = new Error("Default error");
      expect(() => getOutputPayload(event, error)).toThrow(error);
    });

    it("should return the response as is if response is not an Error", () => {
      const response = { key: "value" };
      const result = getOutputPayload(event, response);
      expect(result).toEqual(response);
    });

    it("should return a falsy response as is (e.g., null)", () => {
      const response = null;
      const result = getOutputPayload(event, response);
      expect(result).toBeNull();
    });
  });
});