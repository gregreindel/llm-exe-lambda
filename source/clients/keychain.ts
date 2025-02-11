import { lambdaGetParameter } from "@/clients/ssm";

export class LlmExeKeyChain {
  #keys: Record<string, string> = {};
  setKey(key: string, value: string) {
    this.#keys[key] = value;
  }
  getKey(key: string) {
    return this.#keys[key];
  }
  hasKey(key: string) {
    return !!this.getKey(key);
  }
}

const llmExeKeyChain = new LlmExeKeyChain();

export async function withKey(name: string, attempt = 0): Promise<string> {
    const MAX_TRIES = 3;
    if (llmExeKeyChain.hasKey(`${name}`)) {
      return llmExeKeyChain.getKey(`${name}`);
    }
    const key = await lambdaGetParameter(`Secret/${name}`);
    if (key) {
      llmExeKeyChain.setKey(`${name}`, key);
      return key;
    }
    if (attempt < MAX_TRIES) {
      return withKey(name, attempt + 1);
    }
    throw new Error("Unable to get key");
  }
  