import { makeObjectSchemaFromAttributeNames } from "./makeObjectSchemaFromAttributeNames";

describe("makeObjectSchemaFromAttributeNames", () => {
  it("should return a valid object schema when given an empty array", () => {
    const names: string[] = [];
    const schema = makeObjectSchemaFromAttributeNames(names);
    expect(schema).toEqual({
      type: "object",
      properties: {},
      required: [],
    });
  });

  it("should return a valid object schema when given one attribute", () => {
    const names = ["username"];
    const schema = makeObjectSchemaFromAttributeNames(names);
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(names);
    expect(schema.properties).toHaveProperty("username", { type: "string" });
  });

  it("should return a valid object schema when given multiple attributes", () => {
    const names = ["username", "password", "email"];
    const schema = makeObjectSchemaFromAttributeNames(names);
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(names);
    names.forEach((name) => {
      expect(schema.properties).toHaveProperty(name, { type: "string" });
    });
  });

  it("should handle duplicate attribute names gracefully", () => {
    const names = ["name", "name"];
    const schema = makeObjectSchemaFromAttributeNames(names);
    // Even though the required array contains duplicates,
    // properties will only have one entry for the duplicate key.
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(names);
    expect(Object.keys(schema.properties)).toEqual(["name"]);
    expect(schema.properties["name"]).toEqual({ type: "string" });
  });

  it("should work properly if attribute names include empty strings", () => {
    const names = ["", "nonEmpty"];
    const schema = makeObjectSchemaFromAttributeNames(names);
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(names);
    expect(schema.properties).toHaveProperty("", { type: "string" });
    expect(schema.properties).toHaveProperty("nonEmpty", { type: "string" });
  });

  describe("invalid inputs", () => {
    it("should throw a TypeError when null is passed", () => {
      // @ts-expect-error: testing runtime behavior with invalid type
      expect(() => makeObjectSchemaFromAttributeNames(null)).toThrow(TypeError);
    });

    it("should throw a TypeError when undefined is passed", () => {
      // @ts-expect-error: testing runtime behavior with invalid type
      expect(() => makeObjectSchemaFromAttributeNames(undefined)).toThrow(TypeError);
    });

    it("should throw a TypeError when a non-array value is passed", () => {
      // @ts-expect-error: testing runtime behavior with invalid type
      expect(() => makeObjectSchemaFromAttributeNames("not an array")).toThrow("Expected an array of attribute names");
    });
  });
});

