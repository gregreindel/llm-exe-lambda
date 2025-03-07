import { getInputPath } from "./getInputPath";
import { lambdaEventType } from "@/utils/lambdaEventType";

jest.mock("@/utils/lambdaEventType", () => ({
  lambdaEventType: jest.fn(),
}));

describe("getInputPath", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when event type is 'api-gateway'", () => {
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue("api-gateway");
    });

    it("should return event.path if it is a string", () => {
      const event = { path: "/api/test" };
      const result = getInputPath(event);
      expect(result).toBe("/api/test");
    });

    it("should return an empty string if event.path is not a string", () => {
      const event = { path: 1234 };
      const result = getInputPath(event);
      expect(result).toBe("");
    });

    it("should return an empty string if event.path is undefined", () => {
      const event = {};
      const result = getInputPath(event);
      expect(result).toBe("");
    });
  });

  describe("when event type is 'lambda-url'", () => {
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue("lambda-url");
    });

    it("should return event.rawPath if it is a string", () => {
      const event = { rawPath: "/lambda/test" };
      const result = getInputPath(event);
      expect(result).toBe("/lambda/test");
    });

    it("should return an empty string if event.rawPath is not a string", () => {
      const event = { rawPath: {} };
      const result = getInputPath(event);
      expect(result).toBe("");
    });

    it("should return an empty string if event.rawPath is undefined", () => {
      const event = {};
      const result = getInputPath(event);
      expect(result).toBe("");
    });
  });

  describe("when event type is 'bedrock'", () => {
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue("bedrock");
    });

    it("should return agent.path if it is a string", () => {
      const event = { agent: { path: "/bedrock/test" } };
      const result = getInputPath(event);
      expect(result).toBe("/bedrock/test");
    });

    it("should return an empty string if agent.path is not a string", () => {
      const event = { agent: { path: 404 } };
      const result = getInputPath(event);
      expect(result).toBe("");
    });

    it("should return an empty string if agent is missing", () => {
      const event = {};
      const result = getInputPath(event);
      expect(result).toBe("");
    });
  });

  describe("when event type is unknown", () => {
    beforeEach(() => {
      (lambdaEventType as jest.Mock).mockReturnValue("unknown");
    });

    it("should return an empty string regardless of event structure", () => {
      const event = { path: "/should/not/be/used", rawPath: "/neither/this", agent: { path: "/nor/this" } };
      const result = getInputPath(event);
      expect(result).toBe("");
    });
  });
});