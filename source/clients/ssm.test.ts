import { lambdaGetParameter } from "./ssm";

describe("lambdaGetParameter", () => {
  const ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ENV };
  });

  afterAll(() => {
    process.env = ENV; 
  });

  it("returns local value in non-staging/non-production", async () => {
    process.env.NODE_ENV = "local";
    process.env.OPEN_AI_API_KEY = "local_openai_key";

    const resultOpenAI = await lambdaGetParameter("/some/path/KeyOpenAI");
    expect(resultOpenAI).toBe("local_openai_key");

    const resultUnknown = await lambdaGetParameter("unknown_key");
    expect(resultUnknown).toBe("");
  });

  it("returns fetched value in staging/production", async () => {
    const http = require("http");
    const mockedRequest = jest.fn((_options, callback) => {
      const res = {
        on: jest.fn((event, handler) => {
          if (event === "data") {
            handler(JSON.stringify({ Parameter: { Value: "remote_value" } }));
          } else if (event === "end") {
            handler();
          }
        }),
      };
      callback(res);
      return {
        on: jest.fn().mockReturnThis(),
        end: jest.fn(),
      };
    });
    jest.spyOn(http, "request").mockImplementation(mockedRequest);

    process.env.NODE_ENV = undefined;
    process.env.AWS_SESSION_TOKEN = "SomeFakeSessionToken";
    process.env.STACK_NAME = "ApplicationName";
 
    const result = await lambdaGetParameter("/some/path/KeyOpenAI");
    expect(result).toBe("remote_value");

    expect(mockedRequest).toHaveBeenCalledWith(
      {
        path: `/systemsmanager/parameters/get?name=/ApplicationName/some/path/KeyOpenAI&withDecryption=true`,
        port: "2772",
        headers: { "X-Aws-Parameters-Secrets-Token": "SomeFakeSessionToken" },
        method: "GET",
      },
      expect.any(Function)
    );
  });

  it("returns fetched value in staging/production", async () => {
    const http = require("http");
    const mockedRequest = jest.fn((_options, callback) => {
      const res = {
        on: jest.fn((event, handler) => {
          if (event === "data") {
            handler(JSON.stringify({ Parameter: undefined }));
          } else if (event === "end") {
            handler();
          }
        }),
      };
      callback(res);
      return {
        on: jest.fn().mockReturnThis(),
        end: jest.fn(),
      };
    });
    jest.spyOn(http, "request").mockImplementation(mockedRequest);

    process.env.NODE_ENV = "staging";
    process.env.AWS_SESSION_TOKEN = "SomeFakeSessionToken";
    process.env.STACK_NAME = "ApplicationName";

    const result = await lambdaGetParameter("/some/path/KeyOpenAI");
    expect(result).toBe("");

    expect(mockedRequest).toHaveBeenCalledWith(
      {
        path: `/systemsmanager/parameters/get?name=/ApplicationName/some/path/KeyOpenAI&withDecryption=true`,
        port: "2772",
        headers: { "X-Aws-Parameters-Secrets-Token": "SomeFakeSessionToken" },
        method: "GET",
      },
      expect.any(Function)
    );
  });

  it("handles errors in staging/production gracefully", async () => {
    const http = require("http");
    const mockedRequest = jest.fn((_options, _callback) => {
      return {
        on: jest.fn((event, handler) => {
          if (event === "error") {
            handler(new Error("Testing Error"));
          }
          return { on: jest.fn().mockReturnThis(), end: jest.fn() };
        }),
        end: jest.fn(),
      };
    });
    jest.spyOn(http, "request").mockImplementation(mockedRequest);

    process.env.NODE_ENV = "production";
    process.env.AWS_SESSION_TOKEN = "SomeFakeSessionToken";
    process.env.STACK_NAME = "ApplicationName";

    await expect(() => lambdaGetParameter("/some/path/KeyOpenAI")).rejects.toThrow("Testing Error");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});