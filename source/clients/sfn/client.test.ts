process.env.DEPLOY_REGION = "us-east-1";

import { sfnClient } from "./client";
import { SFNClient } from "@aws-sdk/client-sfn";

describe("lambdaClient Initialization", () => {
  beforeAll(() => {
    process.env.DEPLOY_REGION = "us-east-1";
  });

  test("should create LambdaClient instance with correct region", async () => {
    expect(sfnClient).toBeInstanceOf(SFNClient);
    const region = await sfnClient.config.region(); // <- note parentheses here!
    expect(region).toBe("us-east-1");
  });
});