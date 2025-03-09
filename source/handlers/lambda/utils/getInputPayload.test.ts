import { getInputPayload } from "./getInputPayload";
import { lambdaEventType } from "@/utils/lambdaEventType";
import { getBedrockAgentPayload } from "./getBedrockAgentPayload";

jest.mock("@/utils/lambdaEventType", () => ({
  lambdaEventType: jest.fn(),
}));

jest.mock("./getBedrockAgentPayload", () => ({
  getBedrockAgentPayload: jest.fn(),
}));

describe("getInputPayload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("api-gateway event", () => {
    it("should parse JSON body and return the parsed object", () => {
      const eventBodyObj = { key: "value" };
      const event = { body: JSON.stringify(eventBodyObj) };
      (lambdaEventType as jest.Mock).mockReturnValue("api-gateway");

      const result = getInputPayload(event);
      expect(result).toEqual(eventBodyObj);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });

    it("should throw an error if JSON body is invalid", () => {
      const event = { body: "invalid_json" };
      (lambdaEventType as jest.Mock).mockReturnValue("api-gateway");

      expect(() => getInputPayload(event)).toThrow();
    });
  });

  describe("s3 event", () => {
    it("should return the s3 payload from the first record", () => {
      const s3Payload = { bucket: "myBucket", key: "myKey" };
      const event = { Records: [{ s3: s3Payload }] };
      (lambdaEventType as jest.Mock).mockReturnValue("s3");

      const result = getInputPayload(event);
      expect(result).toEqual(s3Payload);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });
  });

  describe("sns event", () => {
    it("should return the SNS Message from the first record", () => {
      const snsMessage = { text: "hello" };
      const event = { Records: [{ Sns: { Message: snsMessage } }] };
      (lambdaEventType as jest.Mock).mockReturnValue("sns");

      const result = getInputPayload(event);
      expect(result).toEqual(snsMessage);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });
  });

  describe("sqs event", () => {
    it("should return the body from the first record", () => {
      const bodyPayload = { some: "data" };
      const event = { Records: [{ body: bodyPayload }] };
      (lambdaEventType as jest.Mock).mockReturnValue("sqs");

      const result = getInputPayload(event);
      expect(result).toEqual(bodyPayload);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });
  });

  describe("bedrock-agent event", () => {
    it("should return a normalized object including bedrock agent payload and provided values", () => {
      const agentPayload = { agentKey: "agentValue" };
      (getBedrockAgentPayload as jest.Mock).mockReturnValue(agentPayload);
      const event = {
        inputText: "Test input",
        sessionAttributes: { attr1: "value1" },
        promptSessionAttributes: { promptAttr: "valuePrompt" },
      };
      (lambdaEventType as jest.Mock).mockReturnValue("bedrock-agent");

      const result = getInputPayload(event);
      expect(result).toEqual({
        data: {
          ...agentPayload,
          inputText: "Test input",
          sessionAttributes: { attr1: "value1" },
          promptSessionAttributes: { promptAttr: "valuePrompt" },
        },
      });
      expect(getBedrockAgentPayload).toHaveBeenCalledWith(event);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });

    it("should use default values if inputText, sessionAttributes, or promptSessionAttributes are not provided", () => {
      const agentPayload = { agentKey: "agentValue" };
      (getBedrockAgentPayload as jest.Mock).mockReturnValue(agentPayload);
      const event = {};
      (lambdaEventType as jest.Mock).mockReturnValue("bedrock-agent");

      const result = getInputPayload(event);
      expect(result).toEqual({
        data: {
          ...agentPayload,
          inputText: "",
          sessionAttributes: {},
          promptSessionAttributes: {},
        },
      });
      expect(getBedrockAgentPayload).toHaveBeenCalledWith(event);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });
  });

  describe("lambda-url event", () => {
    it("should parse JSON body and return the parsed object", () => {
      const eventBodyObj = { lambda: "urlEvent" };
      const event = { body: JSON.stringify(eventBodyObj) };
      (lambdaEventType as jest.Mock).mockReturnValue("lambda-url");

      const result = getInputPayload(event);
      expect(result).toEqual(eventBodyObj);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });

    it("should throw an error if JSON body is invalid", () => {
      const event = { body: "not_valid_json" };
      (lambdaEventType as jest.Mock).mockReturnValue("lambda-url");

      expect(() => getInputPayload(event)).toThrow();
    });
  });

  describe("default event type", () => {
    it("should return the unmodified event if type is unrecognized", () => {
      const event = { random: "data" };
      (lambdaEventType as jest.Mock).mockReturnValue("unknown-type");

      const result = getInputPayload(event);
      expect(result).toEqual(event);
      expect(lambdaEventType).toHaveBeenCalledWith(event);
    });
  });
});
