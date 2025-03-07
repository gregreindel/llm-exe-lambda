import {
  LambdaClient,
  InvokeCommand,
  InvokeCommandInput,
} from "@aws-sdk/client-lambda";

const { DEPLOY_REGION } = process.env;

export const lambdaClient = new LambdaClient({
  region: DEPLOY_REGION,
});

export const lambdaClientInvoke = async (params: InvokeCommandInput) => {
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
