import { parsePromptForTokens } from "./parsePromptForTokens";
import { parseWithoutProcessing } from "@handlebars/parser";
import { extractHbsAttributeNamesFromString } from "./extractHbsAttributeNamesFromString";

jest.mock("@handlebars/parser", () => ({
  parseWithoutProcessing: jest.fn(),
}));

jest.mock("./extractHbsAttributeNamesFromString", () => ({
  extractHbsAttributeNamesFromString: jest.fn(),
}));

describe("parsePromptForTokens", () => {
  const inputString = "some input string";
  const fakeBody = "fakeBody";
  const fakeAttributes = ["attr1", "attr2"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call parseWithoutProcessing with the input string", () => {
    // Arrange: mock return value for parseWithoutProcessing
    (parseWithoutProcessing as jest.Mock).mockReturnValue({ body: fakeBody });
    (extractHbsAttributeNamesFromString as jest.Mock).mockReturnValue(fakeAttributes);
    
    // Act:
    const result = parsePromptForTokens(inputString);
    
    // Assert:
    expect(parseWithoutProcessing).toHaveBeenCalledWith(inputString);
    expect(result).toEqual(fakeAttributes);
  });

  it("should pass the extracted body to extractHbsAttributeNamesFromString", () => {
    // Arrange:
    (parseWithoutProcessing as jest.Mock).mockReturnValue({ body: fakeBody });
    (extractHbsAttributeNamesFromString as jest.Mock).mockReturnValue(fakeAttributes);

    // Act:
    parsePromptForTokens(inputString);

    // Assert:
    expect(extractHbsAttributeNamesFromString).toHaveBeenCalledWith(fakeBody);
  });

  it("should work even if parseWithoutProcessing returns an empty body", () => {
    // Arrange: simulate empty body
    (parseWithoutProcessing as jest.Mock).mockReturnValue({ body: "" });
    (extractHbsAttributeNamesFromString as jest.Mock).mockReturnValue([]);
    
    // Act:
    const result = parsePromptForTokens(inputString);
    
    // Assert:
    expect(parseWithoutProcessing).toHaveBeenCalledWith(inputString);
    expect(extractHbsAttributeNamesFromString).toHaveBeenCalledWith("");
    expect(result).toEqual([]);
  });

  it("should propagate errors thrown by parseWithoutProcessing", () => {
    // Arrange: simulate error from parseWithoutProcessing
    const error = new Error("parse error");
    (parseWithoutProcessing as jest.Mock).mockImplementation(() => { throw error; });
    
    // Act && Assert:
    expect(() => parsePromptForTokens(inputString)).toThrow("parse error");
  });

  it("should propagate errors thrown by extractHbsAttributeNamesFromString", () => {
    // Arrange:
    (parseWithoutProcessing as jest.Mock).mockReturnValue({ body: fakeBody });
    const error = new Error("extract error");
    (extractHbsAttributeNamesFromString as jest.Mock).mockImplementation(() => { throw error; });
    
    // Act && Assert:
    expect(() => parsePromptForTokens(inputString)).toThrow("extract error");
  });

  it("should handle non-string body values gracefully", () => {
    // Arrange: simulate a case where parseWithoutProcessing returns a non-string body (like null)
    (parseWithoutProcessing as jest.Mock).mockReturnValue({ body: null });
    (extractHbsAttributeNamesFromString as jest.Mock).mockReturnValue(fakeAttributes);
    
    // Act:
    const result = parsePromptForTokens(inputString);
    
    // Assert: We expect the function to simply pass null along to extractHbsAttributeNamesFromString
    expect(extractHbsAttributeNamesFromString).toHaveBeenCalledWith(null);
    expect(result).toEqual(fakeAttributes);
  });
});