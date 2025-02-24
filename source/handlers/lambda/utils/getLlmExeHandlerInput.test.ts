import { getLlmExeHandlerInput } from "./getLlmExeHandlerInput";

import { getContentFromUrl } from "@/utils/getContentFromUrl";
import { parseDialogue } from "@/utils/parseDialogue";
import { parseFrontmatter } from "@/utils/parseFrontmatter";
import { getInputAllowedProperties } from "./getInputAllowedProperties";

jest.mock("@/utils/getContentFromUrl", () => ({
  getContentFromUrl: jest.fn(),
}));

jest.mock("@/utils/parseDialogue", () => ({
  parseDialogue: jest.fn(),
}));

jest.mock("@/utils/parseFrontmatter", () => ({
  parseFrontmatter: jest.fn(),
}));

jest.mock("./getInputAllowedProperties", () => ({
  getInputAllowedProperties: jest.fn((input) => input),
}));

describe("getLlmExeHandlerInput", () => {
  const mockGetContentFromUrl = getContentFromUrl as jest.Mock;
  const mockParseDialogue = parseDialogue as jest.Mock;
  const mockParseFrontmatter = parseFrontmatter as jest.Mock;
  const mockGetInputAllowedProperties = getInputAllowedProperties as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("should return allowed properties when event does not have url", async () => {
    const event = { foo: "bar" };
    const result = await getLlmExeHandlerInput(event);
    expect(mockGetInputAllowedProperties).toHaveBeenCalledWith({
      output: "string",
      foo: "bar",
    });
    expect(result).toEqual({ output: "string", foo: "bar" });
  });

  it("should parse JSON content from url and return allowed properties", async () => {
    const event = { url: "http://example.com/data", additional: "value" };
    // JSON branch: since loaded starts with '{'
    const jsonContent =
      '{"provider": "test", "model": "gpt", "output": "json", "schema": {}, "data": "info"}';
    mockGetContentFromUrl.mockResolvedValueOnce(jsonContent);
    const result = await getLlmExeHandlerInput(event);
    // In JSON branch, the rest of event (additional) is ignored.
    expect(mockGetInputAllowedProperties).toHaveBeenCalledWith({
      output: "json",
      provider: "test",
      model: "gpt",
      schema: {},
      data: "info",
    });
    expect(result).toEqual({
      output: "json",
      provider: "test",
      model: "gpt",
      schema: {},
      data: "info",
    });
  });

  it("should throw an error when JSON parsing fails", async () => {
    const event = { url: "http://example.com/data" };
    // Invalid JSON (missing closing brace)
    const invalidJson = '{"provider": "test"';
    mockGetContentFromUrl.mockResolvedValueOnce(invalidJson);
    await expect(getLlmExeHandlerInput(event)).rejects.toThrowError(
      `Failed to parse JSON from ${event.url}`
    );
    expect(mockGetInputAllowedProperties).not.toHaveBeenCalled();
  });

  it("should parse non-JSON content with frontmatter and empty dialogue returning message as body", async () => {
    const event = { url: "http://example.com/text", extra: "payload" };
    const content = "Some non-json content";
    mockGetContentFromUrl.mockResolvedValueOnce(content);
    const frontmatterResult = {
      body: "This is a message body.",
      attributes: {
        provider: "fmProvider",
        model: "fmModel",
        output: "fmOutput",
        schema: { key: "value" },
        data: "fmData",
        ignored: "shouldBeIgnored",
      },
    };
    mockParseFrontmatter.mockReturnValueOnce(frontmatterResult);
    mockParseDialogue.mockReturnValueOnce([]);
    const result = await getLlmExeHandlerInput(event);
    // pick(...) will select only provider, model, output, schema, data from attributes
    const parsedAttributes = {
      provider: "fmProvider",
      model: "fmModel",
      output: "fmOutput",
      schema: { key: "value" },
      data: "fmData",
    };
    // Since parseDialogue returned empty, message is set to body.
    // const mergedPayload = Object.assign(
    //   {},
    //   { output: "string" },
    //   event, // note: in this branch, event minus url is used as restOfPayload
    //   parsedAttributes,
    //   { message: frontmatterResult.body }
    // );
    // However, the code separates event into {url, ...restOfPayload} so extra: "payload" is merged.
    // And url is not passed.
    const expectedPayload = Object.assign(
      {},
      { output: "string" },
      { extra: "payload" },
      parsedAttributes,
      { message: frontmatterResult.body }
    );
    expect(mockParseFrontmatter).toHaveBeenCalledWith(content);
    expect(mockParseDialogue).toHaveBeenCalledWith(frontmatterResult.body);
    expect(mockGetInputAllowedProperties).toHaveBeenCalledWith(expectedPayload);
    expect(result).toEqual(expectedPayload);
  });

  it("should parse non-JSON content with frontmatter and non-empty dialogue returning message as dialogue array", async () => {
    const event = { url: "http://example.com/text" };
    const content = "Another non-json content";
    mockGetContentFromUrl.mockResolvedValueOnce(content);
    const frontmatterResult = {
      body: "Dialogue content here.",
      attributes: {
        provider: "dialogueProvider",
        model: "dialogueModel",
        output: "dialogueOutput",
        schema: { a: 1 },
        data: "dialogueData",
      },
    };
    mockParseFrontmatter.mockReturnValueOnce(frontmatterResult);
    const dialogueArray = ["Line 1", "Line 2"];
    mockParseDialogue.mockReturnValueOnce(dialogueArray);
    const result = await getLlmExeHandlerInput(event);
    const parsedAttributes = {
      provider: "dialogueProvider",
      model: "dialogueModel",
      output: "dialogueOutput",
      schema: { a: 1 },
      data: "dialogueData",
    };
    const mergedPayload = Object.assign(
      {},
      { output: "string" },
      {}, // restOfPayload is empty because event only had url
      parsedAttributes,
      { message: dialogueArray }
    );
    expect(mockParseFrontmatter).toHaveBeenCalledWith(content);
    expect(mockParseDialogue).toHaveBeenCalledWith(frontmatterResult.body);
    expect(mockGetInputAllowedProperties).toHaveBeenCalledWith(mergedPayload);
    expect(result).toEqual(mergedPayload);
  });
});