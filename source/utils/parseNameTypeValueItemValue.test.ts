import { parseNameTypeValueItemValue } from "./parseNameTypeValueItemValue"; // update the path accordingly

describe("parseNameTypeValueItemValue", () => {
  describe("when value is null or undefined", () => {
    it("should return 0 for type 'number'", () => {
      expect(parseNameTypeValueItemValue(null, "number")).toBe(0);
      expect(parseNameTypeValueItemValue(undefined, "number")).toBe(0);
    });

    it("should return false for type 'boolean'", () => {
      expect(parseNameTypeValueItemValue(null, "boolean")).toBe(false);
      expect(parseNameTypeValueItemValue(undefined, "boolean")).toBe(false);
    });

    it("should return null for type 'date'", () => {
      expect(parseNameTypeValueItemValue(null, "date")).toBeNull();
      expect(parseNameTypeValueItemValue(undefined, "date")).toBeNull();
    });

    it("should return null for type 'json'", () => {
      expect(parseNameTypeValueItemValue(null, "json")).toBeNull();
      expect(parseNameTypeValueItemValue(undefined, "json")).toBeNull();
    });

    it("should return empty string for type 'string' or unknown types", () => {
      expect(parseNameTypeValueItemValue(null, "string")).toBe("");
      expect(parseNameTypeValueItemValue(undefined, "string")).toBe("");

      // Unknown types fall into default case in the null branch
      expect(parseNameTypeValueItemValue(null, "unknown" as any)).toBe("");
      expect(parseNameTypeValueItemValue(undefined, "unknown" as any)).toBe("");
    });
  });

  describe("when value is not null or undefined", () => {
    const spacesAround = (str: string) => `  ${str}  `;
    
    it("should trim and return the string for type 'string'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("hello"), "string")).toBe("hello");
    });

    it("should convert valid numeric strings to numbers for type 'number'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("42"), "number")).toBe(42);
      expect(parseNameTypeValueItemValue(" 3.1415 ", "number")).toBeCloseTo(3.1415);
    });

    it("should return 0 for invalid numbers for type 'number'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("abc"), "number")).toBe(0);
      expect(parseNameTypeValueItemValue("nan", "number")).toBe(0);
    });

    it("should convert a string to a boolean for type 'boolean'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("true"), "boolean")).toBe(true);
      expect(parseNameTypeValueItemValue("TRUE", "boolean")).toBe(true);
      expect(parseNameTypeValueItemValue("TrUe", "boolean")).toBe(true);
      expect(parseNameTypeValueItemValue(spacesAround("false"), "boolean")).toBe(false);
      expect(parseNameTypeValueItemValue("random", "boolean")).toBe(false);
    });

    it("should convert valid date strings to Date object for type 'date'", () => {
      const dateString = "2022-01-01T00:00:00Z";
      const result = parseNameTypeValueItemValue(spacesAround(dateString), "date");
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).toISOString()).toBe(new Date(dateString).toISOString());
    });

    it("should return null for invalid date strings for type 'date'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("not a date"), "date")).toBeNull();
    });

    it("should parse valid JSON strings for type 'json'", () => {
      const jsonString = '{ "a": 1, "b": "text" }';
      const result = parseNameTypeValueItemValue(spacesAround(jsonString), "json");
      expect(result).toEqual({ a: 1, b: "text" });
    });

    it("should return null for invalid JSON strings for type 'json'", () => {
      expect(parseNameTypeValueItemValue(spacesAround("not json"), "json")).toBeNull();
    });

    it("should return trimmed value for unknown types", () => {
      const value = "  some random value  ";
      expect(parseNameTypeValueItemValue(value, "unknown" as any)).toBe("some random value");
    });
  });
});