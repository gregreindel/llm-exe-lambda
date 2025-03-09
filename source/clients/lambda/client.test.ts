process.env.DEPLOY_REGION = "us-east-1";

import { lambdaClient } from "./client";
import { LambdaClient } from "@aws-sdk/client-lambda";

describe("lambdaClient Initialization", () => {
  beforeAll(() => {
    process.env.DEPLOY_REGION = "us-east-1";
  });

  test("should create LambdaClient instance with correct region", async () => {
    expect(lambdaClient).toBeInstanceOf(LambdaClient);
    const region = await lambdaClient.config.region(); // <- note parentheses here!
    expect(region).toBe("us-east-1");
  });
});