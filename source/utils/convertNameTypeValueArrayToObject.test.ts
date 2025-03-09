import { convertNameTypeValueArrayToObject } from "./convertNameTypeValueArrayToObject";
import { parseNameTypeValueItemValue } from "./parseNameTypeValueItemValue";

jest.mock("./parseNameTypeValueItemValue", () => ({
  parseNameTypeValueItemValue: jest.fn(),
}));

describe("convertNameTypeValueArrayToObject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty object when given an empty array", () => {
    const result = convertNameTypeValueArrayToObject([]);
    expect(result).toEqual({});
  });

  it("should convert a single item correctly and call parseNameTypeValueItemValue with the correct arguments", () => {
    // Arrange
    const input = [
      { name: "age", value: "30", type: "number" },
    ] as any
    (parseNameTypeValueItemValue as jest.Mock).mockReturnValueOnce(30);
    
    // Act
    const result = convertNameTypeValueArrayToObject(input);
    
    // Assert
    expect(parseNameTypeValueItemValue).toHaveBeenCalledTimes(1);
    expect(parseNameTypeValueItemValue).toHaveBeenCalledWith("30", "number");
    expect(result).toEqual({ age: 30 });
  });

  it("should convert multiple items correctly and assign them to the result object", () => {
    // Arrange
    const input = [
      { name: "name", value: "John", type: "string" },
      { name: "active", value: "true", type: "boolean" },
      { name: "score", value: "100", type: "number" },
    ] as any
    (parseNameTypeValueItemValue as jest.Mock)
      .mockReturnValueOnce("John")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(100);

    // Act
    const result = convertNameTypeValueArrayToObject(input);

    // Assert
    expect(parseNameTypeValueItemValue).toHaveBeenCalledTimes(3);
    expect(parseNameTypeValueItemValue).toHaveBeenNthCalledWith(1, "John", "string");
    expect(parseNameTypeValueItemValue).toHaveBeenNthCalledWith(2, "true", "boolean");
    expect(parseNameTypeValueItemValue).toHaveBeenNthCalledWith(3, "100", "number");
    expect(result).toEqual({
      name: "John",
      active: true,
      score: 100,
    });
  });

  it("should use the last parsed value if multiple items with the same name exist", () => {
    // Arrange
    const input = [
      { name: "dup", value: "first", type: "string" },
      { name: "dup", value: "second", type: "string" },
    ] as any
    (parseNameTypeValueItemValue as jest.Mock)
      .mockReturnValueOnce("first_parsed")
      .mockReturnValueOnce("second_parsed");

    // Act
    const result = convertNameTypeValueArrayToObject(input);

    // Assert
    expect(parseNameTypeValueItemValue).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ dup: "second_parsed" });
  });

  it("should assign undefined if parseNameTypeValueItemValue returns undefined", () => {
    // Arrange
    const input = [
      { name: "maybe", value: "??", type: "unknown" },
    ] as any;
    (parseNameTypeValueItemValue as jest.Mock).mockReturnValueOnce(undefined);

    // Act
    const result = convertNameTypeValueArrayToObject(input);

    // Assert
    expect(parseNameTypeValueItemValue).toHaveBeenCalledWith("??", "unknown");
    expect(result).toEqual({ maybe: undefined });
  });
});