import { getLlmExeHandlerInput } from "./getLlmExeHandlerInput";
import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { getS3ObjectAsJsonWithLocal } from "@/utils/getS3ObjectAsJsonWithLocal";
import { parseDialogue } from "@/utils/parseDialogue";
import { parseFrontmatter } from "@/utils/parseFrontmatter";

jest.mock("@/utils/getContentFromUrl", () => ({
  getContentFromUrl: jest.fn(),
}));

jest.mock("@/utils/getS3ObjectAsJsonWithLocal", () => ({
  getS3ObjectAsJsonWithLocal: jest.fn(),
}));

jest.mock("@/utils/parseDialogue", () => ({
  parseDialogue: jest.fn(),
}));

jest.mock("@/utils/parseFrontmatter", () => ({
  parseFrontmatter: jest.fn(),
}));

describe("getLlmExeHandlerInput", () => {
  const defaults = { output: "string" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns merged object from S3 when event has key and bucket", async () => {
    const event = { key: "someKey", bucket: "someBucket", version: "v1" };
    const loaded = {};
    (getS3ObjectAsJsonWithLocal as jest.Mock).mockResolvedValueOnce(loaded);

    const result = await getLlmExeHandlerInput(event);
    expect(getS3ObjectAsJsonWithLocal).toHaveBeenCalledWith("someKey", "someBucket", "v1");
    expect(result).toEqual({ ...defaults, ...loaded });
  });

  it("parses JSON content when event has url and loaded content starts with '{'", async () => {
    const event = { url: "http://example.com/data" };
    const jsonContent = '{"b":2,"info":"jsonData"}';
    (getContentFromUrl as jest.Mock).mockResolvedValueOnce(jsonContent);

    const result = await getLlmExeHandlerInput(event);
    expect(getContentFromUrl).toHaveBeenCalledWith("http://example.com/data");
    expect(result).toEqual({ ...defaults });
  });

  it("processes frontmatter and assigns body when event has url and loaded content does not start with '{' and dialogue is empty", async () => {
    const event = { url: "http://example.com/text" };
    const loadedContent = "plain text content";
    (getContentFromUrl as jest.Mock).mockResolvedValueOnce(loadedContent);
    // Mock parseFrontmatter to return a body and some attributes (which are ignored due to empty pick keys)
    (parseFrontmatter as jest.Mock).mockReturnValueOnce({
      body: loadedContent,
      attributes: { unused: "value" },
    });
    // Mock parseDialogue to return an empty array
    (parseDialogue as jest.Mock).mockReturnValueOnce([]);

    const result = await getLlmExeHandlerInput(event);
    expect(getContentFromUrl).toHaveBeenCalledWith("http://example.com/text");
    expect(parseFrontmatter).toHaveBeenCalledWith(loadedContent);
    expect(parseDialogue).toHaveBeenCalledWith(loadedContent);
    expect(result).toEqual({ ...defaults, message: loadedContent });
  });

  it("processes frontmatter and assigns dialogue when event has url and loaded content does not start with '{' and dialogue exists", async () => {
    const event = { url: "http://example.com/text" };
    const loadedContent = "dialogue text content";
    (getContentFromUrl as jest.Mock).mockResolvedValueOnce(loadedContent);
    // Mock parseFrontmatter to return a body and some attributes (attributes will be ignored)
    (parseFrontmatter as jest.Mock).mockReturnValueOnce({
      body: loadedContent,
      attributes: { ignored: "value" },
    });
    // Mock parseDialogue to return a non-empty array
    const dialogueResult = ["line1", "line2"];
    (parseDialogue as jest.Mock).mockReturnValueOnce(dialogueResult);

    const result = await getLlmExeHandlerInput(event);
    expect(getContentFromUrl).toHaveBeenCalledWith("http://example.com/text");
    expect(parseFrontmatter).toHaveBeenCalledWith(loadedContent);
    expect(parseDialogue).toHaveBeenCalledWith(loadedContent);
    expect(result).toEqual({ ...defaults, message: dialogueResult });
  });

  it("merges event with defaults when event does not contain S3 keys or url", async () => {
    const event = { };
    const result = await getLlmExeHandlerInput(event);
    expect(result).toEqual({ ...defaults, ...event });
  });
});