const http = require("http");
import { unLeadingSlashIt } from "@/utils/slashes";

export async function lambdaGetParameter(name: string): Promise<string> {
  const {
    NODE_ENV = "undefined",
    STACK_NAME,
    AWS_SESSION_TOKEN,
    PARAMETERS_SECRETS_EXTENSION_HTTP_PORT = "2772",
  } = process.env;

  if (["local"].includes(NODE_ENV)) {
    const [key] = unLeadingSlashIt(name).split("/").reverse();
    const map: any = {
      KeyOpenAI: process.env.OPEN_AI_API_KEY,
      KeyAnthropic: process.env.ANTHROPIC_API_KEY,
      KeyXAI: process.env.ANTHROPIC_API_KEY,
    };
    return map[key] || "";
  }

  return new Promise((resolve, reject) => {
    const headers: any = {
      "X-Aws-Parameters-Secrets-Token": AWS_SESSION_TOKEN,
    };

    const forcePath = `/${STACK_NAME}/`;

    const req = http
      .request(
        {
          path: `/systemsmanager/parameters/get?name=${forcePath}${unLeadingSlashIt(
            name
          )}&withDecryption=true`,
          port: PARAMETERS_SECRETS_EXTENSION_HTTP_PORT,
          headers,
          method: "GET",
        },
        (res: any) => {
          let data = "";
          res.on("data", (chunk: any) => {
            data += chunk;
          });
          res.on("end", () => {
            const response = JSON.parse(data);
            return resolve(response?.Parameter?.Value || "");
          });
        }
      )
      .on("error", (e: any) => {
        return reject(e);
      });

    req.end();
  });
}
