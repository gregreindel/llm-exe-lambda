import { assertMessageIsValid } from "./assertMessageIsValid";

describe("assertMessageIsValid", () => {
  it("should return true for a valid string message", () => {
    expect(assertMessageIsValid("Hello")).toBe(true);
  });

  it("should return true for an array of strings", () => {
    expect(assertMessageIsValid(["Hello", "World"])).toBe(true);
  });

  it("should return true for an array of objects with content and role", () => {
    const messageArray = [
      { content: "Hello", role: "greeting" },
      { content: "How are you?", role: "question" },
    ];
    expect(assertMessageIsValid(messageArray)).toBe(true);
  });

  it("should throw an error for an array of mixed types", () => {
    const invalidArray = ["Hello", { content: "How are you?", role: "question" }];
    expect(() => assertMessageIsValid(invalidArray)).toThrow("Invalid format");
  });

  it("should throw an error for a non-string, non-array input", () => {
    expect(() => assertMessageIsValid(123)).toThrow("Invalid format");
  });

  it("should throw an error for an array of objects missing content", () => {
    const invalidArray = [
      { content: "Hello", role: "greeting" },
      { role: "question" },
    ];
    expect(() => assertMessageIsValid(invalidArray)).toThrow("Invalid format");
  });

  it("should throw an error for an array of objects missing role", () => {
    const invalidArray = [
      { content: "How are you?", role: "question" },
      { content: "Hello" },
    ];
    expect(() => assertMessageIsValid(invalidArray)).toThrow("Invalid format");
  });

  it("should return true for empty string input (considered valid string)", () => {
    expect(assertMessageIsValid("")).toBe(true);
  });

  it("should return true for an empty array", () => {
    expect(assertMessageIsValid([])).toBe(true);
  });
});