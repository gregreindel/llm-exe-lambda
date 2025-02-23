const jsYaml = require("js-yaml");
import { parseFrontmatter, computeLocation, parse } from "./parseFrontmatter";

jest.mock("js-yaml", () => ({
  load: jest.fn(),
}));

const loadMock = jsYaml.load as jest.Mock;

describe("parseFrontmatter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns default object when frontmatter marker is not present", () => {
    const input = "This is a body without frontmatter.";
    const result = parseFrontmatter(input);
    expect(result).toEqual({
      attributes: {},
      body: input,
      bodyBegin: 1,
    });
  });

  it("delegates to parse when the first line is a frontmatter marker (---)", () => {
    loadMock.mockReturnValue({ title: "Hello" });
    const input =
      "---\n" +
      "title: Hello\n" +
      "---\n" +
      "This is the body content.";
    const result = parseFrontmatter(input);
    // expect that frontmatter was parsed
    expect(result).toHaveProperty("attributes", { title: "Hello" });
    expect(result).toHaveProperty("body", "This is the body content.");
    // bodyBegin should be computed (non-zero integer)
    expect(typeof result.bodyBegin).toBe("number");
    expect(result).toHaveProperty("frontmatter", "title: Hello");
  });

  it("delegates to parse when the first line is a frontmatter marker (= yaml =)", () => {
    loadMock.mockReturnValue({ key: "value" });
    const input =
      "= yaml =\n" +
      "key: value\n" +
      "= yaml =\n" +
      "Remaining content.";
    const result = parseFrontmatter(input);
    expect(result).toHaveProperty("attributes", { key: "value" });
    expect(result).toHaveProperty("body", "Remaining content.");
    expect(typeof result.bodyBegin).toBe("number");
    expect(result).toHaveProperty("frontmatter", "key: value");
  });
});

describe("computeLocation", () => {
  it("returns the correct line number when a newline is found after the offset", () => {
    // Create a fake match object.
    // Let match[0] be "line1\nline2\n" starting at index 0.
    const fakeMatch: RegExpExecArray = ["line1\nline2\n"] as any;
    fakeMatch.index = 0;
    // Body with three lines:
    const body = "line1\nline2\nline3\nline4";
    // fakeMatch[0].length === "line1\nline2\n".length === 12.
    // Newlines: first newline at pos = 5, second newline at pos = 11, third newline at pos = 17.
    // offset = 0 + 12 = 12, so the loop:
    // pos = 5 (< 12) then line becomes 2; next pos = 11 (< 12) then line becomes 3; next pos = 17 (>= 12) so returns 3.
    const lineNumber = computeLocation(fakeMatch, body);
    expect(lineNumber).toBe(3);
  });

  it("returns 1 when there is no newline in the body", () => {
    const fakeMatch: RegExpExecArray = ["abc"] as any;
    fakeMatch.index = 0;
    const body = "abc";
    const lineNumber = computeLocation(fakeMatch, body);
    expect(lineNumber).toBe(1);
  });
});

describe("parse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns default object when no frontmatter is detected", () => {
    // use a string that does not match the regex
    const input = "No frontmatter exists here.";
    // Since the regex won't match, parse should return default object.
    const result = parse(input);
    expect(result).toEqual({
      attributes: {},
      body: input,
      bodyBegin: 1,
    });
  });

  it("parses a frontmatter block and extracts YAML content and body", () => {
    const yamlContent = "title: Test Document\nauthor: Me";
    const fmMarker = "---";
    const frontmatterBlock = `${fmMarker}\n${yamlContent}\n${fmMarker}\n`;
    const bodyContent = "This is the main content of the document.";
    const input = frontmatterBlock + bodyContent;
    loadMock.mockReturnValue({ title: "Test Document", author: "Me" });

    const result = parse(input);

    // The returned frontmatter should be the trimmed YAML content.
    expect(result.frontmatter).toBe(yamlContent);
    expect(result.attributes).toEqual({ title: "Test Document", author: "Me" });
    // The body should be the input with the frontmatter block removed.
    expect(result.body).toBe(bodyContent);
    // Compute the expected bodyBegin (line number where body starts)
    // In this input, the frontmatter block (frontmatterBlock) contains 3 newlines.
    // The computeLocation function computes number of newlines encountered until offset.
    // Since frontmatterBlock ends at the newline after the second marker, the body should begin on line 4.
    expect(result.bodyBegin).toBe(4);
  });

  it("handles YAML content with extra whitespace", () => {
    const yamlContent = "   key: value   ";
    const fmMarker = "= yaml =";
    const frontmatterBlock = `${fmMarker}\n${yamlContent}\n${fmMarker}\n`;
    const bodyContent = "Content after frontmatter.";
    const input = frontmatterBlock + bodyContent;
    // loadMock should receive the trimmed YAML.
    loadMock.mockReturnValue({ key: "value" });

    const result = parse(input);
    expect(result.frontmatter).toBe("key: value");
    expect(result.attributes).toEqual({ key: "value" });
    expect(result.body).toBe(bodyContent);
    // frontmatterBlock has 3 newlines, so body should start on line 4.
    expect(result.bodyBegin).toBe(4);
  });

  it("returns an empty attributes object if YAML loading returns a falsy value", () => {
    const yamlContent = "invalid: yaml";
    const fmMarker = "---";
    const frontmatterBlock = `${fmMarker}\n${yamlContent}\n${fmMarker}\n`;
    const bodyContent = "Rest of the document.";
    const input = frontmatterBlock + bodyContent;
    // Simulate parser.load returning null or undefined.
    loadMock.mockReturnValue(null);

    const result = parse(input);
    expect(result.attributes).toEqual({});
    expect(result.body).toBe(bodyContent);
    // frontmatter block consumes 3 lines: bodyBegin should be 4.
    expect(result.bodyBegin).toBe(4);
    expect(result.frontmatter).toBe(yamlContent);
  });
});