import { InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./client";

export const invokeFunction = async (params: InvokeCommandInput) => {
  const { Payload, FunctionError } = await lambdaClient.send(
    new InvokeCommand(params)
  );
  if (Payload) {
    const decoded = new TextDecoder("utf-8").decode(Payload);
    try {
      const result = JSON.parse(decoded);
      return result;
    } catch (_e) {
      return decoded;
    }
  } else if (FunctionError) {
    throw new Error(FunctionError);
  }
  throw new Error("Unknown Function Error");
};
